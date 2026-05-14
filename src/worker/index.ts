import { json, apiError, createRequestId } from "./http";
import {
  createStagedDataProvider,
  isProviderAvailabilityWindow,
  isProviderCity,
  isProviderExperience,
} from "./staged-provider";
import { routeAuth, getSessionFromRequest } from "./auth";
import { createPaymentSession, paymentProviders } from "./payment-provider";
import { getRouteRegistry } from "./route-registry";
import { storageBoundaryResponse } from "./storage-boundaries";
import { dataModelSchema } from "./data-model-schema";
import type {
  AccountPrivacyUpdateRequest,
  AvailabilityWindow,
  CitySlug,
  CompanionAvailabilityUpdateRequest,
  CompanionDraftProfile,
  CompanionOptionSet,
  CompanionOnboardingStep,
  CompanionOnboardingState,
  CompanionProfileUpdateRequest,
  CompanionVerificationSubmitRequest,
  CompanionVisibilityUpdateRequest,
  DiscoveryFilterSelection,
  ExperienceSlug,
  SafetyReportRequest,
  TravellerInquiryDetail,
  TravellerInquiryRequest,
} from "../shared/contracts";

async function routeApi(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const { pathname, searchParams } = url;
  const requestId = createRequestId(request);
  const provider = createStagedDataProvider();
  const ok = <T>(data: T, init: ResponseInit = {}) => json(data, { ...init, requestId });
  const fail = (
    status: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string>,
    init: ResponseInit = {},
  ) => apiError(status, code, message, fieldErrors, { ...init, requestId });

  const authResponse = await routeAuth(request, pathname, requestId);
  if (authResponse) return authResponse;

  if (request.method === "GET" && pathname === "/api/system/routes") {
    return ok(getRouteRegistry());
  }

  if (request.method === "GET" && pathname === "/api/system/storage-boundaries") {
    return ok(storageBoundaryResponse);
  }

  if (request.method === "GET" && pathname === "/api/system/data-model") {
    return ok(dataModelSchema);
  }

  if (request.method === "GET" && pathname === "/api/public/home") {
    return ok(provider.getHome());
  }

  if (request.method === "GET" && pathname === "/api/public/experiences") {
    return ok(
      provider.listExperiences({
        city: searchParams.get("city"),
        category: searchParams.get("category"),
      }),
    );
  }

  if (pathname.startsWith("/api/traveller/")) {
    const roleError = requireCustomerRole(request, "traveller", fail);
    if (roleError) return roleError;
  }

  if (pathname.startsWith("/api/companion/")) {
    const roleError = requireCustomerRole(request, "companion", fail);
    if (roleError) return roleError;
  }

  if (request.method === "GET" && pathname === "/api/traveller/discovery") {
    const filters = parseDiscoveryFilters(searchParams);
    const data = provider.listCompanionPreviews().filter((item) => {
      const cityMatches = filters.city === "all" ? true : item.city === filters.city;
      const experienceMatches = filters.experience === "all" ? true : item.experienceTags.includes(filters.experience);
      const availabilityMatches = filters.availability === "any" ? true : item.availabilityStatus === filters.availability;
      const verifiedMatches = filters.verified === "all" ? true : item.verificationState === "approved";
      return cityMatches && experienceMatches && availabilityMatches && verifiedMatches;
    });

    return ok({
      filters,
      filterOptions: provider.getDiscoveryFilterOptions(),
      results: data,
      emptyState: {
        title: "No reviewed profiles match these filters.",
        description: "Adjust the city, experience, or availability context. Tirak does not create fake scarcity or online-now pressure.",
      },
      guidance: [
        "Discovery shows review state and planning context instead of ratings.",
        "Availability is not an instant-booking promise.",
        "Inquiry review happens before routing or payment.",
      ],
    });
  }

  const availabilityMatch = pathname.match(/^\/api\/traveller\/companions\/([^/]+)\/availability$/);
  if (request.method === "GET" && availabilityMatch) {
    const profile = provider.getCompanionProfile(availabilityMatch[1]);
    if (!profile) return fail(404, "PROFILE_NOT_FOUND", "This profile is unavailable.");
    if (profile.visibilityState !== "public") {
      return fail(423, "PROFILE_UNAVAILABLE", "Availability is hidden while this profile is under review.");
    }
    return ok({
      companionId: profile.id,
      windows: profile.availabilityWindows,
      note: "Availability is planning context and must pass review before routing.",
    });
  }

  const companionMatch = pathname.match(/^\/api\/traveller\/companions\/([^/]+)$/);
  if (request.method === "GET" && companionMatch) {
    const profile = provider.getCompanionProfile(companionMatch[1]);
    if (!profile) return fail(404, "PROFILE_NOT_FOUND", "This profile is unavailable.");
    if (profile.visibilityState !== "public") {
      return fail(423, "PROFILE_UNAVAILABLE", "This profile is still under review and cannot receive inquiries.");
    }
    return ok(profile);
  }

  if (request.method === "POST" && pathname === "/api/traveller/inquiries") {
    const body = await readJsonBody<TravellerInquiryRequest>(request, requestId);
    if (body instanceof Response) return body;

    const fieldErrors = validateInquiry(body);
    if (Object.keys(fieldErrors).length > 0) {
      return fail(422, "INQUIRY_VALIDATION_FAILED", "Review the inquiry fields and try again.", fieldErrors);
    }

    const profile = provider.getCompanionProfile(body.companionId);
    if (!profile || profile.visibilityState !== "public") {
      return fail(404, "PROFILE_NOT_FOUND", "This profile is unavailable for inquiry.");
    }

    return ok(
      {
        inquiry: createInquiryDetail(body, profile.displayName),
      },
      { status: 201 },
    );
  }

  if (request.method === "GET" && pathname === "/api/traveller/inquiries") {
    return ok({
      results: provider.listTravellerInquiries().map(toInquirySummary),
      emptyState: {
        title: "No private inquiries yet.",
        description: "Start from a reviewed profile and submit a respectful inquiry for human review.",
      },
    });
  }

  const inquiryMatch = pathname.match(/^\/api\/traveller\/inquiries\/([^/]+)$/);
  if (request.method === "GET" && inquiryMatch) {
    const inquiry = provider.getTravellerInquiry(inquiryMatch[1]);
    if (!inquiry) return fail(404, "INQUIRY_NOT_FOUND", "This inquiry is unavailable.");
    return ok(inquiry);
  }

  if (request.method === "GET" && pathname === "/api/companion/onboarding") {
    return ok(createOnboardingState(provider.getCompanionDraftProfile(), provider.getCompanionOptions()));
  }

  if (request.method === "GET" && pathname === "/api/companion/dashboard") {
    const profile = provider.getCompanionDraftProfile();
    const onboarding = createOnboardingState(profile, provider.getCompanionOptions());
    return ok({
      profile,
      progress: onboarding.progress,
      reviewStates: provider.listCompanionReviewStates(),
      panels: [
        {
          title: "Profile draft",
          description: "Edit public tone, private review fields, and safe preview details before submission.",
          href: "/companion/profile",
        },
        {
          title: "Availability",
          description: "Keep city windows visibility-scoped; hidden windows do not appear in discovery.",
          href: "/companion/plans",
        },
        {
          title: "Private inquiries",
          description: "Review incoming requests only after Tirak completes routing and safety checks.",
          href: "/companion/inbox",
        },
      ],
      safetyGuidance: companionSafetyGuidance,
    });
  }

  if (request.method === "GET" && pathname === "/api/companion/inquiries") {
    return ok({
      results: provider.listCompanionInquiries(),
      emptyState: {
        title: "No routed inquiries yet.",
        description: "Tirak only routes inquiries after review; no fake demand or online-now pressure is shown.",
      },
    });
  }

  if (request.method === "PATCH" && pathname === "/api/companion/profile") {
    const body = await readJsonBody<CompanionProfileUpdateRequest>(request, requestId);
    if (body instanceof Response) return body;

    const fieldErrors = validateCompanionProfileUpdate(body);
    if (Object.keys(fieldErrors).length > 0) {
      return fail(422, "COMPANION_PROFILE_VALIDATION_FAILED", "Review the profile fields and try again.", fieldErrors);
    }

    const profile = mergeCompanionProfile(provider.getCompanionDraftProfile(), body);
    return ok({
      profile,
      onboarding: createOnboardingState(profile, provider.getCompanionOptions()),
    });
  }

  if (request.method === "PATCH" && pathname === "/api/companion/visibility") {
    const body = await readJsonBody<CompanionVisibilityUpdateRequest>(request, requestId);
    if (body instanceof Response) return body;

    const draftProfile = provider.getCompanionDraftProfile();
    const profile: CompanionDraftProfile = {
      ...draftProfile,
      visibilitySettings: {
        ...draftProfile.visibilitySettings,
        ...sanitizeVisibility(body),
      },
      updatedAt: new Date().toISOString(),
    };

    return ok({
      profile,
      onboarding: createOnboardingState(profile, provider.getCompanionOptions()),
    });
  }

  if (request.method === "PATCH" && pathname === "/api/companion/availability") {
    const body = await readJsonBody<CompanionAvailabilityUpdateRequest>(request, requestId);
    if (body instanceof Response) return body;

    const fieldErrors = validateAvailabilityWindows(body.availabilityWindows);
    if (Object.keys(fieldErrors).length > 0) {
      return fail(422, "COMPANION_AVAILABILITY_VALIDATION_FAILED", "Review availability windows and try again.", fieldErrors);
    }

    const profile: CompanionDraftProfile = {
      ...provider.getCompanionDraftProfile(),
      availabilityWindows: body.availabilityWindows,
      updatedAt: new Date().toISOString(),
    };

    return ok({
      profile,
      onboarding: createOnboardingState(profile, provider.getCompanionOptions()),
    });
  }

  if (request.method === "POST" && pathname === "/api/companion/submit-verification") {
    const body = await readJsonBody<CompanionVerificationSubmitRequest>(request, requestId);
    if (body instanceof Response) return body;

    const fieldErrors = validateVerificationSubmit(body);
    if (Object.keys(fieldErrors).length > 0) {
      return fail(422, "COMPANION_VERIFICATION_VALIDATION_FAILED", "Review the verification acknowledgements and try again.", fieldErrors);
    }

    const draftProfile = provider.getCompanionDraftProfile();
    const profile: CompanionDraftProfile = {
      ...draftProfile,
      visibilitySettings: {
        ...draftProfile.visibilitySettings,
        publicProfile: false,
        acceptInquiries: false,
      },
      reviewStatus: "pending_verification",
      reviewNote: "Verification has been submitted. Public visibility and inquiries remain paused until review clears.",
      updatedAt: new Date().toISOString(),
    };

    return ok(
      {
        profile,
        submittedAt: profile.updatedAt,
        nextStep: "Tirak review checks identity, public tone, visibility, availability, and safety before any traveller-facing profile appears.",
      },
      { status: 202 },
    );
  }

  if (request.method === "GET" && pathname === "/api/payments/providers") {
    return ok(paymentProviders);
  }

  const paymentMatch = pathname.match(/^\/api\/traveller\/inquiries\/([^/]+)\/payment-session$/);
  if (request.method === "POST" && paymentMatch) {
    return blockedPaymentResponse(fail);
  }

  const stripePaymentMatch = pathname.match(/^\/api\/traveller\/inquiries\/([^/]+)\/stripe-checkout-session$/);
  if (request.method === "POST" && stripePaymentMatch) {
    return blockedPaymentResponse(fail);
  }

  const paymentDetailMatch = pathname.match(/^\/api\/traveller\/payments\/([^/]+)$/);
  if (request.method === "GET" && paymentDetailMatch) {
    return ok({
      id: paymentDetailMatch[1],
      provider: "stripe",
      status: "disabled_for_compliance",
      complianceState: "compliance_hold",
      amount: null,
      currency: "THB",
      nextStep: "Payment detail is API-shaped, but live payment state remains blocked until provider approval.",
    });
  }

  if (request.method === "GET" && pathname === "/api/safety/content") {
    return ok(provider.getSafetyContent());
  }

  if (request.method === "POST" && pathname === "/api/safety/reports") {
    const session = getSessionFromRequest(request);
    if (!session) {
      return fail(401, "SESSION_REQUIRED", "Sign in before submitting a safety report.");
    }

    const body = await readJsonBody<SafetyReportRequest>(request, requestId);
    if (body instanceof Response) return body;

    const fieldErrors = validateSafetyReport(body);
    if (Object.keys(fieldErrors).length > 0) {
      return fail(422, "SAFETY_REPORT_VALIDATION_FAILED", "Review the safety report fields and try again.", fieldErrors);
    }

    return ok(provider.createSafetyReport(body), { status: 201 });
  }

  if (request.method === "GET" && pathname === "/api/account") {
    const session = getSessionFromRequest(request);
    if (!session) {
      return fail(401, "SESSION_REQUIRED", "Sign in before viewing account settings.");
    }
    return ok(provider.getAccount(session));
  }

  if (request.method === "PATCH" && pathname === "/api/account/privacy") {
    const session = getSessionFromRequest(request);
    if (!session) {
      return fail(401, "SESSION_REQUIRED", "Sign in before updating account privacy.");
    }

    const body = await readJsonBody<AccountPrivacyUpdateRequest>(request, requestId);
    if (body instanceof Response) return body;

    return ok({
      account: provider.updateAccountPrivacy(session, body),
    });
  }

  return fail(404, "API_ROUTE_NOT_FOUND", "No API route exists for this request.");
}

