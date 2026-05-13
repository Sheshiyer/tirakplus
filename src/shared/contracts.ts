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
  availabilityStatus: "available" | "planning_only" | "hidden";
  availabilitySummary: string;
  profileTone: string;
};

export type DiscoveryFilterSelection = {
  city: CitySlug | "all";
  experience: ExperienceSlug | "all";
  availability: "any" | "available" | "planning_only";
  verified: "approved" | "all";
};

export type DiscoveryFilterOption<TValue extends string> = {
  value: TValue;
  label: string;
  description?: string;
};

export type DiscoveryFilterModel = {
  cities: DiscoveryFilterOption<CitySlug | "all">[];
  experiences: DiscoveryFilterOption<ExperienceSlug | "all">[];
  availability: DiscoveryFilterOption<DiscoveryFilterSelection["availability"]>[];
  verified: DiscoveryFilterOption<DiscoveryFilterSelection["verified"]>[];
};

export type DiscoveryResponse = {
  filters: DiscoveryFilterSelection;
  filterOptions: DiscoveryFilterModel;
  results: CompanionPreview[];
  emptyState: {
    title: string;
    description: string;
  };
  guidance: string[];
};

export type AvailabilityWindow = {
  id: string;
  city: CitySlug;
  label: string;
  status: "available" | "tentative" | "hidden";
  note: string;
};

export type ProfileExperienceFit = {
  slug: ExperienceSlug;
  title: string;
  fitNote: string;
};

export type CompanionProfile = CompanionPreview & {
  visibilityState: "public" | "restricted";
  bio: string;
  verification: {
    label: string;
    reviewNote: string;
  };
  availabilityWindows: AvailabilityWindow[];
  experienceFit: ProfileExperienceFit[];
  safetyNote: string;
  inquiryGuidance: string[];
};

export type InquiryStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "payment_review"
  | "routed"
  | "accepted"
  | "declined"
  | "cancelled";

export type TravellerInquiryRequest = {
  companionId: string;
  city: CitySlug;
  experience: ExperienceSlug;
  preferredWindow: string;
  message: string;
  privacyAcknowledged: boolean;
};

export type TravellerInquirySummary = {
  id: string;
  companionId: string;
  companionDisplayName: string;
  city: CitySlug;
  experience: ExperienceSlug;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  nextStep: string;
};

export type TravellerInquiryDetail = TravellerInquirySummary & {
  message: string;
  timeline: {
    label: string;
    status: "complete" | "active" | "pending";
    note: string;
  }[];
  paymentState: {
    status: "not_started" | "disabled_for_compliance" | "pending_review";
    provider: PaymentProviderSummary["id"] | "none";
    note: string;
  };
  privacyNote: string;
};

export type TravellerInquiryListResponse = {
  results: TravellerInquirySummary[];
  emptyState: {
    title: string;
    description: string;
  };
};

export type TravellerInquiryCreateResponse = {
  inquiry: TravellerInquiryDetail;
};

export type CompanionReviewStatus =
  | "draft"
  | "pending_verification"
  | "changes_requested"
  | "approved"
  | "rejected";

export type CompanionOnboardingStepId =
  | "welcome"
  | "basics"
  | "bio"
  | "city_experience"
  | "visibility"
  | "verification"
  | "submitted";

export type CompanionOnboardingStep = {
  id: CompanionOnboardingStepId;
  label: string;
  description: string;
  status: "complete" | "active" | "pending";
};

export type CompanionVisibilitySettings = {
  publicProfile: boolean;
  showCity: boolean;
  showAvailability: boolean;
  acceptInquiries: boolean;
};

export type CompanionDraftProfile = {
  id: string;
  displayName: string;
  legalName: string;
  city: CitySlug;
  experienceTags: ExperienceSlug[];
  bio: string;
  profileTone: string;
  privateReviewNote: string;
  verificationReferences: string[];
  visibilitySettings: CompanionVisibilitySettings;
  availabilityWindows: AvailabilityWindow[];
  reviewStatus: CompanionReviewStatus;
  reviewNote: string;
  updatedAt: string;
};

export type CompanionOptionSet = {
  cities: DiscoveryFilterOption<CitySlug>[];
  experiences: DiscoveryFilterOption<ExperienceSlug>[];
};

export type CompanionOnboardingState = {
  profile: CompanionDraftProfile;
  steps: CompanionOnboardingStep[];
  options: CompanionOptionSet;
  progress: {
    completed: number;
    total: number;
    label: string;
  };
  guidance: string[];
  requiredActions: string[];
};

export type CompanionProfileUpdateRequest = Partial<{
  displayName: string;
  legalName: string;
  city: CitySlug;
  experienceTags: ExperienceSlug[];
  bio: string;
  profileTone: string;
  privateReviewNote: string;
  verificationReferences: string[];
}>;

export type CompanionProfileUpdateResponse = {
  profile: CompanionDraftProfile;
  onboarding: CompanionOnboardingState;
};

export type CompanionVisibilityUpdateRequest = Partial<CompanionVisibilitySettings>;

export type CompanionAvailabilityUpdateRequest = {
  availabilityWindows: AvailabilityWindow[];
};

export type CompanionVerificationSubmitRequest = {
  identityAcknowledged: boolean;
  visibilityAcknowledged: boolean;
  safetyAcknowledged: boolean;
};

export type CompanionVerificationSubmitResponse = {
  profile: CompanionDraftProfile;
  submittedAt: string;
  nextStep: string;
};

export type CompanionReviewStateCard = {
  status: CompanionReviewStatus;
  label: string;
  description: string;
  action: string;
};

export type CompanionDashboardResponse = {
  profile: CompanionDraftProfile;
  progress: CompanionOnboardingState["progress"];
  reviewStates: CompanionReviewStateCard[];
  panels: {
    title: string;
    description: string;
    href: string;
  }[];
  safetyGuidance: string[];
};

export type CompanionInquirySummary = {
  id: string;
  travellerLabel: string;
  city: CitySlug;
  experience: ExperienceSlug;
  status: InquiryStatus;
  preferredWindow: string;
  receivedAt: string;
  nextStep: string;
  privacyNote: string;
};

export type CompanionInquiryListResponse = {
  results: CompanionInquirySummary[];
  emptyState: {
    title: string;
    description: string;
  };
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
