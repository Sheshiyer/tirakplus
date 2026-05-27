// booking-store.ts — KV-backed persistence for Pass H (2026-05-27).
//
// Mirrors src/worker/account-store.ts (Pass E) in style: optional KV binding,
// graceful no-ops when KV is undefined, try/catch around every put/get/delete
// so the UI keeps loading even if the namespace is missing in local dev.
//
// Key layout (all keys lowercase the email):
//   booking:{inquiryId}                              → BookingRecord
//   booking:traveller:{lowercase-email}:inquiries    → string[] (capped 50, newest first)
//   booking:companion:{lowercase-email}:inquiries    → string[] (capped 50, newest first)
//
// The inquiry-id and booking-id are the same string at the H1 stage —
// a booking IS its inquiry until accepted. We use the `inq_` prefix per
// task spec rather than `bk_` because the H1 lifecycle is inquiry-only;
// the `id` field on BookingRecord doubles as the inquiry ID. (Roadmap
// section in contracts.ts mentions `bk_` in a code comment — the active
// task spec wins.)

import type {
  BookingRecord,
  ChatAuthorRole,
  ChatMessage,
  CitySlug,
  CompanionDeclineReasonCategory,
  CompanionInquirySummary,
  CompanionRatingAggregate,
  CompanionSessionDetail,
  InquiryStatus,
  MuseChartSignature,
  ReviewSummary,
  Session,
  TravellerInquiryDetail,
  TravellerInquiryRequest,
  TravellerInquirySummary,
} from "../shared/contracts";

type BookingKv = KVNamespace | undefined;

const INQUIRY_INDEX_LIMIT = 50;

/**
 * H6 — Maximum number of reviews kept per companion in the KV index.
 * Older reviews fall off as new ones arrive. The exact list is the
 * source of truth for aggregate ratings — we recompute on read rather
 * than maintaining an atomic counter (acceptable at v1 review volume).
 */
const REVIEW_HISTORY_LIMIT = 25;

/**
 * H6 — Auto-complete a review_pending booking after this many days
 * without a traveller submission. The cleanup is observed naturally on
 * the next GET that reads a stale review_pending booking; no cron is
 * needed because list/detail endpoints all run maybeAdvanceSessionStatus.
 */
const REVIEW_AUTOCOMPLETE_DAYS = 7;

// ===== State transition allowlist =====
// Single source of truth for what status changes are legal and which
// actor type may trigger them. The validator is pure (no I/O); actor
// authorization is enforced by transitionBookingStatus against the
// record's traveller/companion email fields.
//
// Actor types:
//   - "traveller" — the inquiry creator (must match record.travellerEmail)
//   - "companion" — the matched companion (must match record.companionEmail)
//   - "system"    — internal auto-transitions (no email check)

export type TransitionActorType = "traveller" | "companion" | "system";

export type TransitionRule = {
  from: InquiryStatus;
  to: InquiryStatus;
  actor: TransitionActorType;
  note: string;
};

// `draft` is intentionally absent — drafts live client-side and skip the
// state machine until submit() promotes them to "submitted".
export const TRANSITION_ALLOWLIST: readonly TransitionRule[] = [
  // H1 — Inquiry creation & cancellation
  { from: "submitted",         to: "under_review",      actor: "system",    note: "auto" },
  { from: "under_review",      to: "routed",            actor: "system",    note: "auto" },
  { from: "under_review",      to: "declined",          actor: "system",    note: "Tirak admin (out of H1)" },
  { from: "submitted",         to: "cancelled",         actor: "traveller", note: "DELETE inquiries/{id}" },
  { from: "under_review",      to: "cancelled",         actor: "traveller", note: "DELETE inquiries/{id}" },
  { from: "routed",            to: "cancelled",         actor: "traveller", note: "DELETE inquiries/{id}" },

  // H2 — Companion accept/decline
  { from: "routed",            to: "accepted",          actor: "companion", note: "H2 endpoint" },
  { from: "routed",            to: "declined",          actor: "companion", note: "H2 endpoint" },

  // H3 — Date negotiation
  { from: "accepted",          to: "date_pending",      actor: "traveller", note: "H3" },
  { from: "date_pending",      to: "date_proposed",     actor: "companion", note: "H3" },
  { from: "date_proposed",     to: "date_confirmed",    actor: "traveller", note: "H3" },

  // H4 — Payment hold
  { from: "date_confirmed",    to: "payment_held",      actor: "traveller", note: "H4" },
  { from: "payment_held",      to: "session_scheduled", actor: "system",    note: "H4 (webhook)" },

  // H5 — Session day-of
  { from: "session_scheduled", to: "session_live",      actor: "system",    note: "H5" },
  { from: "session_live",      to: "session_completed", actor: "system",    note: "H5" },
  { from: "session_completed", to: "review_pending",    actor: "system",    note: "H5" },

  // H6 — Review
  { from: "review_pending",    to: "review_completed",  actor: "traveller", note: "H6" },
  { from: "review_pending",    to: "review_completed",  actor: "system",    note: "H6 7-day auto-complete" },
] as const;

// ===== Internal helpers (mirror account-store.ts pattern) =====

function bookingKey(id: string): string {
  return `booking:${id}`;
}

function travellerIndexKey(email: string): string {
  return `booking:traveller:${email.trim().toLowerCase()}:inquiries`;
}

function companionIndexKey(email: string): string {
  return `booking:companion:${email.trim().toLowerCase()}:inquiries`;
}

// H6 — capped reviews index. Reserved in wrangler.jsonc since H1.T2.
function reviewsKey(companionEmail: string): string {
  const normalized = companionEmail.trim().toLowerCase();
  return `booking:companion:${normalized}:reviews`;
}

async function readJson<T>(kv: BookingKv, key: string): Promise<T | null> {
  if (!kv) return null;
  try {
    return await kv.get<T>(key, "json");
  } catch {
    return null;
  }
}

