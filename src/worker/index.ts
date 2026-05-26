// SendEmail is declared globally by worker-configuration.d.ts; no import needed.
import { json, apiError, createRequestId, STATIC_SECURITY_HEADERS } from "./http.js";
import {
  createStagedDataProvider,
  isProviderAvailabilityWindow,
  isProviderCity,
  isProviderExperience,
} from "./staged-provider.js";
import { companionMuseChart, travellerMuseChart } from "./staged-data.js";
import { routeAuth, getSessionFromRequest, verifyCsrfToken } from "./auth.js";
import { createPaymentSession, getPaymentProviders } from "./payment-provider.js";
import { checkRateLimit, type RateLimitGroup } from "./rate-limit.js";
import { getRouteRegistry } from "./route-registry.js";
import { storageBoundaryResponse } from "./storage-boundaries.js";
import { dataModelSchema } from "./data-model-schema.js";
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
  MuseAdoptRequest,
  MuseAdoptResponse,
  MuseChatMessage,
  MuseChatRequest,
  MuseChatResponse,
  MuseConversationDetailResponse,
  MuseConversationListResponse,
  MuseConversationStage,
  MuseConversationSummary,
  MuseProfileSignals,
  MuseTranscriptSnapshot,
  SafetyReportRequest,
  TravellerInquiryDetail,
  TravellerInquiryRequest,
  TravellerSessionDetail,
} from "../shared/contracts";

type PaymentProviderMode = "compliance_hold" | "stripe_test";

type WorkerEnv = Omit<Env, "PAYMENT_PROVIDER_MODE"> & {
  AUTH_OTPS?: KVNamespace;
  EMAIL?: SendEmail;
  MUSE_AGENT_API_KEY?: string;
  MUSE_AGENT_CONFIG?: KVNamespace;
  MUSE_AGENT_CONFIG_KEY?: string;
  MUSE_AGENT_MODE?: "staged" | "external";
  MUSE_CONVERSATIONS?: KVNamespace;
  MUSE_RAG?: Fetcher;
  PAYMENT_PROVIDER_MODE?: PaymentProviderMode;
  SELEMENE_ENGINE_API_KEY?: string;
  STRIPE_CHECKOUT_CURRENCY?: string;
  STRIPE_CHECKOUT_UNIT_AMOUNT?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_SECRET_KEY?: string;
};

