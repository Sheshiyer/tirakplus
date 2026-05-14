import type { StorageBoundaryResponse } from "../shared/contracts";

export const storageBoundaryResponse: StorageBoundaryResponse = {
  complianceGate:
    "Live payment, media publication, and public companion visibility remain disabled until jurisdiction, provider, and review approvals are recorded.",
  boundaries: [
    {
      kind: "D1",
      binding: "DB",
      status: "planned",
      owns: [
        "User",
        "TravellerProfile",
        "CompanionProfile",
        "AvailabilityWindow",
        "Inquiry",
        "PaymentRecord",
        "StripeWebhookEvent",
        "SafetyReport",
        "AuditEvent",
      ],
      mustNotStore: [
        "raw card data",
        "unverified webhook payloads as trusted state",
        "public profile fields without review status",
      ],
      migrationNote:
        "D1 becomes the source of truth after the staged provider contract is replaced with repository methods using the same response types.",
    },
    {
      kind: "R2",
      binding: "MEDIA_BUCKET",
      status: "planned",
      owns: [
        "approved profile media references",
        "review-only identity document references",
        "generated brand assets approved for production use",
      ],
      mustNotStore: [
        "unreviewed generated portraits on public surfaces",
        "raw identity files without encrypted metadata and access policy",
        "temporary uploads without lifecycle expiry",
      ],
      migrationNote:
        "R2 stores objects only; D1 stores media records, review state, owner, visibility, and public-safe derivative references.",
    },
    {
      kind: "KV",
      binding: "CONFIG",
      status: "staged-contract",
      owns: [
        "non-sensitive city and experience labels",
        "feature flags",
        "payment provider mode",
        "safety content version",
      ],
      mustNotStore: [
        "sessions",
        "private identity material",
        "inquiry messages",
        "payment records",
      ],
      migrationNote:
        "KV can cache non-sensitive lookup/config data; all user, inquiry, review, and payment state remains in D1.",
    },
  ],
};