const companionSafetyGuidance = [
  "Public profile fields stay separate from private review fields.",
  "Availability is planning context, not instant booking or public urgency.",
  "Visibility can pause discovery, city, availability, and inquiries independently.",
  "No payment, off-platform contact, or routing step happens before review clears.",
];

function parseDiscoveryFilters(searchParams: URLSearchParams): DiscoveryFilterSelection {
  const city = searchParams.get("city");
  const experience = searchParams.get("experience");
  const availability = searchParams.get("availability");
  const verified = searchParams.get("verified");

  return {
    city: isCitySlug(city) ? city : "all",
    experience: isExperienceSlug(experience) ? experience : "all",
    availability: availability === "available" || availability === "planning_only" ? availability : "any",
    verified: verified === "all" ? "all" : "approved",
  };
}

async function readJsonBody<T>(request: Request, requestId: string): Promise<T | Response> {
  try {
    const value = await request.json();
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return apiError(400, "INVALID_BODY", "Request body must be a JSON object.", undefined, { requestId });
    }
    return value as T;
  } catch {
    return apiError(400, "INVALID_JSON", "Request body must be valid JSON.", undefined, { requestId });
  }
}

function validateInquiry(body: TravellerInquiryRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  if (typeof body.companionId !== "string" || body.companionId.trim().length === 0) {
    errors.companionId = "Choose a reviewed companion profile.";
  }
  if (!isCitySlug(body.city)) {
    errors.city = "Choose a supported Tirak city.";
  }
  if (!isExperienceSlug(body.experience)) {
    errors.experience = "Choose a supported experience context.";
  }
  if (typeof body.preferredWindow !== "string" || body.preferredWindow.trim().length < 4) {
    errors.preferredWindow = "Add a practical preferred window.";
  }
  if (typeof body.message !== "string" || body.message.trim().length < 24) {
    errors.message = "Add a respectful inquiry message with at least 24 characters.";
  }
  if (body.privacyAcknowledged !== true) {
    errors.privacyAcknowledged = "Acknowledge privacy and review before submitting.";
  }
  return errors;
}