async function writeJson(kv: BookingKv, key: string, value: unknown): Promise<void> {
  if (!kv) return;
  try {
    await kv.put(key, JSON.stringify(value));
  } catch {
    // swallow — UI must remain usable even when KV writes fail
  }
}

async function deleteKey(kv: BookingKv, key: string): Promise<void> {
  if (!kv) return;
  try {
    await kv.delete(key);
  } catch {
    // swallow
  }
}

async function readIndex(kv: BookingKv, key: string): Promise<string[]> {
  const list = await readJson<string[]>(kv, key);
  return Array.isArray(list) ? list : [];
}

async function prependToIndex(kv: BookingKv, key: string, id: string): Promise<void> {
  const existing = await readIndex(kv, key);
  // De-dupe in case caller re-writes — keep the newest position.
  const filtered = existing.filter((existingId) => existingId !== id);
  const next = [id, ...filtered].slice(0, INQUIRY_INDEX_LIMIT);
  await writeJson(kv, key, next);
}

async function removeFromIndex(kv: BookingKv, key: string, id: string): Promise<void> {
  const existing = await readIndex(kv, key);
  if (!existing.includes(id)) return;
  const next = existing.filter((existingId) => existingId !== id);
  await writeJson(kv, key, next);
}

/**
 * Writes ONLY the `booking:{id}` blob — no index touch. Used for
 * record updates (transitions, cancellations) that must not re-prepend
 * the id to per-email indices. Index management is the caller's job
 * via prependToIndex / removeFromIndex.
 */
async function persistRecord(kv: BookingKv, record: BookingRecord): Promise<void> {
  await writeJson(kv, bookingKey(record.id), record);
}

/**
 * Derive a companion's email from their companionId. CompanionProfile in
 * staged-data.ts does NOT carry an email field today, so we synthesize a
 * stable placeholder. This keeps the index meaningful in v1 and is fine
 * because real companions will get verified emails through the Pass E
 * onboarding flow before this index gets exposed to them.
 */
function companionEmailFor(companionId: string): string {
  return `companion-${companionId.trim().toLowerCase()}@tirak.app`;
}

// ===== Public API =====

export async function readBooking(kv: BookingKv, id: string): Promise<BookingRecord | null> {
  return readJson<BookingRecord>(kv, bookingKey(id));
}

/**
 * Writes the record and refreshes both per-email indices (traveller +
 * companion). Idempotent — re-writing an existing booking moves it to
 * the top of each index without duplicating entries.
 */
export async function writeBooking(kv: BookingKv, record: BookingRecord): Promise<BookingRecord> {
  await persistRecord(kv, record);
  await prependToIndex(kv, travellerIndexKey(record.travellerEmail), record.id);
  await prependToIndex(kv, companionIndexKey(record.companionEmail), record.id);
  return record;
}

/**
 * Marks the booking as cancelled, persists the cancellation, and removes
 * its id from both per-email indices. Returns silently if the record
 * doesn't exist (no-op for missing KV or unknown id).
 */
export async function deleteBooking(kv: BookingKv, id: string): Promise<void> {
  const existing = await readBooking(kv, id);
  if (!existing) {
    // Best-effort cleanup in case the record is gone but indices linger.
    await deleteKey(kv, bookingKey(id));
    return;
  }
  const cancelled: BookingRecord = {
    ...existing,
    status: "cancelled",
    updatedAt: new Date().toISOString(),
  };
  await persistRecord(kv, cancelled);
  await removeFromIndex(kv, travellerIndexKey(existing.travellerEmail), id);
  await removeFromIndex(kv, companionIndexKey(existing.companionEmail), id);
}

export async function listTravellerBookings(
  kv: BookingKv,
  email: string,
): Promise<BookingRecord[]> {
  const ids = await readIndex(kv, travellerIndexKey(email));
  return hydrateBookings(kv, ids);
}

export async function listCompanionBookings(
  kv: BookingKv,
  email: string,
): Promise<BookingRecord[]> {
  const ids = await readIndex(kv, companionIndexKey(email));
  return hydrateBookings(kv, ids);
}

async function hydrateBookings(kv: BookingKv, ids: string[]): Promise<BookingRecord[]> {
  if (ids.length === 0) return [];
  const results = await Promise.all(ids.map((id) => readBooking(kv, id)));
  return results.filter((record): record is BookingRecord => record !== null);
}

/**
 * Creates a fresh BookingRecord from an inquiry request + traveller's
 * session email. Generates an `inq_` id, sets status to "submitted",
 * stamps createdAt/updatedAt, and indexes the id under BOTH the
 * traveller and companion emails so listTravellerBookings and
 * listCompanionBookings can both surface it.
 *
 * When `options.autoRoute` is true, the record lands at status="routed"
 * instead of "submitted" — used by dev/staging handlers to skip the
 * (currently unimplemented) Tirak admin review step so the H2 companion
 * accept/decline flow is testable end-to-end. Default is false so prod
 * behavior stays unchanged when the option is omitted. The env-vs-flag
 * decision is intentionally pushed up to the handler boundary so this
 * function stays environment-agnostic and reusable.
 */
export async function createBooking(
  kv: BookingKv,
  request: TravellerInquiryRequest,
  travellerEmail: string,
  options?: { autoRoute?: boolean },
): Promise<BookingRecord> {
  const now = new Date().toISOString();
  const record: BookingRecord = {
    id: `inq_${crypto.randomUUID()}`,
    travellerEmail: travellerEmail.trim().toLowerCase(),
    companionEmail: companionEmailFor(request.companionId),
    companionId: request.companionId,
    city: request.city,
    experience: request.experience,
    status: options?.autoRoute ? "routed" : "submitted",
    message: request.message,
    createdAt: now,
    updatedAt: now,
    privacyAcknowledged: request.privacyAcknowledged === true,
  };
  return writeBooking(kv, record);
}

