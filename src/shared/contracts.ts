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

export type ApiErrorEnvelope = {
  status: number;
  code: string;
  message: string;
  requestId: string;
  fieldErrors?: Record<string, string>;
};

export type ApiRouteMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type ApiRouteAudience =
  | "public"
  | "muse"
  | "auth"
  | "traveller"
  | "companion"
  | "payment"
  | "safety"
  | "account"
  | "system";

export type ApiRouteDefinition = {
  method: ApiRouteMethod;
  path: string;
  audience: ApiRouteAudience;
  handler: string;
  requestContract?: string;
  responseContract: string;
  auth: "anonymous" | "session" | "role:traveller" | "role:companion";
  stagedProvider: string;
  productionTarget: "D1" | "R2" | "KV" | "payment-provider" | "worker";
  notes: string;
};

export type ApiRouteRegistryResponse = {
  routes: ApiRouteDefinition[];
  requestIdHeader: "X-Request-Id";
  contractVersion: string;
};

export type StorageBoundaryKind = "D1" | "R2" | "KV";

export type StorageBoundary = {
  kind: StorageBoundaryKind;
  binding: string;
  status: "planned" | "staged-contract" | "production-required";
  owns: string[];
  mustNotStore: string[];
  migrationNote: string;
};

export type StorageBoundaryResponse = {
  boundaries: StorageBoundary[];
  complianceGate: string;
};

export type DataModelField = {
  name: string;
  type: string;
  required: boolean;
  private: boolean;
  note: string;
};

export type DataModelEntity = {
  name: string;
  storageTarget: StorageBoundaryKind;
  fields: DataModelField[];
  relationships: string[];
  states: string[];
};

export type DataModelSchemaResponse = {
  version: string;
  entities: DataModelEntity[];
  migrationOrder: string[];
};

export type UserRole = "traveller" | "companion" | "admin";

export type MuseConversationStage =
  | "arrival"
  | "birth_context"
  | "travel_context"
  | "desire_mapping"
  | "safety_boundaries"
  | "recommendation_ready";

export type MuseChatRole = "user" | "muse";
export type MuseRoleIntent = "traveller" | "companion" | "unknown";
export type MuseClientContextSource = "muse-entry" | "floating-trigger" | "protected-route";
export type MuseRouteKind =
  | "muse-entry"
  | "traveller-dashboard"
  | "traveller-discovery"
  | "traveller-profile"
  | "traveller-inquiry"
  | "traveller-plan"
  | "traveller-safety"
  | "companion-dashboard"
  | "companion-onboarding"
  | "companion-profile"
  | "companion-inbox"
  | "companion-plan"
  | "companion-safety"
  | "account"
  | "public";

export type MuseClientContext = {
  timezone?: string;
  route?: string;
  roleIntent?: MuseRoleIntent;
  source?: MuseClientContextSource;
  routeKind?: MuseRouteKind;
  routeLabel?: string;
  city?: CitySlug;
  companionId?: string;
  inquiryId?: string;
  planId?: string;
  experience?: ExperienceSlug;
};

export type MuseChatMessage = {
  id: string;
  role: MuseChatRole;
  content: string;
  createdAt: string;
};

export type MuseChatRequest = {
  conversationId?: string;
  message: string;
  stage?: MuseConversationStage;
  profileSignals?: MuseProfileSignals;
  clientContext?: MuseClientContext;
};

export type MuseProfileSignals = {
  birthContext: {
    date?: string;
    time?: string;
    place?: string;
    confidence: "none" | "partial" | "complete";
  };
  travelContext: {
    city?: CitySlug;
    timeframe?: string;
    experienceHints: ExperienceSlug[];
  };
  desireVector: string[];
  boundarySignals: string[];
  routingHints: {
    nextRoute?: string;
    requiresAuth: boolean;
    suggestedRole?: "traveller" | "companion";
  };
};

export type MuseChartTone = "rose" | "lavender" | "green" | "pearl";

export type MuseChartAxis = {
  label: string;
  value: string;
  tone: MuseChartTone;
};

export type MuseChartSignature = {
  title: string;
  tagline: string;
  summary: string;
  axes: MuseChartAxis[];
  cues: string[];
  nextPrompt: string;
};