function requireCustomerRole(
  request: Request,
  role: "traveller" | "companion",
  fail: (
    status: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string>,
    init?: ResponseInit,
  ) => Response,
): Response | null {
  const session = getSessionFromRequest(request);
  if (!session) {
    return fail(401, "SESSION_REQUIRED", "Sign in before using this API route.");
  }
  if (session.profile.role !== role) {
    return fail(403, "ROLE_NOT_ALLOWED", `Switch to ${role} context before using this API route.`);
  }
  return null;
}

function blockedPaymentResponse(
  fail: (
    status: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string>,
    init?: ResponseInit,
  ) => Response,
): Response {
  const result = createPaymentSession("stripe");
  if (result.status === "blocked") {
    return fail(409, result.code, result.message);
  }
  return fail(409, "PAYMENT_PROVIDER_NOT_APPROVED", "Live payment creation is disabled.");
}

function validateCompanionProfileUpdate(body: CompanionProfileUpdateRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  if (body.displayName !== undefined && body.displayName.trim().length < 2) {
    errors.displayName = "Use a display name with at least two characters.";
  }
  if (body.legalName !== undefined && body.legalName.trim().length < 2) {
    errors.legalName = "Add the private legal name for review.";
  }
  if (body.city !== undefined && !isCitySlug(body.city)) {
    errors.city = "Choose a supported Tirak city.";
  }
  if (body.experienceTags !== undefined) {
    if (!Array.isArray(body.experienceTags) || body.experienceTags.length === 0) {
      errors.experienceTags = "Choose at least one experience context.";
    } else if (body.experienceTags.some((value) => !isExperienceSlug(value))) {
      errors.experienceTags = "Choose only supported experience contexts.";
    }
  }
  if (body.bio !== undefined && body.bio.trim().length < 40) {
    errors.bio = "Add a public bio with at least 40 respectful characters.";
  }
  if (body.profileTone !== undefined && body.profileTone.trim().length < 16) {
    errors.profileTone = "Describe profile tone with practical, non-objectifying context.";
  }
  if (body.privateReviewNote !== undefined && body.privateReviewNote.trim().length < 20) {
    errors.privateReviewNote = "Add private review context for safety and fit.";
  }
  if (body.verificationReferences !== undefined) {
    if (!Array.isArray(body.verificationReferences) || body.verificationReferences.some((item) => typeof item !== "string")) {
      errors.verificationReferences = "Verification references must be text entries.";
    }
  }
  return errors;
}

