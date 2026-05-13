import { json, apiError } from "./http";
import {
  cities,
  companionDraftProfile,
  companionInquiries,
  companionOptions,
  companionProfiles,
  companionReviewStates,
  companions,
  discoveryFilterOptions,
  entryPaths,
  experiences,
  safetyContent,
  travellerInquiries,
} from "./staged-data";
import { routeAuth } from "./auth";
import { createPaymentSession, paymentProviders } from "./payment-provider";
import type {
  AvailabilityWindow,
  CitySlug,
  CompanionAvailabilityUpdateRequest,
  CompanionDraftProfile,
  CompanionOnboardingStep,
  CompanionOnboardingState,
  CompanionProfileUpdateRequest,
  CompanionVerificationSubmitRequest,
  CompanionVisibilityUpdateRequest,
  DiscoveryFilterSelection,
  ExperienceSlug,
  TravellerInquiryDetail,
  TravellerInquiryRequest,
} from "../shared/contracts";

async function routeApi(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const { pathname, searchParams } = url;

  const authResponse = await routeAuth(request, pathname);
  if (authResponse) return authResponse;

  if (request.method === "GET" && pathname === "/api/public/home") {
    return json({
      brand: {
        name: "Tirak Plus",
        promise: "Private Thailand companion concierge for reviewed adult travellers.",
      },
      cities,
      highlights: ["Verified visibility", "Private inquiries", "Provider approval before payments"],
      entryPaths,
    });
  }

  if (request.method === "GET" && pathname === "/api/public/experiences") {
    const city = searchParams.get("city");
    const category = searchParams.get("category");
    return json(
      experiences.filter((item) => {
        const cityMatches = city ? item.city === city : true;
        const categoryMatches = category ? item.slug === category : true;
        return cityMatches && categoryMatches;
      }),
    );
  }

  if (request.method === "GET" && pathname === "/api/traveller/discovery") {
    const filters = parseDiscoveryFilters(searchParams);
    const data = companions.filter((item) => {
      const cityMatches = filters.city === "all" ? true : item.city === filters.city;
      const experienceMatches = filters.experience === "all" ? true : item.experienceTags.includes(filters.experience);
      const availabilityMatches = filters.availability === "any" ? true : item.availabilityStatus === filters.availability;
      const verifiedMatches = filters.verified === "all" ? true : item.verificationState === "approved";
      return cityMatches && experienceMatches && availabilityMatches && verifiedMatches;
    });

    return json({
      filters,
      filterOptions: discoveryFilterOptions,
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
    const profile = companionProfiles.find((item) => item.id === availabilityMatch[1]);
    if (!profile) return apiError(404, "PROFILE_NOT_FOUND", "This profile is unavailable.");
    if (profile.visibilityState !== "public") {
      return apiError(423, "PROFILE_UNAVAILABLE", "Availability is hidden while this profile is under review.");
    }
    return json({
      companionId: profile.id,
      windows: profile.availabilityWindows,
      note: "Availability is planning context and must pass review before routing.",
    });
  }

  const companionMatch = pathname.match(/^\/api\/traveller\/companions\/([^/]+)$/);
  if (request.method === "GET" && companionMatch) {
    const profile = companionProfiles.find((item) => item.id === companionMatch[1]);
    if (!profile) return apiError(404, "PROFILE_NOT_FOUND", "This profile is unavailable.");
    if (profile.visibilityState !== "public") {
      return apiError(423, "PROFILE_UNAVAILABLE", "This profile is still under review and cannot receive inquiries.");
    }
    return json(profile);
  }

  if (request.method === "POST" && pathname === "/api/traveller/inquiries") {
    const body = await readJsonBody<TravellerInquiryRequest>(request);
    if (body instanceof Response) return body;

    const fieldErrors = validateInquiry(body);
    if (Object.keys(fieldErrors).length > 0) {
      return apiError(422, "INQUIRY_VALIDATION_FAILED", "Review the inquiry fields and try again.", fieldErrors);
    }

    const profile = companionProfiles.find((item) => item.id === body.companionId);
    if (!profile || profile.visibilityState !== "public") {
      return apiError(404, "PROFILE_NOT_FOUND", "This profile is unavailable for inquiry.");
    }

    return json(
      {
        inquiry: createInquiryDetail(body, profile.displayName),
      },
      { status: 201 },
    );
  }

  if (request.method === "GET" && pathname === "/api/traveller/inquiries") {
    return json({
      results: travellerInquiries.map(toInquirySummary),
      emptyState: {
        title: "No private inquiries yet.",
        description: "Start from a reviewed profile and submit a respectful inquiry for human review.",
      },
    });
  }

  const inquiryMatch = pathname.match(/^\/api\/traveller\/inquiries\/([^/]+)$/);
  if (request.method === "GET" && inquiryMatch) {
    const inquiry = travellerInquiries.find((item) => item.id === inquiryMatch[1]);
    if (!inquiry) return apiError(404, "INQUIRY_NOT_FOUND", "This inquiry is unavailable.");
    return json(inquiry);
  }

  if (request.method === "GET" && pathname === "/api/companion/onboarding") {
    return json(createOnboardingState(companionDraftProfile));
  }

  if (request.method === "GET" && pathname === "/api/companion/dashboard") {
    const onboarding = createOnboardingState(companionDraftProfile);
    return json({
      profile: companionDraftProfile,
      progress: onboarding.progress,
      reviewStates: companionReviewStates,
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
    return json({
      results: companionInquiries,
      emptyState: {
        title: "No routed inquiries yet.",
        description: "Tirak only routes inquiries after review; no fake demand or online-now pressure is shown.",
      },
    });
  }

  if (request.method === "PATCH" && pathname === "/api/companion/profile") {
    const body = await readJsonBody<CompanionProfileUpdateRequest>(request);
    if (body instanceof Response) return body;

    const fieldErrors = validateCompanionProfileUpdate(body);
    if (Object.keys(fieldErrors).length > 0) {
      return apiError(422, "COMPANION_PROFILE_VALIDATION_FAILED", "Review the profile fields and try again.", fieldErrors);
    }

    const profile = mergeCompanionProfile(companionDraftProfile, body);
    return json({
      profile,
      onboarding: createOnboardingState(profile),
    });
  }

  if (request.method === "PATCH" && pathname === "/api/companion/visibility") {
    const body = await readJsonBody<CompanionVisibilityUpdateRequest>(request);
    if (body instanceof Response) return body;

    const profile: CompanionDraftProfile = {
      ...companionDraftProfile,
      visibilitySettings: {
        ...companionDraftProfile.visibilitySettings,
        ...sanitizeVisibility(body),
      },
      updatedAt: new Date().toISOString(),
    };

    return json({
      profile,
      onboarding: createOnboardingState(profile),
    });
  }

  if (request.method === "PATCH" && pathname === "/api/companion/availability") {
    const body = await readJsonBody<CompanionAvailabilityUpdateRequest>(request);
    if (body instanceof Response) return body;

    const fieldErrors = validateAvailabilityWindows(body.availabilityWindows);
    if (Object.keys(fieldErrors).length > 0) {
      return apiError(422, "COMPANION_AVAILABILITY_VALIDATION_FAILED", "Review availability windows and try again.", fieldErrors);
    }

    const profile: CompanionDraftProfile = {
      ...companionDraftProfile,
      availabilityWindows: body.availabilityWindows,
      updatedAt: new Date().toISOString(),
    };

    return json({
      profile,
      onboarding: createOnboardingState(profile),
    });
  }

  if (request.method === "POST" && pathname === "/api/companion/submit-verification") {
    const body = await readJsonBody<CompanionVerificationSubmitRequest>(request);
    if (body instanceof Response) return body;

    const fieldErrors = validateVerificationSubmit(body);
    if (Object.keys(fieldErrors).length > 0) {
      return apiError(422, "COMPANION_VERIFICATION_VALIDATION_FAILED", "Review the verification acknowledgements and try again.", fieldErrors);
    }

    const profile: CompanionDraftProfile = {
      ...companionDraftProfile,
      visibilitySettings: {
        ...companionDraftProfile.visibilitySettings,
        publicProfile: false,
        acceptInquiries: false,
      },
      reviewStatus: "pending_verification",
      reviewNote: "Verification has been submitted. Public visibility and inquiries remain paused until review clears.",
      updatedAt: new Date().toISOString(),
    };

    return json(
      {
        profile,
        submittedAt: profile.updatedAt,
        nextStep: "Tirak review checks identity, public tone, visibility, availability, and safety before any traveller-facing profile appears.",
      },
      { status: 202 },
    );
  }

  if (request.method === "GET" && pathname === "/api/payments/providers") {
    return json(paymentProviders);
  }

  const paymentMatch = pathname.match(/^\/api\/traveller\/inquiries\/([^/]+)\/payment-session$/);
  if (request.method === "POST" && paymentMatch) {
    return json(createPaymentSession("stripe"), { status: 409 });
  }

  if (request.method === "GET" && pathname === "/api/safety/content") {
    return json(safetyContent);
  }

  return apiError(404, "API_ROUTE_NOT_FOUND", "No API route exists for this request.");
}

const citySlugs: CitySlug[] = ["bangkok", "phuket", "koh-samui", "koh-phangan"];
const experienceSlugs: ExperienceSlug[] = ["nightlife", "island-explorer", "muay-thai-night", "private-dining", "local-guidance"];
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

async function readJsonBody<T>(request: Request): Promise<T | Response> {
  try {
    const value = await request.json();
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return apiError(400, "INVALID_BODY", "Request body must be a JSON object.");
    }
    return value as T;
  } catch {
    return apiError(400, "INVALID_JSON", "Request body must be valid JSON.");
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

function createOnboardingState(profile: CompanionDraftProfile): CompanionOnboardingState {
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
  return typeof value === "string" && citySlugs.includes(value as CitySlug);
}

function isExperienceSlug(value: unknown): value is ExperienceSlug {
  return typeof value === "string" && experienceSlugs.includes(value as ExperienceSlug);
}

function isAvailabilityWindow(value: unknown): value is AvailabilityWindow {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const item = value as AvailabilityWindow;
  return (
    typeof item.id === "string" &&
    isCitySlug(item.city) &&
    typeof item.label === "string" &&
    (item.status === "available" || item.status === "tentative" || item.status === "hidden") &&
    typeof item.note === "string"
  );
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