/**
 * Validates that:
 *   1. The booking exists.
 *   2. Its current status is in the `fromStatus` allowlist passed by the caller.
 *   3. The (currentStatus → toStatus) transition exists in TRANSITION_ALLOWLIST.
 *   4. The actor (`actorEmail`) is authorized to perform that transition:
 *        - actor="traveller" → must match record.travellerEmail
 *        - actor="companion" → must match record.companionEmail
 *        - actor="system"    → caller is trusted; no email check
 *
 * Returns the updated BookingRecord on success, or `null` if any check fails.
 * No throws — handlers map `null` to a 400/409 response.
 */
export async function transitionBookingStatus(
  kv: BookingKv,
  id: string,
  fromStatus: InquiryStatus[],
  toStatus: InquiryStatus,
  actorEmail: string,
  patch?: Partial<BookingRecord>,
): Promise<BookingRecord | null> {
  const record = await readBooking(kv, id);
  if (!record) return null;

  // Caller-supplied current-state guard (helps callers catch races where
  // the record advanced between read and write).
  if (!fromStatus.includes(record.status)) return null;

  const rule = TRANSITION_ALLOWLIST.find(
    (entry) => entry.from === record.status && entry.to === toStatus,
  );
  if (!rule) return null;

  // Actor authorization — pure email comparison, lowercased.
  const actor = actorEmail.trim().toLowerCase();
  if (rule.actor === "traveller" && actor !== record.travellerEmail) return null;
  if (rule.actor === "companion" && actor !== record.companionEmail) return null;
  // rule.actor === "system" — trusted caller, no check.

  // Status + updatedAt always win over patch — callers can't accidentally
  // override the transition's own bookkeeping. Patch is for metadata fields
  // (declineReason, acceptedAt, etc.) that are atomic with the transition.
  const updated: BookingRecord = {
    ...record,
    ...(patch ?? {}),                                // caller-supplied metadata first
    status: toStatus,                                // transition wins
    updatedAt: new Date().toISOString(),             // always now
  };
  await persistRecord(kv, updated);
  // Index membership doesn't change on status transitions — entries
  // stay until deleteBooking runs. Using persistRecord (not
  // writeBooking) here preserves the cap-50 "newest-created first"
  // ordering instead of reshuffling indices on every status change.
  return updated;
}

/**
 * Check if a booking's session_scheduled / session_live / session_completed
 * / review_pending state has elapsed and advance accordingly. Idempotent —
 * safe to call on every GET. Returns the (possibly advanced) record.
 *
 * Timing rules:
 *   - session_scheduled → session_live when now >= scheduledFor
 *   - session_live → session_completed when now >= scheduledFor + durationMinutes
 *   - session_completed → review_pending (immediate, no time gate)
 *   - review_pending → review_completed when now >= updatedAt + REVIEW_AUTOCOMPLETE_DAYS
 *
 * Other statuses are returned unchanged. Missing scheduledFor / duration
 * fields are tolerated — the helper simply skips advancement.
 *
 * Uses transitionBookingStatus internally with actor="system" so the
 * audit trail correctly attributes the change.
 */
export async function maybeAdvanceSessionStatus(
  kv: BookingKv,
  booking: BookingRecord,
): Promise<BookingRecord> {
  if (!booking.scheduledFor) return booking;

  const now = Date.now();
  const startMs = Date.parse(booking.scheduledFor);
  if (Number.isNaN(startMs)) return booking;

  if (booking.status === "session_scheduled" && now >= startMs) {
    const advanced = await transitionBookingStatus(
      kv,
      booking.id,
      ["session_scheduled"],
      "session_live",
      "system",
    );
    if (advanced) booking = advanced;
  }

  if (
    booking.status === "session_live" &&
    typeof booking.durationMinutes === "number" &&
    now >= startMs + booking.durationMinutes * 60 * 1000
  ) {
    const advanced = await transitionBookingStatus(
      kv,
      booking.id,
      ["session_live"],
      "session_completed",
      "system",
    );
    if (advanced) booking = advanced;
  }

  // H6: session_completed → review_pending (immediate on next GET after
  // session_completed lands). The review form unlocks for the traveller
  // as soon as the system flips to review_pending.
  if (booking.status === "session_completed") {
    const advanced = await transitionBookingStatus(
      kv,
      booking.id,
      ["session_completed"],
      "review_pending",
      "system",
    );
    if (advanced) booking = advanced;
  }

  // H6: 7-day auto-complete. If review_pending has been sitting for
  // 7+ days without a traveller submission, system advances to
  // review_completed (no score/comment patched). Uses updatedAt as
  // the entry-to-review_pending timestamp (no other writes to a
  // review_pending record exist in v1 — see allowlist).
  if (booking.status === "review_pending" && booking.updatedAt) {
    const enteredMs = Date.parse(booking.updatedAt);
    if (
      !Number.isNaN(enteredMs) &&
      now >= enteredMs + REVIEW_AUTOCOMPLETE_DAYS * 24 * 60 * 60 * 1000
    ) {
      const advanced = await transitionBookingStatus(
        kv,
        booking.id,
        ["review_pending"],
        "review_completed",
        "system",
      );
      if (advanced) booking = advanced;
    }
  }

  return booking;
}

/**
 * Apply maybeAdvanceSessionStatus to each booking in a list. Used by
 * list GET handlers so polling refreshes pick up time-based transitions
 * across the whole inbox at once.
 */
export async function maybeAdvanceSessionStatusBatch(
  kv: BookingKv,
  bookings: BookingRecord[],
): Promise<BookingRecord[]> {
  return Promise.all(bookings.map((b) => maybeAdvanceSessionStatus(kv, b)));
}

/**
 * Apply a metadata patch to a booking record WITHOUT changing status.
 * Used for fields like meetingPoint that the companion sets independently
 * of the state machine. Returns null if the booking is missing.
 *
 * Caller is responsible for ownership / authorization. This is a low-
 * level write — disciplined callers use it for non-status mutations,
 * just as transitionBookingStatus is the disciplined caller for status
 * mutations.
 */