function validateAvailabilityWindows(windows: unknown): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!Array.isArray(windows) || windows.length === 0) {
    errors.availabilityWindows = "Add at least one availability window.";
    return errors;
  }

  windows.forEach((window, index) => {
    const prefix = `availabilityWindows.${index}`;
    if (!isAvailabilityWindow(window)) {
      errors[prefix] = "Each window must include city, label, status, and note.";
      return;
    }
    if (window.label.trim().length < 4) {
      errors[`${prefix}.label`] = "Add a practical window label.";
    }
    if (window.note.trim().length < 12) {
      errors[`${prefix}.note`] = "Add a privacy-aware planning note.";
    }
  });

  return errors;
}

function validateVerificationSubmit(body: CompanionVerificationSubmitRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  if (body.identityAcknowledged !== true) {
    errors.identityAcknowledged = "Confirm identity review before submitting.";
  }
  if (body.visibilityAcknowledged !== true) {
    errors.visibilityAcknowledged = "Confirm the profile remains hidden until approval.";
  }
  if (body.safetyAcknowledged !== true) {
    errors.safetyAcknowledged = "Confirm safety and respectful-use requirements.";
  }
  return errors;
}

function validateSafetyReport(body: SafetyReportRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  if (
    body.targetType !== "profile" &&
    body.targetType !== "inquiry" &&
    body.targetType !== "payment" &&
    body.targetType !== "account" &&
    body.targetType !== "other"
  ) {
    errors.targetType = "Choose a supported report target.";
  }
  if (
    body.reasonCategory !== "privacy" &&
    body.reasonCategory !== "unsafe_request" &&
    body.reasonCategory !== "payment_pressure" &&
    body.reasonCategory !== "profile_accuracy" &&
    body.reasonCategory !== "other"
  ) {
    errors.reasonCategory = "Choose a supported report reason.";
  }
  if (body.targetId !== undefined && typeof body.targetId !== "string") {
    errors.targetId = "Target id must be text when provided.";
  }
  if (typeof body.summary !== "string" || body.summary.trim().length < 24) {
    errors.summary = "Add a practical safety summary with at least 24 characters.";
  }
  if (typeof body.contactAllowed !== "boolean") {
    errors.contactAllowed = "Choose whether safe follow-up contact is allowed.";
  }
  return errors;
}

