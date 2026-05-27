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
  await writeJson(kv, bookingKey(record.id), record);
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
  await writeJson(kv, bookingKey(id), cancelled);
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
  await writeJson(kv, bookingKey(id), updated);
  // Index membership doesn't change on status transitions — entries
  // stay until deleteBooking runs.
  return updated;
}

// Re-export for handler convenience
export { INQUIRY_INDEX_LIMIT };