export type MuseChatResponse = {
  conversationId: string;
  stage: MuseConversationStage;
  roleIntent?: MuseRoleIntent;
  contractVersion?: "muse-response-v2";
  policyVersion?: string;
  reply: MuseChatMessage;
  suggestedPrompts: string[];
  profileSignals: MuseProfileSignals;
  nextAction?: {
    label: string;
    href: string;
    kind: "route" | "auth" | "continue";
  };
  agentMode: "staged" | "external";
  chart: MuseChartSignature;
  quality?: {
    leakagePass: boolean;
    safetyPass: boolean;
    voicePass: boolean;
    retrievalPass?: boolean;
    injectionPass?: boolean;
    safetyCategory?: string;
    notes: string[];
  };
  observability?: {
    traceId: string;
    policyVersion: string;
    stage: MuseConversationStage;
    roleIntent: MuseRoleIntent;
    retrievedCount: number;
    blockedBySafety: boolean;
    createdAt: string;
  };
};

/**
 * Snapshot of a pre-auth Muse conversation, captured on the client in
 * localStorage and adopted into the user's account on auth completion.
 *
 * Stored under `museTranscript:${conversationId}` while anonymous; uploaded
 * to MUSE_CONVERSATIONS KV under `user:${userId}:conv:${conversationId}`
 * on successful auth verify().
 */
export type MuseTranscriptSnapshot = {
  conversationId: string;
  stage: MuseConversationStage;
  messages: MuseChatMessage[];
  profileSignals?: MuseProfileSignals;
  clientContext?: MuseClientContext;
  capturedAt: string;
};

export type MuseAdoptRequest = {
  snapshot: MuseTranscriptSnapshot;
};

export type MuseAdoptResponse = {
  conversationId: string;
  adoptedAt: string;
  ownerUserId: string;
  messageCount: number;
};

/**
 * Summary surface for a user's adopted Muse threads (dashboard list).
 * The full transcript is fetched separately via GET conversations/:id.
 */
export type MuseConversationSummary = {
  conversationId: string;
  stage: MuseConversationStage;
  messageCount: number;
  capturedAt: string;
  adoptedAt: string;
  lastMessagePreview: string;
  lastMessageRole: MuseChatRole;
};

export type MuseConversationListResponse = {
  conversations: MuseConversationSummary[];
};

export type MuseConversationDetailResponse = {
  conversation: MuseTranscriptSnapshot & {
    adoptedAt: string;
    ownerUserId: string;
  };
};

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
  csrfToken?: string;
};

export type SessionState = {
  session: Session | null;
  status: "anonymous" | "active";
  protectedRoutesEnabled: boolean;
  csrfToken?: string | null;
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
  csrfToken?: string;
};

export type RoleSwitchRequest = {
  role: Extract<UserRole, "traveller" | "companion">;
};

export type AccountPrivacySettings = {
  showEmailInAccount: boolean;
  allowRoleSwitch: boolean;
  receiveSafetyUpdates: boolean;
  receiveInquiryUpdates: boolean;
};

export type AccountResponse = {
  profile: SessionProfile;
  privacy: AccountPrivacySettings;
  safetyState: {
    reportingAvailable: boolean;
    paymentComplianceGate: "active";
    note: string;
  };
  // Pass E (2026-05-26) — bundled state so AccountSettings loads in one round trip.
  // Individual POST/DELETE/GET endpoints still exist for per-card refresh.
  dataExport?: AccountDataExportRequest | null;
  deletion?: AccountDeletionRecord | null;
  safetyReports?: AccountSafetyReportSummary[];
};

export type AccountPrivacyUpdateRequest = Partial<AccountPrivacySettings>;

export type AccountPrivacyUpdateResponse = {
  account: AccountResponse;
};

// ===== Account data-export, deletion, safety-report list =====
// Pass E (2026-05-26) — turns the descriptive AccountSettings stub cards
// into real backed product. Persists in KV under account:{userEmail}:{kind}.

export type AccountDataExportStatus = "queued" | "preparing" | "ready" | "expired";

export type AccountDataExportRequest = {
  id: string;                  // dex_{uuid}
  requestedAt: string;         // ISO timestamp
  status: AccountDataExportStatus;
  completedAt?: string;        // set when status === "ready"
  expiresAt?: string;          // set when status === "ready" (7d window)
  downloadUrl?: string;        // signed URL or app route; future R2 backed
};