export async function patchBooking(
  kv: BookingKv,
  id: string,
  patch: Partial<BookingRecord>,
): Promise<BookingRecord | null> {
  const record = await readBooking(kv, id);
  if (!record) return null;
  const updated: BookingRecord = {
    ...record,
    ...patch,
    updatedAt: new Date().toISOString(),
    status: record.status,  // explicitly keep status — patch can't touch it
  };
  await persistRecord(kv, updated);
  return updated;
}

/**
 * DEV ONLY — force the booking status to an arbitrary value without
 * any allowlist or actor check. Used by the /api/dev/advance-booking
 * endpoint (gated on env.ENVIRONMENT !== "production") to construct
 * test scenarios that the real state machine guards against (e.g.
 * jumping a booking to review_pending without waiting for scheduledFor
 * + durationMinutes to pass in real time).
 *
 * NEVER call this from production code paths. Unlike patchBooking
 * (which explicitly preserves status: record.status) and
 * transitionBookingStatus (which enforces TRANSITION_ALLOWLIST + actor),
 * this helper is the deliberate escape hatch for test fixtures only.
 * Returns null if the booking is missing.
 */
export async function forceSetBookingStatus(
  kv: BookingKv,
  id: string,
  newStatus: InquiryStatus,
): Promise<BookingRecord | null> {
  const record = await readBooking(kv, id);
  if (!record) return null;
  const updated: BookingRecord = {
    ...record,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };
  await persistRecord(kv, updated);
  return updated;
}

// Re-export for handler convenience
export { CHAT_HISTORY_LIMIT, INQUIRY_INDEX_LIMIT, REVIEW_HISTORY_LIMIT };

// ===== H6 — Review submission + aggregate rating =====
//
// Reviews live at booking:companion:{lowercase-email}:reviews as a
// newest-first list capped at REVIEW_HISTORY_LIMIT. We recompute the
// aggregate on read instead of maintaining an atomic counter — fine at
// v1 review volume and avoids a second write path that could drift.

/**
 * Submit a review for a completed session. Atomically:
 *   1. Appends a ReviewSummary to the companion's reviews list
 *      (capped at REVIEW_HISTORY_LIMIT, newest first)
 *   2. Transitions the booking from review_pending → review_completed
 *      with the score/comment/timestamp patched onto the BookingRecord
 *
 * Returns the updated BookingRecord on success, null if the transition
 * was rejected (wrong status, missing record, etc.). Caller is
 * responsible for validation + authorization.
 */
export async function submitReview(
  kv: BookingKv,
  booking: BookingRecord,
  args: {
    score: number;          // 1-5 integer (caller has validated)
    comment: string;        // trimmed, 20-500 chars (caller has validated)
    travellerLabel: string; // for the ReviewSummary; "Traveller from {city}" style
  },
): Promise<BookingRecord | null> {
  const submittedAt = new Date().toISOString();

  // 1) Append to companion's reviews index (newest first, capped)
  const summary: ReviewSummary = {
    bookingId: booking.id,
    travellerLabel: args.travellerLabel,
    score: args.score,
    comment: args.comment,
    submittedAt,
  };
  const existing = await readCompanionReviews(kv, booking.companionEmail);
  const next = [summary, ...existing].slice(0, REVIEW_HISTORY_LIMIT);
  await writeJson(kv, reviewsKey(booking.companionEmail), next);

  // 2) Transition + patch the booking
  const updated = await transitionBookingStatus(
    kv,
    booking.id,
    ["review_pending"],
    "review_completed",
    booking.travellerEmail,   // traveller is the actor on this transition
    {
      reviewedAt: submittedAt,
      reviewScore: args.score,
      reviewComment: args.comment,
    },
  );
  return updated;
}

/**
 * Read the cap-25 reviews list for a companion. Returns empty array
 * when KV is missing or no reviews exist.
 */
export async function readCompanionReviews(
  kv: BookingKv,
  companionEmail: string,
): Promise<ReviewSummary[]> {
  const list = await readJson<ReviewSummary[]>(kv, reviewsKey(companionEmail));
  return Array.isArray(list) ? list : [];
}

/**
 * Compute the aggregate rating from a reviews list. Pure function — no I/O.
 * Returns `{ averageScore: 0, reviewCount: 0 }` when the list is empty;
 * otherwise averageScore is the arithmetic mean rounded to 1 decimal.
 */
export function computeAggregateRating(reviews: ReviewSummary[]): CompanionRatingAggregate {
  if (reviews.length === 0) {
    return { averageScore: 0, reviewCount: 0 };
  }
  const sum = reviews.reduce((acc, r) => acc + r.score, 0);
  const averageScore = Math.round((sum / reviews.length) * 10) / 10;
  return { averageScore, reviewCount: reviews.length };
}

// ===== Pass I — Chat thread persistence =====
//
// Thread KV layout:
//   booking:{id}:messages         → ChatMessage[] (chronological, newest last,
//                                                 capped at CHAT_HISTORY_LIMIT)
//   booking:{id}:read:{email}     → ISO timestamp string (per-user lastReadAt)
//
// Authorization + validation are the handler's job — these helpers are
// the persistence primitive. The H1.T3 endpoints will gate sends on
// booking ownership (isTravellerOwner / isCompanionOwner) before calling
// sendMessage. computeUnreadCount is pure so handlers and clients can both
// call it without an extra round-trip.

/**
 * Pass I — Maximum messages kept per booking thread in KV.
 * Older messages drop off as new ones arrive. UI is paginated above
 * this in a future pass; v1 just truncates.
 */
const CHAT_HISTORY_LIMIT = 200;

/**
 * Append a chat message to the booking's thread. Caps at
 * CHAT_HISTORY_LIMIT (oldest first — the OLDEST messages drop off
 * when the cap is exceeded so the most recent context survives).
 * Caller is responsible for validation + authorization.
 */
