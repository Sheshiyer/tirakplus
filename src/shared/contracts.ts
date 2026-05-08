export type CitySlug = "bangkok" | "phuket" | "koh-samui" | "koh-phangan";

export type ExperienceSlug =
  | "nightlife"
  | "island-explorer"
  | "muay-thai-night"
  | "private-dining"
  | "local-guidance";

export type ApiEnvelope<T> = {
  data: T;
  requestId: string;
};

export type CitySummary = {
  slug: CitySlug;
  name: string;
  tone: string;
  trustNote: string;
};

export type ExperienceSummary = {
  slug: ExperienceSlug;
  city: CitySlug;
  title: string;
  summary: string;
  safetyNote: string;
};

export type CompanionPreview = {
  id: string;
  displayName: string;
  city: CitySlug;
  experienceTags: ExperienceSlug[];
  verificationState: "approved" | "pending_verification" | "changes_requested";
  availabilitySummary: string;
  profileTone: string;
};

export type PaymentProviderSummary = {
  id:
    | "stripe"
    | "kbank"
    | "scb"
    | "2c2p"
    | "bangkok_bank"
    | "gbprimepay"
    | "high_risk_card"
    | "manual_review";
  label: string;
  status: "adapter_candidate" | "research" | "compliance_hold" | "fallback";
  localRails: string[];
  approvalRisk: "low" | "medium" | "high" | "unknown";
  implementationNote: string;
};

export type PaymentSessionResult =
  | {
      status: "blocked";
      code: "PAYMENT_PROVIDER_NOT_APPROVED";
      message: string;
      provider: PaymentProviderSummary["id"];
    }
  | {
      status: "created";
      provider: PaymentProviderSummary["id"];
      checkoutUrl: string;
    };
