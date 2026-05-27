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
  InquiryStatus,
  TravellerInquiryDetail,
  TravellerInquiryRequest,
} from "../shared/contracts";

type BookingKv = KVNamespace | undefined;

const INQUIRY_INDEX_LIMIT = 50;

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
 */
export async function createBooking(
  kv: BookingKv,
  request: TravellerInquiryRequest,
  travellerEmail: string,
): Promise<BookingRecord> {
  const now = new Date().toISOString();
  const record: BookingRecord = {
    id: `inq_${crypto.randomUUID()}`,
    travellerEmail: travellerEmail.trim().toLowerCase(),
    companionEmail: companionEmailFor(request.companionId),
    companionId: request.companionId,
    city: request.city,
    experience: request.experience,
    status: "submitted",
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

  const updated: BookingRecord = {
    ...record,
    status: toStatus,
    updatedAt: new Date().toISOString(),
  };
  await persistRecord(kv, updated);
  // Index membership doesn't change on status transitions — entries
  // stay until deleteBooking runs. Using persistRecord (not
  // writeBooking) here preserves the cap-50 "newest-created first"
  // ordering instead of reshuffling indices on every status change.
  return updated;
}

// Re-export for handler convenience
export { INQUIRY_INDEX_LIMIT };

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
  };
}