export async function sendMessage(
  kv: BookingKv,
  args: {
    threadId: string;            // BookingRecord.id
    authorRole: ChatAuthorRole;
    authorLabel: string;         // "Traveller" or companion displayName
    content: string;             // trimmed, 1-2000 chars (validated by caller)
  },
): Promise<ChatMessage> {
  const createdAt = new Date().toISOString();
  const message: ChatMessage = {
    id: `msg_${crypto.randomUUID()}`,
    threadId: args.threadId,
    authorRole: args.authorRole,
    authorLabel: args.authorLabel,
    content: args.content,
    createdAt,
  };

  const existing = await readMessages(kv, args.threadId);
  // Append at end (newest last) so the array is chronological.
  // If we exceed cap, drop OLDEST messages first.
  const next = [...existing, message].slice(-CHAT_HISTORY_LIMIT);
  await writeJson(kv, messagesKey(args.threadId), next);
  return message;
}

/**
 * Read the full message list for a booking thread. Returns empty
 * array when no thread has been started or KV is missing.
 */
export async function readMessages(
  kv: BookingKv,
  threadId: string,
): Promise<ChatMessage[]> {
  const list = await readJson<ChatMessage[]>(kv, messagesKey(threadId));
  return Array.isArray(list) ? list : [];
}

/**
 * Set the current user's lastReadAt to now for this thread.
 * Returns the new lastReadAt timestamp.
 */
export async function markThreadRead(
  kv: BookingKv,
  threadId: string,
  email: string,
): Promise<string> {
  const now = new Date().toISOString();
  await writeJson(kv, threadReadKey(threadId, email), now);
  return now;
}

/**
 * Read the current user's lastReadAt for a thread. Returns undefined
 * if the user has never read (never opened the thread).
 */
export async function readLastReadAt(
  kv: BookingKv,
  threadId: string,
  email: string,
): Promise<string | undefined> {
  const ts = await readJson<string>(kv, threadReadKey(threadId, email));
  return typeof ts === "string" ? ts : undefined;
}

/**
 * Pure function — count of messages from the OTHER party that arrived
 * AFTER lastReadAt. No I/O. The caller's role determines which messages
 * count as "from other party":
 *   viewerRole === "traveller" → count companion messages
 *   viewerRole === "companion" → count traveller messages
 *
 * lastReadAt === undefined means the user has never opened the thread
 * — every other-party message counts.
 */
export function computeUnreadCount(
  messages: ChatMessage[],
  lastReadAt: string | undefined,
  viewerRole: ChatAuthorRole,
): number {
  const otherRole: ChatAuthorRole = viewerRole === "traveller" ? "companion" : "traveller";
  if (!lastReadAt) {
    return messages.filter((m) => m.authorRole === otherRole).length;
  }
  const cutoffMs = Date.parse(lastReadAt);
  if (Number.isNaN(cutoffMs)) {
    // Malformed timestamp — be safe: count nothing
    return 0;
  }
  return messages.filter((m) => {
    if (m.authorRole !== otherRole) return false;
    const msgMs = Date.parse(m.createdAt);
    return !Number.isNaN(msgMs) && msgMs > cutoffMs;
  }).length;
}

// Key helpers (private to this file)
function messagesKey(threadId: string): string {
  return `booking:${threadId}:messages`;
}

function threadReadKey(threadId: string, email: string): string {
  const normalized = email.trim().toLowerCase();
  return `booking:${threadId}:read:${normalized}`;
}

// ===== Projector: BookingRecord → TravellerInquiryDetail =====
//
// Maps a stored BookingRecord into the rich TravellerInquiryDetail shape
// the API contract returns. Derives `nextStep`, `timeline`, and
// `paymentState` from the record's current `status` so the projector is
// the single source of truth for status-to-presentation translation —
// future GET endpoints (H1.T5) reuse this for fixture-fallback parity.
//
// The switch on InquiryStatus must stay exhaustive (the `satisfies never`
// fallback enforces this at compile time) so adding a new status anywhere
// in contracts.ts will surface here immediately.

type InquiryTimelineEntry = TravellerInquiryDetail["timeline"][number];
type InquiryPaymentState = TravellerInquiryDetail["paymentState"];

const PRIVACY_NOTE =
  "Only you and the Tirak team can see this inquiry thread. Details stay private and are never published.";