export type AccountDataExportCreateResponse = {
  export: AccountDataExportRequest;
  message: string;             // "Tirak will email when your export is ready."
};

export type AccountDeletionStatus = "pending" | "cancelled" | "completed";

export type AccountDeletionRecord = {
  requestedAt: string;         // ISO timestamp
  scheduledFor: string;        // ISO timestamp (requestedAt + 7d)
  status: AccountDeletionStatus;
  reason?: string;             // optional free-text from the user
};

export type AccountDeletionCreateRequest = {
  confirmation: string;        // must be exactly "DELETE"
  reason?: string;             // optional
};

export type AccountDeletionResponse = {
  deletion: AccountDeletionRecord | null;
  message: string;
};

export type AccountSafetyReportSummary = {
  id: string;                  // reportId from POST /api/safety/reports
  targetType: SafetyReportRequest["targetType"];
  reasonCategory: SafetyReportRequest["reasonCategory"];
  summary: string;             // truncated for the list view (max 120 chars)
  submittedAt: string;
  status: "submitted" | "under_review" | "resolved";
};

export type AccountSafetyReportListResponse = {
  reports: AccountSafetyReportSummary[];
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

export type SafetyReportRequest = {
  targetType: "profile" | "inquiry" | "payment" | "account" | "other";
  targetId?: string;
  reasonCategory: "privacy" | "unsafe_request" | "payment_pressure" | "profile_accuracy" | "other";
  summary: string;
  contactAllowed: boolean;
};

export type SafetyReportResponse = {
  reportId: string;
  status: "submitted";
  nextStep: string;
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
  avatarUrl?: string;
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
  chart: MuseChartSignature;
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
  chart: MuseChartSignature;
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

export type LoggedInMetric = {
  label: string;
  value: string;
  note: string;
};

export type SessionChecklistItem = {
  label: string;
  status: "complete" | "active" | "pending" | "blocked";
  note: string;
};

export type TravellerSessionSummary = {
  id: string;
  inquiryId: string;
  companionId: string;
  companionDisplayName: string;
  companionAvatarUrl?: string;
  city: CitySlug;
  experience: ExperienceSlug;
  status: "reviewing" | "scheduled" | "awaiting_confirmation" | "completed" | "blocked";
  scheduledFor: string;
  venueArea: string;
  routeLabel: string;
  nextStep: string;
};

export type TravellerSessionDetail = TravellerSessionSummary & {
  museRead: MuseChartSignature;
  itinerary: SessionChecklistItem[];
  messageThread: MuseChatMessage[];
  safetyNotes: string[];
  paymentState: TravellerInquiryDetail["paymentState"];
  privacyNote: string;
};

export type TravellerSessionListResponse = {
  results: TravellerSessionSummary[];
  emptyState: {
    title: string;
    description: string;
  };
};

export type TravellerDashboardResponse = {
  chart: MuseChartSignature;
  greeting: string;
  summary: string;
  metrics: LoggedInMetric[];
  activeInquiry: TravellerInquiryDetail;
  upcomingSession: TravellerSessionSummary;
  savedProfiles: CompanionPreview[];
  sessionPreview: TravellerSessionSummary[];
  guidance: string[];
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
  chart: MuseChartSignature;
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
  chart: MuseChartSignature;
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

export type CompanionSessionDetail = CompanionInquirySummary & {
  travellerContext: string;
  museFit: MuseChartSignature;
  decisionOptions: {
    label: string;
    value: "request_review" | "accept_after_review" | "decline_safely";
    description: string;
  }[];
  checklist: SessionChecklistItem[];
  messageThread: MuseChatMessage[];
  paymentState: TravellerInquiryDetail["paymentState"];
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
  status: "adapter_candidate" | "research" | "compliance_hold" | "test_mode" | "fallback";
  localRails: string[];
  approvalRisk: "low" | "medium" | "high" | "unknown";
  implementationNote: string;
};

export type PaymentSessionResult =
  | {
      status: "blocked";
      code: "PAYMENT_PROVIDER_NOT_APPROVED" | "PAYMENT_PROVIDER_NOT_CONFIGURED" | "PAYMENT_PROVIDER_ERROR";
      message: string;
      provider: PaymentProviderSummary["id"];
    }
  | {
      status: "created";
      provider: PaymentProviderSummary["id"];
      checkoutSessionId: string;
      checkoutUrl: string;
    };