function mergeCompanionProfile(profile: CompanionDraftProfile, body: CompanionProfileUpdateRequest): CompanionDraftProfile {
  return {
    ...profile,
    ...body,
    displayName: body.displayName?.trim() ?? profile.displayName,
    legalName: body.legalName?.trim() ?? profile.legalName,
    bio: body.bio?.trim() ?? profile.bio,
    profileTone: body.profileTone?.trim() ?? profile.profileTone,
    privateReviewNote: body.privateReviewNote?.trim() ?? profile.privateReviewNote,
    experienceTags: body.experienceTags ? uniqueExperienceTags(body.experienceTags) : profile.experienceTags,
    verificationReferences: body.verificationReferences
      ? body.verificationReferences.map((item) => item.trim()).filter(Boolean)
      : profile.verificationReferences,
    updatedAt: new Date().toISOString(),
  };
}

function createOnboardingState(profile: CompanionDraftProfile, companionOptions: CompanionOptionSet): CompanionOnboardingState {
  const stepSeed = [
    {
      id: "welcome",
      label: "Welcome",
      description: "Understand review, visibility, and companion agency before profile work starts.",
      complete: true,
    },
    {
      id: "basics",
      label: "Basics",
      description: "Private legal name and public display name stay separated.",
      complete: profile.displayName.trim().length >= 2 && profile.legalName.trim().length >= 2,
    },
    {
      id: "bio",
      label: "Profile tone",
      description: "Public copy must stay premium, practical, and non-objectifying.",
      complete: profile.bio.trim().length >= 40 && profile.profileTone.trim().length >= 16,
    },
    {
      id: "city_experience",
      label: "City and experiences",
      description: "Choose the city and planning contexts that match reviewed availability.",
      complete: isCitySlug(profile.city) && profile.experienceTags.length > 0,
    },
    {
      id: "visibility",
      label: "Visibility",
      description: "Control discovery, city, availability, and inquiry exposure.",
      complete: Object.values(profile.visibilitySettings).some(Boolean),
    },
    {
      id: "verification",
      label: "Verification",
      description: "Submit private context for review before public visibility.",
      complete: profile.verificationReferences.length > 0 && profile.privateReviewNote.trim().length >= 20,
    },
    {
      id: "submitted",
      label: "Submitted",
      description: "Pending review state blocks public visibility and inquiries.",
      complete: profile.reviewStatus !== "draft" && profile.reviewStatus !== "changes_requested",
    },
  ] as const;

  const completed = stepSeed.filter((step) => step.complete).length;
  const firstIncomplete = stepSeed.findIndex((step) => !step.complete);
  const steps: CompanionOnboardingStep[] = stepSeed.map((step, index) => {
    const status: CompanionOnboardingStep["status"] = step.complete
      ? "complete"
      : index === firstIncomplete
        ? "active"
        : "pending";
    return {
      id: step.id,
      label: step.label,
      description: step.description,
      status,
    };
  });

  return {
    profile,
    steps,
    options: companionOptions,
    progress: {
      completed,
      total: stepSeed.length,
      label: `${completed} of ${stepSeed.length} onboarding checks complete`,
    },
    guidance: companionSafetyGuidance,
    requiredActions: steps.filter((step) => step.status !== "complete").map((step) => step.label),
  };
}

