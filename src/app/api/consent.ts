/**
 * consent.ts — Client-side persistence for the age-consent gate.
 *
 * The gate sits BEFORE /auth/start (role pick) and BEFORE
 * /auth/verify (OTP). A passed ConsentRecord is required to reach
 * either. Persisted to localStorage so a returning user on the same
 * device doesn't re-gate every visit.
 *
 * v1 = client-side only. If/when we add server-side audit trail
 * (regulatory), introduce a POST /api/account/consent endpoint that
 * mirrors this record into KV keyed by hashed email, and have this
 * module call that endpoint on writeConsent().
 */
import type { ConsentRecord } from "../../shared/contracts";

/** Storage key. Version bump (e.g. v2) invalidates older accepted records
 *  and forces re-consent — use when consent labels change materially. */
export const CONSENT_STORAGE_KEY = "tirakplus:consent:v1";

/** Current schema version — must match ConsentRecord.version. */
export const CONSENT_SCHEMA_VERSION = 1 as const;

/**
 * Read the stored consent record, or null if absent / malformed.
 * Returns null without throwing — caller decides redirect logic.
 */
export function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (!isConsentRecord(parsed)) return null;
    if (parsed.version !== CONSENT_SCHEMA_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Persist a fresh consent record. Silently no-ops if localStorage is
 * unavailable (Safari private mode, quota exceeded). Caller should still
 * proceed with the flow — re-gating on next visit is acceptable.
 */
export function writeConsent(record: ConsentRecord): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Quota / private mode — drop silently. User will re-gate next visit.
  }
}

/** Wipe the consent record. Useful for the "withdraw consent" path in account settings. */
export function clearConsent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * True iff a valid consent record is present AND all 4 acknowledgments
 * are truthy. Routing guards use this to decide whether to redirect to
 * /age-consent.
 */
export function hasValidConsent(): boolean {
  const record = readConsent();
  if (!record) return false;
  return (
    record.ageConfirmed === true &&
    record.consentDiscretion === true &&
    record.consentRespect === true &&
    record.consentTerms === true
  );
}

/** Convenience constructor — stamp acceptedAt + version at call time. */
export function buildConsentRecord(args: {
  ageConfirmed: boolean;
  consentDiscretion: boolean;
  consentRespect: boolean;
  consentTerms: boolean;
}): ConsentRecord {
  return {
    ageConfirmed: args.ageConfirmed,
    consentDiscretion: args.consentDiscretion,
    consentRespect: args.consentRespect,
    consentTerms: args.consentTerms,
    acceptedAt: new Date().toISOString(),
    version: CONSENT_SCHEMA_VERSION,
  };
}

function isConsentRecord(value: unknown): value is ConsentRecord {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.ageConfirmed === "boolean" &&
    typeof r.consentDiscretion === "boolean" &&
    typeof r.consentRespect === "boolean" &&
    typeof r.consentTerms === "boolean" &&
    typeof r.acceptedAt === "string" &&
    typeof r.version === "number"
  );
}
