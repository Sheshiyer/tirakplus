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

export type UserRole = "traveller" | "companion" | "admin";

export type SessionProfile = {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
};

export type Session = {
  id: string;
  profile: SessionProfile;
  expiresAt: string;
};

export type SessionState = {
  session: Session | null;
  status: "anonymous" | "active";
  protectedRoutesEnabled: boolean;
};

export type AuthStartRequest = {
  email: string;
};

export type AuthStartResponse = {
  email: string;
  status: "verification_pending";
  delivery: "email";
  nextStep: "verify_code";
};

export type AuthVerifyRequest = {
  email: string;
  code: string;
  role?: Extract<UserRole, "traveller" | "companion">;
};

export type AuthVerifyResponse = {
  session: Session;
};

export type RoleSwitchRequest = {
  role: Extract<UserRole, "traveller" | "companion">;
};

export type HomeEntryPath = {
  role: "traveller" | "companion";
  label: string;
  heading: string;
  description: string;
  href: string;
};

export type SafetyContent = {
  title: string;
  principles: string[];
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
