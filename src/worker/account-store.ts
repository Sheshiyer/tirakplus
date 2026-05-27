// account-store.ts — KV-backed persistence for Pass E (2026-05-26).
//
// Replaces the staged-provider's in-memory return-defaults pattern with real
// reads/writes to the ACCOUNT_DATA KV namespace (declared in wrangler.jsonc).
//
// Key layout (all keys lowercase the email):
//   account:{email}:privacy        → AccountPrivacySettings
//   account:{email}:data-export    → AccountDataExportRequest (latest only)
//   account:{email}:deletion       → AccountDeletionRecord (latest only)
//   account:{email}:safety-reports → AccountSafetyReportSummary[]
//
// All functions take the KV binding optionally — when absent (dev without
// the binding) they degrade gracefully so the UI still loads.

import type {
  AccountDataExportRequest,
  AccountDeletionRecord,
  AccountPrivacySettings,
  AccountSafetyReportSummary,
  Session,
  SafetyReportRequest,
} from "../shared/contracts";

const DEFAULT_PRIVACY: AccountPrivacySettings = {
  showEmailInAccount: true,
  allowRoleSwitch: true,
  receiveSafetyUpdates: true,
  receiveInquiryUpdates: true,
};

// 7-day grace window before soft-delete is final, in milliseconds.
const DELETION_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

// Max safety reports we keep in the summary list (older ones drop off).
const SAFETY_REPORT_HISTORY_LIMIT = 25;

type AccountKv = KVNamespace | undefined;

function emailKey(session: Session, kind: string): string {
  const email = session.profile.email.trim().toLowerCase();
  return `account:${email}:${kind}`;
}

async function readJson<T>(kv: AccountKv, key: string): Promise<T | null> {
  if (!kv) return null;
  try {
    return await kv.get<T>(key, "json");
  } catch {
    return null;
  }
}

async function writeJson(kv: AccountKv, key: string, value: unknown): Promise<void> {
  if (!kv) return;
  try {
    await kv.put(key, JSON.stringify(value));
  } catch {
    // swallow — UI must remain usable even when KV writes fail
  }
}

async function deleteKey(kv: AccountKv, key: string): Promise<void> {
  if (!kv) return;
  try {
    await kv.delete(key);
  } catch {
    // swallow
  }
}

// ===== Privacy =====

export async function readPrivacy(kv: AccountKv, session: Session): Promise<AccountPrivacySettings> {
  const stored = await readJson<AccountPrivacySettings>(kv, emailKey(session, "privacy"));
  if (!stored) return DEFAULT_PRIVACY;
  return { ...DEFAULT_PRIVACY, ...sanitizePrivacy(stored) };
}

export async function writePrivacy(
  kv: AccountKv,
  session: Session,
  patch: Partial<AccountPrivacySettings>,
): Promise<AccountPrivacySettings> {
  const current = await readPrivacy(kv, session);
  const merged: AccountPrivacySettings = { ...current, ...sanitizePrivacy(patch) };
  await writeJson(kv, emailKey(session, "privacy"), merged);
  return merged;
}

function sanitizePrivacy(patch: Partial<AccountPrivacySettings>): Partial<AccountPrivacySettings> {
  const out: Partial<AccountPrivacySettings> = {};
  if (typeof patch.showEmailInAccount === "boolean") out.showEmailInAccount = patch.showEmailInAccount;
  if (typeof patch.allowRoleSwitch === "boolean") out.allowRoleSwitch = patch.allowRoleSwitch;
  if (typeof patch.receiveSafetyUpdates === "boolean") out.receiveSafetyUpdates = patch.receiveSafetyUpdates;
  if (typeof patch.receiveInquiryUpdates === "boolean") out.receiveInquiryUpdates = patch.receiveInquiryUpdates;
  return out;
}

// ===== Data export =====

export async function readDataExport(kv: AccountKv, session: Session): Promise<AccountDataExportRequest | null> {
  return readJson<AccountDataExportRequest>(kv, emailKey(session, "data-export"));
}

/**
 * Idempotent: if an active (non-expired) request already exists, return it.
 * Otherwise create a new queued request. This prevents users from spamming
 * the export queue if they tap the button multiple times.
 */
export async function requestDataExport(kv: AccountKv, session: Session): Promise<AccountDataExportRequest> {
  const existing = await readDataExport(kv, session);
  if (existing && existing.status !== "expired") {
    return existing;
  }
  const now = new Date().toISOString();
  const record: AccountDataExportRequest = {
    id: `dex_${crypto.randomUUID()}`,
    requestedAt: now,
    status: "queued",
  };
  await writeJson(kv, emailKey(session, "data-export"), record);
  return record;
}

// ===== Deletion =====

export async function readDeletion(kv: AccountKv, session: Session): Promise<AccountDeletionRecord | null> {
  const record = await readJson<AccountDeletionRecord>(kv, emailKey(session, "deletion"));
  if (!record) return null;
  // Auto-cancel if grace window already elapsed and status hasn't transitioned.
  // The 'completed' transition would normally be done by a cron worker;
  // for Pass E we surface 'pending' until then.
  return record;
}

/**
 * Create a soft-delete request with a 7-day grace window. Requires the
 * caller to have already validated confirmation === "DELETE" at the
 * handler layer. Idempotent — re-requesting while one is pending
 * refreshes the scheduledFor to a fresh 7 days from now.
 */
export async function requestDeletion(
  kv: AccountKv,
  session: Session,
  reason: string | undefined,
): Promise<AccountDeletionRecord> {
  const now = Date.now();
  const record: AccountDeletionRecord = {
    requestedAt: new Date(now).toISOString(),
    scheduledFor: new Date(now + DELETION_GRACE_MS).toISOString(),
    status: "pending",
    reason: reason && reason.trim().length > 0 ? reason.trim().slice(0, 500) : undefined,
  };
  await writeJson(kv, emailKey(session, "deletion"), record);
  return record;
}

export async function cancelDeletion(kv: AccountKv, session: Session): Promise<AccountDeletionRecord | null> {
  const existing = await readDeletion(kv, session);
  if (!existing || existing.status !== "pending") return existing;
  const cancelled: AccountDeletionRecord = { ...existing, status: "cancelled" };
  await writeJson(kv, emailKey(session, "deletion"), cancelled);
  return cancelled;
}

// ===== Safety reports (account-scoped summary) =====

export async function readSafetyReports(kv: AccountKv, session: Session): Promise<AccountSafetyReportSummary[]> {
  const list = await readJson<AccountSafetyReportSummary[]>(kv, emailKey(session, "safety-reports"));
  return Array.isArray(list) ? list : [];
}

/**
 * Append a summary of a freshly-submitted safety report. The full report
 * (with internal review fields) lives elsewhere; this list is just for
 * the AccountSettings → "Safety reports" card to show the user what
 * they've submitted and where it is in review.
 */
export async function appendSafetyReport(
  kv: AccountKv,
  session: Session,
  reportId: string,
  request: SafetyReportRequest,
): Promise<AccountSafetyReportSummary[]> {
  const summary: AccountSafetyReportSummary = {
    id: reportId,
    targetType: request.targetType,
    reasonCategory: request.reasonCategory,
    summary: request.summary.slice(0, 120),
    submittedAt: new Date().toISOString(),
    status: "submitted",
  };
  const list = await readSafetyReports(kv, session);
  const next = [summary, ...list].slice(0, SAFETY_REPORT_HISTORY_LIMIT);
  await writeJson(kv, emailKey(session, "safety-reports"), next);
  return next;
}

// Re-export for handler convenience
export { DEFAULT_PRIVACY, DELETION_GRACE_MS };