function nextStepFor(status: InquiryStatus): string {
  switch (status) {
    case "draft":
      return "Finish your inquiry draft when you're ready.";
    case "submitted":
      return "Tirak is reviewing this inquiry.";
    case "under_review":
      return "Review in progress — Tirak checks safety, fit, and allowed next steps.";
    case "routed":
      return "Sent to the companion for response.";
    case "accepted":
      return "Companion accepted. Pick dates next.";
    case "date_pending":
      return "Propose two or three windows so the companion can pick one.";
    case "date_proposed":
      return "Companion proposed a window — confirm or counter.";
    case "date_confirmed":
      return "Date confirmed. Hold a payment to lock the session.";
    case "payment_held":
      return "Payment is on hold. Tirak finalizes the session details next.";
    case "session_scheduled":
      return "Session is scheduled. We'll send a reminder before it starts.";
    case "session_live":
      return "Session in progress.";
    case "session_completed":
      return "Session complete. A short review request comes next.";
    case "review_pending":
      return "Leave a private review to close this booking.";
    case "review_completed":
      return "Review complete. Thank you for the feedback.";
    case "declined":
      return "This inquiry was declined.";
    case "cancelled":
      return "Inquiry cancelled.";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function timelineFor(status: InquiryStatus): InquiryTimelineEntry[] {
  // Three baseline milestones for the H1 lifecycle. Later sub-passes
  // (H3-H6) will extend with date/payment/session/review entries.
  const inquiryReceived: InquiryTimelineEntry = {
    label: "Inquiry received",
    status: "complete",
    note: "Traveller context and message were received.",
  };

  switch (status) {
    case "draft":
      return [
        { label: "Inquiry drafted", status: "active", note: "Saved locally — not yet submitted to Tirak." },
        { label: "Private review", status: "pending", note: "Tirak checks safety, fit, and allowed next steps." },
        { label: "Routed to companion", status: "pending", note: "Companion sees the inquiry only after review." },
      ];
    case "submitted":
      return [
        inquiryReceived,
        { label: "Private review", status: "active", note: "Tirak checks safety, fit, and allowed next steps." },
        { label: "Routed to companion", status: "pending", note: "Companion sees the inquiry only after review." },
      ];
    case "under_review":
      return [
        inquiryReceived,
        { label: "Private review", status: "active", note: "Tirak is checking the plan before any introduction or payment." },
        { label: "Routed to companion", status: "pending", note: "Companion sees the inquiry only after review." },
      ];
    case "routed":
      return [
        inquiryReceived,
        { label: "Private review", status: "complete", note: "Tirak cleared the inquiry for routing." },
        { label: "Routed to companion", status: "active", note: "Companion has the inquiry and can accept or decline." },
      ];
    case "accepted":
      return [
        inquiryReceived,
        { label: "Private review", status: "complete", note: "Tirak cleared the inquiry for routing." },
        { label: "Companion accepted", status: "complete", note: "Pick dates next to move forward." },
      ];
    case "date_pending":
    case "date_proposed":
    case "date_confirmed":
      return [
        inquiryReceived,
        { label: "Private review", status: "complete", note: "Tirak cleared the inquiry for routing." },
        { label: "Companion accepted", status: "complete", note: "Both parties are aligning on a date." },
        { label: "Date confirmation", status: status === "date_confirmed" ? "complete" : "active", note: "Confirm a window that works for both sides." },
      ];
    case "payment_held":
      return [
        inquiryReceived,
        { label: "Private review", status: "complete", note: "Tirak cleared the inquiry for routing." },
        { label: "Companion accepted", status: "complete", note: "Date is confirmed." },
        { label: "Payment held", status: "active", note: "Payment is on hold until the session is scheduled." },
      ];
    case "session_scheduled":
    case "session_live":
    case "session_completed":
      return [
        inquiryReceived,
        { label: "Private review", status: "complete", note: "Tirak cleared the inquiry for routing." },
        { label: "Companion accepted", status: "complete", note: "Date is confirmed." },
        { label: "Session", status: status === "session_completed" ? "complete" : "active", note: "Session is in motion." },
      ];
    case "review_pending":
      return [
        inquiryReceived,
        { label: "Session complete", status: "complete", note: "Session wrapped up." },
        { label: "Review", status: "active", note: "Share a private review so Tirak can learn from this booking." },
      ];
    case "review_completed":
      return [
        inquiryReceived,
        { label: "Session complete", status: "complete", note: "Session wrapped up." },
        { label: "Review", status: "complete", note: "Thank you for the feedback." },
      ];
    case "declined":
      return [
        inquiryReceived,
        { label: "Private review", status: "complete", note: "Tirak reviewed the inquiry." },
        { label: "Declined", status: "complete", note: "This inquiry was declined." },
      ];
    case "cancelled":
      return [
        inquiryReceived,
        { label: "Cancelled", status: "complete", note: "The traveller cancelled this inquiry." },
      ];
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function paymentStateFor(status: InquiryStatus): InquiryPaymentState {
  switch (status) {
    case "draft":
    case "submitted":
    case "under_review":
    case "routed":
    case "accepted":
    case "date_pending":
    case "date_proposed":
    case "date_confirmed":
      return {
        status: "not_started",
        provider: "none",
        note: "Payment is not available for this inquiry yet.",
      };
    case "payment_held":
      return {
        status: "pending_review",
        provider: "stripe",
        note: "Payment is on hold while Tirak finalizes the session.",
      };
    case "session_scheduled":
    case "session_live":
    case "session_completed":
    case "review_pending":
    case "review_completed":
    case "declined":
    case "cancelled":
      return {
        status: "disabled_for_compliance",
        provider: "stripe",
        note: "Payment is not active for this inquiry stage.",
      };
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/**
 * Maps a stored BookingRecord into the rich TravellerInquiryDetail shape
 * the API contract returns. The companion's display name is supplied by
 * the caller (the handler looks it up via the staged-data provider so
 * we don't need to hit a profile lookup from inside booking-store).
 */
export function projectBookingToTravellerInquiryDetail(
  booking: BookingRecord,
  companionDisplayName: string,
): TravellerInquiryDetail {
  return {
    id: booking.id,
    companionId: booking.companionId,
    companionDisplayName,
    city: booking.city,
    experience: booking.experience,
    status: booking.status,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    nextStep: nextStepFor(booking.status),
    message: booking.message,
    timeline: timelineFor(booking.status),
    paymentState: paymentStateFor(booking.status),
    privacyNote: PRIVACY_NOTE,
    // H3 (2026-05-27) — pass-through of date-negotiation state. All five
    // fields are optional on TravellerInquiryDetail; spreading them through
    // keeps the projector the single source of truth for booking shape.
    travellerWindows: booking.travellerWindows,
    companionSelectedWindow: booking.companionSelectedWindow,
    scheduledFor: booking.scheduledFor,
    durationMinutes: booking.durationMinutes,
    confirmedAt: booking.confirmedAt,
    // H4-stub (2026-05-27) — pass-through of payment-hold metadata. All
    // five fields stay undefined until status reaches payment_held.
    paymentSessionId: booking.paymentSessionId,
    paymentStatus: booking.paymentStatus,
    paymentAmount: booking.paymentAmount,
    paymentCurrency: booking.paymentCurrency,
    heldAt: booking.heldAt,
    // H5 — Day-of details pass-through. Companion sets these after
    // date_confirmed; both sides see them on detail GETs.
    meetingPoint: booking.meetingPoint,
    contactNumber: booking.contactNumber,
    dayOfNotes: booking.dayOfNotes,
    // H6 — Review metadata pass-through. Stay undefined until status
    // reaches review_completed via submitReview (which patches all three
    // fields atomically with the transition). The TravellerInquiryDetail
    // page renders the submitted-review summary card from these fields.
    reviewedAt: booking.reviewedAt,
    reviewScore: booking.reviewScore,
    reviewComment: booking.reviewComment,
  };
}

// ===== Projector: BookingRecord → CompanionInquirySummary =====
//
// Companion-side view of an inquiry. Identity stays scrubbed — no
// traveller email or display name leaks across. The travellerLabel is
// derived from city alone ("Traveller from Bangkok") per contracts.ts
// guidance. preferredWindow is a placeholder until H3 stores
// travellerWindows on the BookingRecord.

const COMPANION_PRIVACY_NOTE =
  "Traveller identity and contact details stay private until Tirak clears the plan.";

const CITY_LABELS: Record<CitySlug, string> = {
  "bangkok": "Bangkok",
  "phuket": "Phuket",
  "koh-samui": "Koh Samui",
  "koh-phangan": "Koh Phangan",
};

function travellerLabelFor(city: CitySlug): string {
  return `Traveller from ${CITY_LABELS[city] ?? city}`;
}

/**
 * Build a privacy-safe traveller label for ReviewSummary. Uses the
 * city slug from the booking; deliberately omits any PII (no name,
 * no email, no exact venue). Examples:
 *   "Traveller from Bangkok"
 *   "Traveller from Phuket"
 *
 * Reuses CITY_LABELS so the labels stay in sync with the companion-
 * inquiry projector.
 */
export function travellerLabelFromBooking(booking: BookingRecord): string {
  return `Traveller from ${CITY_LABELS[booking.city] ?? booking.city}`;
}

function preferredWindowFor(booking: BookingRecord): string {
  // H3 will populate booking.travellerWindows; until then, surface a
  // neutral placeholder so the companion UI has a non-empty string.
  if (booking.travellerWindows && booking.travellerWindows.length > 0) {
    const first = booking.travellerWindows[0];
    return first.note ?? `${first.start} – ${first.end}`;
  }
  return "Preferred window pending traveller proposal.";
}

export function projectBookingToCompanionInquirySummary(
  booking: BookingRecord,
): CompanionInquirySummary {
  return {
    id: booking.id,
    travellerLabel: travellerLabelFor(booking.city),
    city: booking.city,
    experience: booking.experience,
    status: booking.status,
    preferredWindow: preferredWindowFor(booking),
    receivedAt: booking.createdAt,
    nextStep: nextStepFor(booking.status),
    privacyNote: COMPANION_PRIVACY_NOTE,
  };
}

// ===== Projector: BookingRecord → CompanionSessionDetail =====
//
// Detail view used by the companion inbox. Fields the projector cannot
// synthesize from BookingRecord (travellerContext narrative, museFit
// chart) are placeholders or caller-supplied. H2-H6 will enrich these
// once the companion-side state machine exists.

const COMPANION_DECISION_OPTIONS: CompanionSessionDetail["decisionOptions"] = [
  {
    label: "Ask Tirak to clarify",
    value: "request_review",
    description: "Keep the request active while asking Tirak for clearer plan details or boundaries.",
  },
  {
    label: "Accept after review",
    value: "accept_after_review",
    description: "Mark willingness to proceed only if Tirak clears the plan.",
  },
  {
    label: "Decline safely",
    value: "decline_safely",
    description: "Close the request without sharing private contact or availability details.",
  },
];

function companionChecklistFor(status: InquiryStatus): CompanionSessionDetail["checklist"] {
  // Three-row baseline. H2/H4 will gate items based on real status.
  return [
    {
      label: "Traveller context",
      status: "complete",
      note: "The request includes city, timing, and tone.",
    },
    {
      label: "Companion boundary",
      status: status === "routed" || status === "under_review" ? "active" : "pending",
      note: "A response can name limits without exposing contact details.",
    },
    {
      label: "Payment",
      status: status === "payment_held" || status === "session_scheduled" ? "complete" : "blocked",
      note: "Payment is not available for this request yet.",
    },
  ];
}

/**
 * Human-readable label for each decline-reason category. Surfaced in
 * traveller-facing notifications and the projector's `declineReasonLabel`
 * field. Single source of truth — both the API projector and the email
 * builder import this so they stay in sync.
 */
export function labelForDeclineReason(reason: CompanionDeclineReasonCategory): string {
  switch (reason) {
    case "schedule": return "scheduling conflict";
    case "privacy":  return "privacy concern";
    case "safety":   return "safety reason";
    case "other":    return "other";
  }
}

/**
 * Caller supplies `museFit` (staged-data's companionMuseChart by default)
 * so booking-store stays free of fixture imports. travellerContext is a
 * placeholder narrative — H2 will replace this with a Muse-generated
 * read once the companion accept/decline endpoint exists.
 *
 * Decision metadata (acceptedAt / declinedAt / declineReason /
 * declineReasonLabel / declineNotes) is surfaced from BookingRecord when
 * present so the UI can render decision context without another API call.
 * All five fields are undefined for inquiries the companion hasn't acted
 * on yet — the spread of `booking.declineReason` etc. is naturally
 * nullable-safe because BookingRecord declares them optional.
 */
export function projectBookingToCompanionSessionDetail(
  booking: BookingRecord,
  museFit: MuseChartSignature,
): CompanionSessionDetail {
  return {
    ...projectBookingToCompanionInquirySummary(booking),
    travellerContext:
      "Traveller has shared city, experience, and message. Tirak is reviewing the plan before any direct introduction.",
    museFit,
    decisionOptions: COMPANION_DECISION_OPTIONS,
    checklist: companionChecklistFor(booking.status),
    messageThread: [],
    paymentState: paymentStateFor(booking.status),
    // H2.T5 — decision metadata when present on BookingRecord. Each field
    // stays undefined when the companion hasn't decided yet.
    acceptedAt: booking.acceptedAt,
    declinedAt: booking.declinedAt,
    declineReason: booking.declineReason,
    declineReasonLabel: booking.declineReason ? labelForDeclineReason(booking.declineReason) : undefined,
    declineNotes: booking.declineNotes,
    // H3 (2026-05-27) — pass-through of date-negotiation state. All five
    // fields are optional on CompanionSessionDetail and stay undefined
    // until the corresponding stage runs.
    travellerWindows: booking.travellerWindows,
    companionSelectedWindow: booking.companionSelectedWindow,
    scheduledFor: booking.scheduledFor,
    durationMinutes: booking.durationMinutes,
    confirmedAt: booking.confirmedAt,
    // H4-stub (2026-05-27) — pass-through of payment-hold metadata. All
    // five fields stay undefined until status reaches payment_held.
    paymentSessionId: booking.paymentSessionId,
    paymentStatus: booking.paymentStatus,
    paymentAmount: booking.paymentAmount,
    paymentCurrency: booking.paymentCurrency,
    heldAt: booking.heldAt,
    // H5 — Day-of details pass-through. Companion sets these after
    // date_confirmed; both sides see them on detail GETs.
    meetingPoint: booking.meetingPoint,
    contactNumber: booking.contactNumber,
    dayOfNotes: booking.dayOfNotes,
    // H6 — Review metadata pass-through (mirrors traveller projector).
    // Lets the companion-side detail surface the score/comment once the
    // traveller submits, without leaking traveller identity.
    reviewedAt: booking.reviewedAt,
    reviewScore: booking.reviewScore,
    reviewComment: booking.reviewComment,
  };
}

// ===== Projector: BookingRecord → TravellerInquirySummary =====
//
// Direct (non-detail) projection. Skips the heavy fields the detail
// projector populates — `message`, `timeline`, `paymentState`, and
// `privacyNote` — because list rows don't render them. Saves work on
// the GET /api/traveller/inquiries hot path where every booking would
// otherwise allocate the full TravellerInquiryDetail object only to
// have `toInquirySummary` immediately strip it back down.

/**
 * Direct BookingRecord → TravellerInquirySummary projection. Skips the
 * heavy fields (message, timeline, paymentState, privacyNote) that the
 * detail projector populates — those aren't shown in list rows.
 */
export function projectBookingToTravellerInquirySummary(
  booking: BookingRecord,
  companionDisplayName: string,
): TravellerInquirySummary {
  return {
    id: booking.id,
    companionId: booking.companionId,
    companionDisplayName,
    city: booking.city,
    experience: booking.experience,
    status: booking.status,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    nextStep: nextStepFor(booking.status),
  };
}

// ===== Ownership predicates (security-sensitive) =====
//
// Centralize the email-normalization rule so future copy-paste at new
// detail-access sites can't accidentally drop the trim/lowercase that
// keeps the comparison safe against header casing or whitespace drift.
// Both predicates return false when the booking is null so callers can
// chain `isTravellerOwner(await readBooking(...), session)` without
// pre-checking for null.

/**
 * Verify the session belongs to the traveller who owns this booking.
 * Returns false if booking is missing or emails don't match (normalized).
 */
export function isTravellerOwner(
  booking: BookingRecord | null,
  session: Session,
): boolean {
  if (!booking) return false;
  return booking.travellerEmail === session.profile.email.trim().toLowerCase();
}

/**
 * Verify the session belongs to the companion the booking was routed to.
 * NOTE: Today companion emails on BookingRecord are synthetic — this check
 * will largely return false in production until Pass E gives companions
 * real verified emails. Use cautiously in v1; fixtures take over.
 */
export function isCompanionOwner(
  booking: BookingRecord | null,
  session: Session,
): boolean {
  if (!booking) return false;
  return booking.companionEmail === session.profile.email.trim().toLowerCase();
}

// ===== Load-then-fallback helpers =====
//
// Compresses the repeated "read from KV → project each row → if empty,
// fall back to fixture" pattern that every GET inquiry handler used to
// inline. `listOrFallback` covers list endpoints; `detailOrFallback`
// covers single-record endpoints (with an extra access-check step so
// the KV row only wins when the caller is authorized to see it).
//
// Both helpers are generic over the KV row type and the projected
// output type so the same shape works for traveller and companion
// projectors. Callers close over side parameters (like the companion
// display name, or a Muse chart) via arrow functions so the helper
// signatures stay narrow.

/**
 * Load a list from KV via `kvLoader`, project each item via `kvProjector`.
 * If the resulting list is empty, fall back to `fixtureLoader()`.
 * Generic over the KV row type and projected output type.
 */
export async function listOrFallback<TKv, TOut>(
  kvLoader: () => Promise<TKv[]>,
  kvProjector: (kvRow: TKv) => TOut,
  fixtureLoader: () => TOut[],
): Promise<TOut[]> {
  const kvRows = await kvLoader();
  if (kvRows.length === 0) return fixtureLoader();
  return kvRows.map(kvProjector);
}

/**
 * Load a single item from KV via `kvLoader`. If found AND `accessCheck` returns
 * true, project via `kvProjector` and return. Otherwise fall back to
 * `fixtureLoader()`. Returns null if both fail (caller maps null → 404).
 */
export async function detailOrFallback<TKv, TOut>(
  kvLoader: () => Promise<TKv | null>,
  accessCheck: (kvRow: TKv) => boolean,
  kvProjector: (kvRow: TKv) => TOut,
  fixtureLoader: () => TOut | undefined,
): Promise<TOut | null> {
  const kvRow = await kvLoader();
  if (kvRow && accessCheck(kvRow)) {
    return kvProjector(kvRow);
  }
  return fixtureLoader() ?? null;
}