function sanitizeVisibility(body: CompanionVisibilityUpdateRequest): CompanionVisibilityUpdateRequest {
  return {
    ...(typeof body.publicProfile === "boolean" ? { publicProfile: body.publicProfile } : {}),
    ...(typeof body.showCity === "boolean" ? { showCity: body.showCity } : {}),
    ...(typeof body.showAvailability === "boolean" ? { showAvailability: body.showAvailability } : {}),
    ...(typeof body.acceptInquiries === "boolean" ? { acceptInquiries: body.acceptInquiries } : {}),
  };
}

function uniqueExperienceTags(values: ExperienceSlug[]): ExperienceSlug[] {
  return [...new Set(values.filter(isExperienceSlug))];
}

function createInquiryDetail(body: TravellerInquiryRequest, companionDisplayName: string): TravellerInquiryDetail {
  const now = new Date().toISOString();
  return {
    id: `inq_${crypto.randomUUID()}`,
    companionId: body.companionId,
    companionDisplayName,
    city: body.city,
    experience: body.experience,
    status: "under_review",
    createdAt: now,
    updatedAt: now,
    nextStep: "A private review state is created before routing or payment.",
    message: body.message.trim(),
    timeline: [
      {
        label: "Inquiry submitted",
        status: "complete",
        note: "Traveller context and message were received.",
      },
      {
        label: "Private review",
        status: "active",
        note: "Tirak checks safety, fit, and allowed next steps.",
      },
      {
        label: "Routing decision",
        status: "pending",
        note: "No introduction or payment happens before review clears.",
      },
    ],
    paymentState: {
      status: "disabled_for_compliance",
      provider: "stripe",
      note: "Payment remains blocked until provider supportability is approved.",
    },
    privacyNote: "Inquiry details stay private and are not published to profile or discovery surfaces.",
  };
}

function toInquirySummary(inquiry: TravellerInquiryDetail) {
  const { message: _message, timeline: _timeline, paymentState: _paymentState, privacyNote: _privacyNote, ...summary } = inquiry;
  return summary;
}

function isCitySlug(value: unknown): value is CitySlug {
  return isProviderCity(value);
}

function isExperienceSlug(value: unknown): value is ExperienceSlug {
  return isProviderExperience(value);
}

function isAvailabilityWindow(value: unknown): value is AvailabilityWindow {
  return isProviderAvailabilityWindow(value);
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return routeApi(request);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