async function routeApi(request: Request, env: WorkerEnv): Promise<Response> {
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

  const authResponse = await routeAuth(request, pathname, requestId, env);
  if (authResponse) return authResponse;

  const guardResponse = guardApiMutation(request, pathname, fail);
  if (guardResponse) return guardResponse;

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

  if (request.method === "POST" && pathname === "/api/muse/chat") {
    const rateLimitResponse = applyRateLimit(request, "muse", fail);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await readJsonBody<MuseChatRequest>(request, requestId);
    if (body instanceof Response) return body;

    const fieldErrors = validateMuseChatRequest(body);
    if (Object.keys(fieldErrors).length > 0) {
      return fail(422, "MUSE_CHAT_VALIDATION_FAILED", "Muse needs a short message to continue.", fieldErrors);
    }

    return ok(await createMuseChatResponse(body, env));
  }

  if (request.method === "POST" && pathname === "/api/muse/conversations/adopt") {
    // CSRF + session are enforced by guardApiMutation (we did NOT add this
    // path to the bypass list, so it requires session cookie + X-Tirak-CSRF).
    const session = getSessionFromRequest(request);
    if (!session) {
      return fail(401, "SESSION_REQUIRED", "Sign in before adopting a Muse transcript.");
    }

    if (!env.MUSE_CONVERSATIONS) {
      return fail(503, "MUSE_CONVERSATIONS_UNBOUND", "Conversation adoption store is unavailable.");
    }

    const body = await readJsonBody<MuseAdoptRequest>(request, requestId);
    if (body instanceof Response) return body;

    const fieldErrors = validateMuseAdoptRequest(body);
    if (Object.keys(fieldErrors).length > 0) {
      return fail(422, "MUSE_ADOPT_VALIDATION_FAILED", "Adoption payload could not be accepted.", fieldErrors);
    }

    const snapshot: MuseTranscriptSnapshot = body.snapshot;
    const userId = session.profile.id;
    const adoptedAt = new Date().toISOString();
    const stored: MuseTranscriptSnapshot & { adoptedAt: string; ownerUserId: string } = {
      ...snapshot,
      adoptedAt,
      ownerUserId: userId,
    };
    const key = `user:${userId}:conv:${snapshot.conversationId}`;

    try {
      await env.MUSE_CONVERSATIONS.put(key, JSON.stringify(stored), {
        // 90 day TTL on adopted transcripts; the dashboard will surface
        // these as recent Muse threads. Adjust when the surfacing UI lands.
        expirationTtl: 60 * 60 * 24 * 90,
      });
    } catch (caught) {
      console.warn("MUSE_CONVERSATIONS put failed", {
        userId,
        conversationId: snapshot.conversationId,
        message: caught instanceof Error ? caught.message : "unknown",
      });
      return fail(500, "MUSE_ADOPT_STORE_FAILED", "Muse could not save your thread. Try again later.");
    }

    const response: MuseAdoptResponse = {
      conversationId: snapshot.conversationId,
      adoptedAt,
      ownerUserId: userId,
      messageCount: snapshot.messages.length,
    };
    return ok(response);
  }

  if (request.method === "GET" && pathname === "/api/muse/conversations") {
    const session = getSessionFromRequest(request);
    if (!session) return fail(401, "SESSION_REQUIRED", "Sign in to see your Muse threads.");
    if (!env.MUSE_CONVERSATIONS) {
      return fail(503, "MUSE_CONVERSATIONS_UNBOUND", "Conversation store is unavailable.");
    }

    const userId = session.profile.id;
    const prefix = `user:${userId}:conv:`;
    const summaries: MuseConversationSummary[] = [];
    try {
      const list = await env.MUSE_CONVERSATIONS.list({ prefix, limit: 50 });
      for (const k of list.keys) {
        const raw = await env.MUSE_CONVERSATIONS.get(k.name);
        if (!raw) continue;
        const stored = JSON.parse(raw) as MuseTranscriptSnapshot & {
          adoptedAt: string;
          ownerUserId: string;
        };
        const lastMessage = stored.messages[stored.messages.length - 1];
        summaries.push({
          conversationId: stored.conversationId,
          stage: stored.stage,
          messageCount: stored.messages.length,
          capturedAt: stored.capturedAt,
          adoptedAt: stored.adoptedAt,
          lastMessagePreview: lastMessage ? lastMessage.content.slice(0, 140) : "",
          lastMessageRole: lastMessage ? lastMessage.role : "muse",
        });
      }
    } catch (caught) {
      console.warn("MUSE_CONVERSATIONS list failed", {
        userId,
        message: caught instanceof Error ? caught.message : "unknown",
      });
      return fail(500, "MUSE_CONVERSATIONS_LIST_FAILED", "Muse could not load your threads.");
    }

    // Newest first
    summaries.sort((a, b) => (a.adoptedAt < b.adoptedAt ? 1 : -1));
    const response: MuseConversationListResponse = { conversations: summaries };
    return ok(response);
  }

  if (request.method === "GET" && pathname.startsWith("/api/muse/conversations/")) {
    const conversationId = pathname.slice("/api/muse/conversations/".length);
    if (!/^[a-zA-Z0-9_-]{8,80}$/.test(conversationId)) {
      return fail(404, "MUSE_CONVERSATION_NOT_FOUND", "That Muse thread could not be found.");
    }
    const session = getSessionFromRequest(request);
    if (!session) return fail(401, "SESSION_REQUIRED", "Sign in to read this thread.");
    if (!env.MUSE_CONVERSATIONS) {
      return fail(503, "MUSE_CONVERSATIONS_UNBOUND", "Conversation store is unavailable.");
    }

    const userId = session.profile.id;
    const key = `user:${userId}:conv:${conversationId}`;
    const raw = await env.MUSE_CONVERSATIONS.get(key);
    if (!raw) {
      return fail(404, "MUSE_CONVERSATION_NOT_FOUND", "That Muse thread could not be found.");
    }
    const stored = JSON.parse(raw) as MuseTranscriptSnapshot & {
      adoptedAt: string;
      ownerUserId: string;
    };
    const response: MuseConversationDetailResponse = { conversation: stored };
    return ok(response);
  }

  if (pathname.startsWith("/api/traveller/")) {
    const roleError = requireCustomerRole(request, "traveller", fail);
    if (roleError) return roleError;
  }

  if (pathname.startsWith("/api/companion/")) {
    const roleError = requireCustomerRole(request, "companion", fail);
    if (roleError) return roleError;
  }

  if (request.method === "GET" && pathname === "/api/traveller/dashboard") {
    return ok(provider.getTravellerDashboard());
  }

  if (request.method === "GET" && pathname === "/api/traveller/sessions") {
    return ok({
      results: provider.listTravellerSessions().map(toSessionSummary),
      emptyState: {
        title: "No reviewed sessions yet.",
        description: "Start with Muse or send a private inquiry from a reviewed profile.",
      },
    });
  }

  const travellerSessionMatch = pathname.match(/^\/api\/traveller\/sessions\/([^/]+)$/);
  if (request.method === "GET" && travellerSessionMatch) {
    const session = provider.getTravellerSession(travellerSessionMatch[1]);
    if (!session) return fail(404, "SESSION_NOT_FOUND", "This session is unavailable.");
    return ok(session);
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
      chart: travellerMuseChart,
      emptyState: {
        title: "No reviewed profiles match these filters.",
        description: "Adjust the city, experience, or timing to see more profiles.",
      },
      guidance: [
        "Choose a city first when your plan is location-specific.",
        "Use timing to narrow profiles for this week.",
        "Open a profile when the tone feels right.",
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
      note: "Availability helps planning and appears to travellers after review.",
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
      chart: companionMuseChart,
      reviewStates: provider.listCompanionReviewStates(),
      panels: [
        {
          title: "Profile draft",
          description: "Edit public tone, private notes, and traveller-facing details before submission.",
          href: "/companion/profile",
        },
        {
          title: "Availability",
          description: "Keep city windows controlled; hidden windows do not appear in discovery.",
          href: "/companion/plans",
        },
        {
          title: "Private inquiries",
          description: "Review incoming requests only after Tirak completes safety checks.",
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
        title: "No reviewed inquiries yet.",
        description: "Tirak sends inquiries after review, without fake demand or online-now pressure.",
      },
    });
  }

  const companionSessionMatch = pathname.match(/^\/api\/companion\/inquiries\/([^/]+)$/);
  if (request.method === "GET" && companionSessionMatch) {
    const session = provider.getCompanionSession(companionSessionMatch[1]);
    if (!session) return fail(404, "COMPANION_INQUIRY_NOT_FOUND", "This routed inquiry is unavailable.");
    return ok(session);
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
      reviewNote: "Verification has been submitted. Your profile and inquiries stay paused until Tirak clears them.",
      updatedAt: new Date().toISOString(),
    };

    return ok(
      {
        profile,
        submittedAt: profile.updatedAt,
        nextStep: "Tirak checks identity, public tone, privacy, availability, and safety before any traveller-facing profile appears.",
      },
      { status: 202 },
    );
  }

  if (request.method === "GET" && pathname === "/api/payments/providers") {
    return ok(getPaymentProviders(getPaymentProviderMode(env)));
  }

  const paymentMatch = pathname.match(/^\/api\/traveller\/inquiries\/([^/]+)\/payment-session$/);
  if (request.method === "POST" && paymentMatch) {
    return createTravellerPaymentSession(request, env, paymentMatch[1], ok, fail, { errorOnBlocked: false });
  }

  const stripePaymentMatch = pathname.match(/^\/api\/traveller\/inquiries\/([^/]+)\/stripe-checkout-session$/);
  if (request.method === "POST" && stripePaymentMatch) {
    return createTravellerPaymentSession(request, env, stripePaymentMatch[1], ok, fail, { errorOnBlocked: true });
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
      nextStep: "Payment is not available for this plan yet.",
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

function guardApiMutation(
  request: Request,
  pathname: string,
  fail: (
    status: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string>,
    init?: ResponseInit,
  ) => Response,
): Response | null {
  if (request.method !== "POST" && request.method !== "PATCH") return null;
  if (pathname === "/api/muse/chat") return null;

  const rateLimitResponse = applyRateLimit(request, rateLimitGroupForPath(pathname), fail);
  if (rateLimitResponse) return rateLimitResponse;

  const csrfResult = verifyCsrfToken(request);
  if (csrfResult === "ok") return null;
  return fail(
    csrfResult === "missing_session" ? 401 : 403,
    csrfResult === "missing_session" ? "SESSION_REQUIRED" : "CSRF_TOKEN_REQUIRED",
    csrfResult === "missing_session"
      ? "Sign in before changing account data."
      : "Refresh the page and try again.",
  );
}

function applyRateLimit(
  request: Request,
  group: RateLimitGroup,
  fail: (
    status: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string>,
    init?: ResponseInit,
  ) => Response,
): Response | null {
  const result = checkRateLimit(request, group);
  if (result.allowed) return null;
  return fail(
    429,
    "RATE_LIMITED",
    "Too many requests. Wait a moment before trying again.",
    undefined,
    { headers: { "Retry-After": String(result.retryAfterSeconds), "X-RateLimit-Limit": String(result.limit) } },
  );
}

function rateLimitGroupForPath(pathname: string): RateLimitGroup {
  if (pathname === "/api/safety/reports") return "report";
  return "mutation";
}

const companionSafetyGuidance = [
  "Public profile fields stay separate from private review notes.",
  "Availability sets timing without pressure.",
  "You can pause profile, city, availability, and inquiries separately.",
  "No payment, off-platform contact, or introduction happens before Tirak clears the plan.",
];

const museSystemContract = {
  name: "Muse",
  product: "Tirak Plus",
  tone: "witty, discreet, premium, emotionally intelligent, and practical",
  userFacingLanguage:
    "Use timing, temperament, rhythm, boundaries, privacy, city mood, and attraction patterns. Do not mention zodiac, astrology, vimshottari, charts, houses, or matching-engine internals.",
  safety:
    "No explicit sexual copy, no red-light framing, no fake urgency, no off-platform payment/contact pressure, and no objectifying companion language.",
};

function validateMuseChatRequest(body: MuseChatRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  if (typeof body.message !== "string" || body.message.trim().length === 0) {
    errors.message = "Send a message for Muse.";
  }
  if (typeof body.message === "string" && body.message.length > 1200) {
    errors.message = "Keep the message under 1,200 characters.";
  }
  if (body.stage !== undefined && !isMuseConversationStage(body.stage)) {
    errors.stage = "Use a supported Muse conversation stage.";
  }
  return errors;
}

function validateMuseAdoptRequest(body: MuseAdoptRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  const snapshot = body?.snapshot;
  if (!snapshot || typeof snapshot !== "object") {
    errors.snapshot = "Adoption requires a transcript snapshot.";
    return errors;
  }
  if (typeof snapshot.conversationId !== "string" || !/^[a-zA-Z0-9_-]{8,80}$/.test(snapshot.conversationId)) {
    errors.conversationId = "Adoption requires a valid conversation identifier.";
  }
  if (!isMuseConversationStage(snapshot.stage)) {
    errors.stage = "Adoption requires a supported Muse stage.";
  }
  if (!Array.isArray(snapshot.messages)) {
    errors.messages = "Adoption requires a message array.";
  } else if (snapshot.messages.length === 0) {
    errors.messages = "Adoption requires at least one message.";
  } else if (snapshot.messages.length > 200) {
    errors.messages = "Adoption is limited to 200 messages per thread.";
  } else if (
    !snapshot.messages.every(
      (msg: MuseChatMessage) =>
        msg &&
        typeof msg.id === "string" &&
        (msg.role === "user" || msg.role === "muse") &&
        typeof msg.content === "string" &&
        msg.content.length <= 4000 &&
        typeof msg.createdAt === "string",
    )
  ) {
    errors.messages = "Each adopted message must include id, role, content, and createdAt.";
  }
  if (typeof snapshot.capturedAt !== "string" || Number.isNaN(Date.parse(snapshot.capturedAt))) {
    errors.capturedAt = "capturedAt must be a valid ISO timestamp.";
  }
  return errors;
}

async function createMuseChatResponse(body: MuseChatRequest, env: WorkerEnv): Promise<MuseChatResponse> {
  const external = await callExternalMuseAgent(body, env);
  if (external) return external;
  return createStagedMuseChatResponse(body);
}

async function callExternalMuseAgent(body: MuseChatRequest, env: WorkerEnv): Promise<MuseChatResponse | null> {
  const apiKey = env.MUSE_AGENT_API_KEY?.trim();
  const selemeneApiKey = env.SELEMENE_ENGINE_API_KEY?.trim();
  if (!env.MUSE_RAG || !apiKey || env.MUSE_AGENT_MODE !== "external") {
    console.warn("Muse external agent skipped", {
      mode: env.MUSE_AGENT_MODE ?? "unset",
      hasServiceBinding: Boolean(env.MUSE_RAG),
      hasApiKey: Boolean(apiKey),
    });
    return null;
  }

  try {
    const configKey = env.MUSE_AGENT_CONFIG_KEY ?? "muse:agent-config";
    const kvConfig = env.MUSE_AGENT_CONFIG ? await env.MUSE_AGENT_CONFIG.get(configKey, "json") : null;
    const headers = new Headers({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-Key": apiKey,
    });
    if (selemeneApiKey) {
      headers.set("X-SeleMene-Engine-Key", selemeneApiKey);
    }

    const payload = JSON.stringify({
        contract: museSystemContract,
        config: kvConfig,
        input: body,
        messages: [
          {
            role: "system",
            content: `${museSystemContract.tone}. ${museSystemContract.userFacingLanguage} ${museSystemContract.safety}`,
          },
          {
            role: "user",
            content: body.message,
          },
        ],
      });
    const response = await env.MUSE_RAG.fetch(new Request("https://muse-rag.internal/v1/chat", { method: "POST", headers, body: payload }));
    if (!response.ok) {
      console.warn("Muse external agent non-OK response", { status: response.status });
      return null;
    }

    const value = await response.json();
    if (isMuseChatResponse(value)) {
      return {
        ...value,
        chart: value.chart ?? createMuseChartFromSignals(value.profileSignals),
        agentMode: "external",
      };
    }
    const externalReply = extractExternalMuseReply(value);
    if (externalReply) {
      return {
        ...createStagedMuseChatResponse(body),
        reply: {
          id: `msg_${crypto.randomUUID()}`,
          role: "muse",
          content: sanitizeMuseReply(externalReply),
          createdAt: new Date().toISOString(),
        },
        agentMode: "external",
      };
    }
    console.warn("Muse external agent schema fallback", {
      shape: typeof value === "object" && value ? Object.keys(value).slice(0, 8) : typeof value,
    });
  } catch {
    console.warn("Muse external agent fetch failed");
    return null;
  }

  return null;
}

function createStagedMuseChatResponse(body: MuseChatRequest): MuseChatResponse {
  const message = body.message.trim();
  const contextSignals = inferMuseClientContextSignals(body.clientContext);
  const seedSignals = body.profileSignals ? mergeMuseProfileSignals(contextSignals, body.profileSignals) : contextSignals;
  const signals = mergeMuseProfileSignals(seedSignals, inferMuseProfileSignals(message));
  const stage = inferNextMuseStage(body.stage ?? "arrival", signals, message);
  const conversationId = body.conversationId?.trim() || `muse_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const reply = selectStagedMuseReply(stage, signals, message, body.clientContext);

  return {
    conversationId,
    stage,
    reply: {
      id: `msg_${crypto.randomUUID()}`,
      role: "muse",
      content: reply,
      createdAt: now,
    },
    suggestedPrompts: selectMusePrompts(stage),
    profileSignals: signals,
    nextAction: selectMuseNextAction(stage, signals),
    agentMode: "staged",
    chart: createMuseChartFromSignals(signals),
  };
}

function mergeMuseProfileSignals(previous: MuseProfileSignals | undefined, next: MuseProfileSignals): MuseProfileSignals {
  if (!previous) return next;

  const birthContext =
    museBirthConfidenceRank(next.birthContext.confidence) >= museBirthConfidenceRank(previous.birthContext.confidence)
      ? { ...previous.birthContext, ...next.birthContext }
      : { ...next.birthContext, ...previous.birthContext };

  return {
    birthContext: {
      ...birthContext,
      confidence: strongestMuseBirthConfidence(previous.birthContext.confidence, next.birthContext.confidence),
    },
    travelContext: {
      city: next.travelContext.city ?? previous.travelContext.city,
      timeframe: next.travelContext.timeframe ?? previous.travelContext.timeframe,
      experienceHints: uniqueMuseValues([...previous.travelContext.experienceHints, ...next.travelContext.experienceHints]),
    },
    desireVector: uniqueMuseValues([...previous.desireVector, ...next.desireVector]),
    boundarySignals: uniqueMuseValues([...previous.boundarySignals, ...next.boundarySignals]),
    routingHints: {
      nextRoute: next.routingHints.nextRoute ?? previous.routingHints.nextRoute,
      requiresAuth: previous.routingHints.requiresAuth || next.routingHints.requiresAuth,
      suggestedRole:
        next.routingHints.suggestedRole && next.routingHints.suggestedRole !== previous.routingHints.suggestedRole
          ? next.routingHints.suggestedRole
          : previous.routingHints.suggestedRole ?? next.routingHints.suggestedRole,
    },
  };
}

function museBirthConfidenceRank(confidence: MuseProfileSignals["birthContext"]["confidence"]): number {
  if (confidence === "complete") return 2;
  if (confidence === "partial") return 1;
  return 0;
}

function strongestMuseBirthConfidence(
  previous: MuseProfileSignals["birthContext"]["confidence"],
  next: MuseProfileSignals["birthContext"]["confidence"],
): MuseProfileSignals["birthContext"]["confidence"] {
  return museBirthConfidenceRank(next) > museBirthConfidenceRank(previous) ? next : previous;
}

function uniqueMuseValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function createEmptyMuseProfileSignals(): MuseProfileSignals {
  return {
    birthContext: {
      confidence: "none",
    },
    travelContext: {
      experienceHints: [],
    },
    desireVector: [],
    boundarySignals: [],
    routingHints: {
      requiresAuth: false,
    },
  };
}

function inferMuseClientContextSignals(clientContext: MuseChatRequest["clientContext"]): MuseProfileSignals {
  const signals = createEmptyMuseProfileSignals();
  if (!clientContext) return signals;

  const city = clientContext.city ?? inferCityFromRoute(clientContext.route);
  const experience = clientContext.experience ?? inferExperienceFromRoute(clientContext.route);
  const routeKind = clientContext.routeKind ?? "muse-entry";
  const isProtectedRoute = routeKind.startsWith("traveller") || routeKind.startsWith("companion") || routeKind === "account";

  return {
    ...signals,
    travelContext: {
      city,
      experienceHints: experience ? [experience] : [],
    },
    desireVector: contextDesireSignals(routeKind),
    boundarySignals: contextBoundarySignals(routeKind),
    routingHints: {
      nextRoute: clientContext.route,
      requiresAuth: isProtectedRoute,
      suggestedRole:
        clientContext.roleIntent === "traveller" || clientContext.roleIntent === "companion"
          ? clientContext.roleIntent
          : undefined,
    },
  };
}

function inferCityFromRoute(route: string | undefined): CitySlug | undefined {
  if (!route) return undefined;
  try {
    const url = new URL(route, "https://tirakplus.local");
    const queryCity = url.searchParams.get("city");
    if (isCitySlug(queryCity)) return queryCity;
    return (["bangkok", "phuket", "koh-samui", "koh-phangan"] as CitySlug[]).find((city) =>
      url.pathname.includes(`/cities/${city}`) || url.pathname.includes(city),
    );
  } catch {
    return undefined;
  }
}

function inferExperienceFromRoute(route: string | undefined): ExperienceSlug | undefined {
  if (!route) return undefined;
  try {
    const url = new URL(route, "https://tirakplus.local");
    const queryExperience = url.searchParams.get("experience");
    if (isExperienceSlug(queryExperience)) return queryExperience;
    return (["nightlife", "island-explorer", "muay-thai-night", "private-dining", "local-guidance"] as ExperienceSlug[]).find(
      (experience) => url.pathname.includes(`/experiences/${experience}`) || url.pathname.includes(experience),
    );
  } catch {
    return undefined;
  }
}

function contextDesireSignals(routeKind: string): string[] {
  if (routeKind.includes("profile")) return ["profile fit"];
  if (routeKind.includes("inquiry") || routeKind.includes("inbox")) return ["respectful message"];
  if (routeKind.includes("discovery")) return ["private fit"];
  if (routeKind.includes("plan")) return ["timing clarity"];
  return [];
}

function contextBoundarySignals(routeKind: string): string[] {
  if (routeKind.includes("safety")) return ["safety explicit"];
  if (routeKind.includes("account")) return ["privacy controls"];
  if (routeKind.includes("companion")) return ["visibility control"];
  return [];
}

function inferMuseProfileSignals(message: string): MuseProfileSignals {
  const lower = message.toLowerCase();
  const city = (["bangkok", "phuket", "koh-samui", "koh-phangan"] as CitySlug[]).find((item) =>
    lower.includes(item.replace("-", " ")) || lower.includes(item),
  );
  const experienceHints = (["nightlife", "island-explorer", "muay-thai-night", "private-dining", "local-guidance"] as ExperienceSlug[]).filter(
    (experience) => lower.includes(experience.replaceAll("-", " ")) || lower.includes(experience),
  );
  const dateMatch = message.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/);
  const timeMatch = message.match(/\b(?:at\s*)?((?:[01]?\d|2[0-3]):[0-5]\d\s?(?:am|pm)?|(?:[1-9]|1[0-2])\s?(?:am|pm))\b/i);
  const placeMatch =
    message.match(/\b(?:born in|birth place is|from)\s+([a-zA-Z\s-]{3,40})/i) ??
    message.match(/\bborn\b.*?\bin\s+([a-zA-Z\s-]{3,40})(?:,|$)/i);
  const desireVector = [
    lower.includes("private") || lower.includes("discreet") ? "privacy-led" : "",
    lower.includes("warm") || lower.includes("kind") ? "warmth" : "",
    lower.includes("witty") || lower.includes("funny") ? "playful conversation" : "",
    lower.includes("premium") || lower.includes("classy") ? "polished atmosphere" : "",
    lower.includes("calm") || lower.includes("quiet") ? "low-noise planning" : "",
  ].filter(Boolean);
  const boundarySignals = [
    lower.includes("safe") || lower.includes("safety") ? "safety explicit" : "",
    lower.includes("no pressure") || lower.includes("slow") ? "low-pressure pace" : "",
    lower.includes("private") || lower.includes("discreet") ? "discretion required" : "",
  ].filter(Boolean);

  return {
    birthContext: {
      ...(dateMatch ? { date: dateMatch[0] } : {}),
      ...(timeMatch ? { time: timeMatch[1].trim() } : {}),
      ...(placeMatch ? { place: placeMatch[1].trim() } : {}),
      confidence: dateMatch && timeMatch && placeMatch ? "complete" : dateMatch || timeMatch || placeMatch ? "partial" : "none",
    },
    travelContext: {
      ...(city ? { city } : {}),
      timeframe: lower.includes("tonight") ? "tonight" : lower.includes("weekend") ? "weekend" : undefined,
      experienceHints,
    },
    desireVector,
    boundarySignals,
    routingHints: {
      nextRoute: stageRouteHint(city, experienceHints),
      requiresAuth: false,
      suggestedRole: lower.includes("profile") || lower.includes("bio") || lower.includes("services") ? "companion" : undefined,
    },
  };
}

function inferNextMuseStage(
  currentStage: MuseConversationStage,
  signals: MuseProfileSignals,
  message: string,
): MuseConversationStage {
  const lower = message.toLowerCase();
  if (lower.includes("profile") || lower.includes("bio") || lower.includes("services")) return "desire_mapping";
  if (signals.birthContext.confidence === "none") return "birth_context";
  if (!signals.travelContext.city && signals.travelContext.experienceHints.length === 0) return "travel_context";
  if (signals.desireVector.length === 0) return "desire_mapping";
  if (signals.boundarySignals.length === 0) return "safety_boundaries";
  return "recommendation_ready";
}

function selectStagedMuseReply(
  stage: MuseConversationStage,
  signals: MuseProfileSignals,
  message: string,
  clientContext: MuseChatRequest["clientContext"],
): string {
  const contextPrefix = museContextPrefix(clientContext);
  if (stage === "birth_context") {
    return `${contextPrefix}I can start there. Give me your birth date, birth place, and if you know it, the time. I will keep the details private and turn it into a useful read, not a lecture.`;
  }
  if (stage === "travel_context") {
    return `${contextPrefix}Good. Now tell me where Thailand enters the story: Bangkok, Phuket, Samui, Phangan, or a moving target? Add the window too. I am looking for rhythm, not a checklist.`;
  }
  if (stage === "desire_mapping") {
    return `${contextPrefix}I am picking up the shape of it. Say the quiet part plainly: do you want warmth, wit, calm privacy, sharp nightlife energy, local guidance, or someone who can make the evening feel less improvised?`;
  }
  if (stage === "safety_boundaries") {
    return `${contextPrefix}Before I show anything, give me the guardrails. What feels absolutely off-limits, what pace feels comfortable, and how visible do you want this to be?`;
  }
  if (stage === "recommendation_ready") {
    const city = signals.travelContext.city ? signals.travelContext.city.replace("-", " ") : "your first city";
    return `${contextPrefix}I have enough to sketch a discreet path for ${city}. I will keep it private, filter for tone and safety first, then show options only when the fit is clean.`;
  }
  return `${contextPrefix}Tell me what brings you here in one line. I will make the next question sharper than "${message.slice(0, 48)}" deserves.`;
}

function museContextPrefix(clientContext: MuseChatRequest["clientContext"]): string {
  if (clientContext?.source !== "floating-trigger" || !clientContext.routeLabel) return "";
  return `I have your ${clientContext.routeLabel.toLowerCase()} in view. `;
}

function selectMusePrompts(stage: MuseConversationStage): string[] {
  if (stage === "birth_context") return ["Born 14/08/1992 in London, time unknown", "I know my date and city but not the time"];
  if (stage === "travel_context") return ["Bangkok this weekend, private but warm", "Phuket for a quiet premium evening"];
  if (stage === "desire_mapping") return ["Witty, calm, discreet, no chaos", "Local guidance with polished nightlife"];
  if (stage === "safety_boundaries") return ["Keep it private and slow paced", "No off-platform pressure or public visibility"];
  return ["Show me the private path", "Help me refine the fit first"];
}

function selectMuseNextAction(stage: MuseConversationStage, signals: MuseProfileSignals): MuseChatResponse["nextAction"] {
  if (stage !== "recommendation_ready") {
    return { label: "Continue with Muse", href: "/", kind: "continue" };
  }
  if (signals.routingHints.suggestedRole === "companion") {
    return { label: "Open profile", href: "/companion/profile?muse=1", kind: "route" };
  }
  const params = new URLSearchParams({ muse: "1", source: "muse" });
  if (signals.travelContext.city) params.set("city", signals.travelContext.city);
  if (signals.travelContext.experienceHints[0]) params.set("experience", signals.travelContext.experienceHints[0]);
  return { label: "Open tuned discovery", href: `/traveller/discovery?${params.toString()}`, kind: "route" };
}

function createMuseChartFromSignals(signals: MuseProfileSignals) {
  const hasBirthContext = signals.birthContext.confidence !== "none";
  const city = signals.travelContext.city?.replace("-", " ") ?? "open city";
  const desire = signals.desireVector[0] ?? "private fit";
  const boundary = signals.boundarySignals[0] ?? "ask first";

  return {
    ...travellerMuseChart,
    summary: hasBirthContext
      ? "Muse has enough private context to shape the read without exposing the method."
      : "Muse is still waiting for date, place, and optional time before sharpening the read.",
    axes: [
      { label: "Private read", value: hasBirthContext ? signals.birthContext.confidence : "needed", tone: "lavender" as const },
      { label: "City", value: city, tone: "pearl" as const },
      { label: "Mood", value: desire, tone: "rose" as const },
      { label: "Boundary", value: boundary, tone: "green" as const },
    ],
    cues: [
      hasBirthContext ? "Translate the read into plain language" : "Collect date, place, and optional time",
      signals.travelContext.city ? "Use city rhythm" : "Ask for the first city",
      signals.boundarySignals.length > 0 ? "Respect stated limits" : "Clarify what stays off-limits",
    ],
    nextPrompt: hasBirthContext
      ? "Tell Muse the city, mood, and visibility boundary."
      : "Share birth date, birth place, and time if you know it.",
  };
}

function stageRouteHint(city: CitySlug | undefined, experienceHints: ExperienceSlug[]): string | undefined {
  if (experienceHints[0]) return `/experiences/${experienceHints[0]}`;
  if (city) return `/cities/${city}`;
  return undefined;
}

function sanitizeMuseReply(value: string): string {
  return value
    .replace(/\b(?:zodiac|astrology|vimshottari|dasha|houses?|nakshatra|birth chart)\b/gi, "pattern")
    .slice(0, 1400);
}

function extractExternalMuseReply(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value !== "object" || value === null) return null;

  const record = value as Record<string, unknown>;
  const directKeys = ["reply", "message", "content", "output_text", "text", "answer", "response"];
  for (const key of directKeys) {
    if (typeof record[key] === "string") return record[key];
  }

  const data = record.data;
  if (typeof data === "object" && data !== null) {
    const nested = extractExternalMuseReply(data);
    if (nested) return nested;
  }

  const choices = record.choices;
  if (Array.isArray(choices)) {
    const first = choices[0] as Record<string, unknown> | undefined;
    if (first) {
      const message = first.message;
      if (typeof message === "object" && message !== null) {
        const content = (message as Record<string, unknown>).content;
        if (typeof content === "string") return content;
      }
      if (typeof first.text === "string") return first.text;
    }
  }

  const output = record.output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const nested = extractExternalMuseReply(item);
      if (nested) return nested;
    }
  }

  return null;
}

function isMuseConversationStage(value: unknown): value is MuseConversationStage {
  return (
    value === "arrival" ||
    value === "birth_context" ||
    value === "travel_context" ||
    value === "desire_mapping" ||
    value === "safety_boundaries" ||
    value === "recommendation_ready"
  );
}

function isMuseChatResponse(value: unknown): value is MuseChatResponse {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<MuseChatResponse>;
  return (
    typeof candidate.conversationId === "string" &&
    isMuseConversationStage(candidate.stage) &&
    typeof candidate.reply === "object" &&
    candidate.reply !== null &&
    candidate.reply.role === "muse" &&
    typeof candidate.reply.content === "string" &&
    Array.isArray(candidate.suggestedPrompts) &&
    typeof candidate.profileSignals === "object" &&
    candidate.profileSignals !== null
  );
}

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
    errors.experience = "Choose a supported experience style.";
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

async function createTravellerPaymentSession(
  request: Request,
  env: WorkerEnv,
  inquiryId: string,
  ok: <T>(data: T, init?: ResponseInit) => Response,
  fail: (
    status: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string>,
    init?: ResponseInit,
  ) => Response,
  options: { errorOnBlocked: boolean },
): Promise<Response> {
  const session = getSessionFromRequest(request);
  if (!session) {
    return fail(401, "SESSION_REQUIRED", "Sign in before creating a payment session.");
  }

  const result = await createPaymentSession("stripe", {
    mode: getPaymentProviderMode(env),
    stripeSecretKey: env.STRIPE_SECRET_KEY,
    origin: new URL(request.url).origin,
    inquiryId,
    customerEmail: session.profile.email,
    amount: parseStripeUnitAmount(env.STRIPE_CHECKOUT_UNIT_AMOUNT),
    currency: env.STRIPE_CHECKOUT_CURRENCY,
  });

  if (result.status === "blocked") {
    if (!options.errorOnBlocked) {
      return ok(result);
    }
    const status = result.code === "PAYMENT_PROVIDER_NOT_CONFIGURED" ? 503 : 409;
    return fail(status, result.code, result.message);
  }

  return ok(result, { status: 201 });
}

function getPaymentProviderMode(env: WorkerEnv): PaymentProviderMode {
  return env.PAYMENT_PROVIDER_MODE === "stripe_test" ? "stripe_test" : "compliance_hold";
}

function parseStripeUnitAmount(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const amount = Number.parseInt(value, 10);
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
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
      errors.experienceTags = "Choose at least one experience style.";
    } else if (body.experienceTags.some((value) => !isExperienceSlug(value))) {
      errors.experienceTags = "Choose only supported experience styles.";
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
      description: "Keep the bio premium, practical, and non-objectifying.",
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
      description: "Submit private details before your profile can be visible.",
      complete: profile.verificationReferences.length > 0 && profile.privateReviewNote.trim().length >= 20,
    },
    {
      id: "submitted",
      label: "Submitted",
      description: "The profile stays hidden while Tirak checks the details.",
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
    chart: companionMuseChart,
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
    nextStep: "Tirak is checking the plan before any introduction or payment.",
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
        label: "Introduction decision",
        status: "pending",
        note: "No introduction or payment happens before Tirak clears the plan.",
      },
    ],
    paymentState: {
      status: "disabled_for_compliance",
      provider: "stripe",
      note: "Payment is not available for this inquiry yet.",
    },
    privacyNote: "Inquiry details stay private and are not published to profiles or discovery.",
  };
}

function toInquirySummary(inquiry: TravellerInquiryDetail) {
  const { message: _message, timeline: _timeline, paymentState: _paymentState, privacyNote: _privacyNote, ...summary } = inquiry;
  return summary;
}

function toSessionSummary(session: TravellerSessionDetail) {
  const {
    museRead: _museRead,
    itinerary: _itinerary,
    messageThread: _messageThread,
    safetyNotes: _safetyNotes,
    paymentState: _paymentState,
    privacyNote: _privacyNote,
    ...summary
  } = session;
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
      return routeApi(request, env);
    }

    return withStaticSecurityHeaders(await env.ASSETS.fetch(request));
  },
} satisfies ExportedHandler<WorkerEnv>;

function withStaticSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(STATIC_SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
