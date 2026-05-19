import { json, apiError, createRequestId } from "./http";
import {
  createStagedDataProvider,
  isProviderAvailabilityWindow,
  isProviderCity,
  isProviderExperience,
} from "./staged-provider";
import { companionMuseChart, travellerMuseChart } from "./staged-data";
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
  MuseChatRequest,
  MuseChatResponse,
  MuseConversationStage,
  MuseProfileSignals,
  SafetyReportRequest,
  TravellerInquiryDetail,
  TravellerInquiryRequest,
  TravellerSessionDetail,
} from "../shared/contracts";

type WorkerEnv = Env & {
  MUSE_AGENT_API_KEY?: string;
  MUSE_AGENT_CONFIG?: KVNamespace;
  MUSE_AGENT_CONFIG_KEY?: string;
  MUSE_AGENT_MODE?: "staged" | "external";
  MUSE_RAG?: Fetcher;
  SELEMENE_ENGINE_API_KEY?: string;
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

  if (request.method === "POST" && pathname === "/api/muse/chat") {
    const body = await readJsonBody<MuseChatRequest>(request, requestId);
    if (body instanceof Response) return body;

    const fieldErrors = validateMuseChatRequest(body);
    if (Object.keys(fieldErrors).length > 0) {
      return fail(422, "MUSE_CHAT_VALIDATION_FAILED", "Muse needs a short message to continue.", fieldErrors);
    }

    return ok(await createMuseChatResponse(body, env));
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
      chart: companionMuseChart,
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
  const signals = inferMuseProfileSignals(message);
  const stage = inferNextMuseStage(body.stage ?? "arrival", signals, message);
  const conversationId = body.conversationId?.trim() || `muse_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const reply = selectStagedMuseReply(stage, signals, message);

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

function inferMuseProfileSignals(message: string): MuseProfileSignals {
  const lower = message.toLowerCase();
  const city = (["bangkok", "phuket", "koh-samui", "koh-phangan"] as CitySlug[]).find((item) =>
    lower.includes(item.replace("-", " ")) || lower.includes(item),
  );
  const experienceHints = (["nightlife", "island-explorer", "muay-thai-night", "private-dining", "local-guidance"] as ExperienceSlug[]).filter(
    (experience) => lower.includes(experience.replaceAll("-", " ")) || lower.includes(experience),
  );
  const dateMatch = message.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/);
  const timeMatch = message.match(/\b(?:[01]?\d|2[0-3])(?::[0-5]\d)?\s?(?:am|pm)?\b/i);
  const placeMatch = message.match(/\b(?:born in|birth place is|from)\s+([a-zA-Z\s-]{3,40})/i);
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
      ...(timeMatch ? { time: timeMatch[0] } : {}),
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
      suggestedRole: lower.includes("profile") || lower.includes("bio") || lower.includes("services") ? "companion" : "traveller",
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
  if (currentStage === "safety_boundaries") return "recommendation_ready";
  return currentStage === "arrival" ? "birth_context" : currentStage;
}

function selectStagedMuseReply(stage: MuseConversationStage, signals: MuseProfileSignals, message: string): string {
  if (stage === "birth_context") {
    return "I can start there. Give me your birth date, birth place, and if you know it, the time. I will keep the details private and turn it into a useful read, not a lecture.";
  }
  if (stage === "travel_context") {
    return "Good. Now tell me where Thailand enters the story: Bangkok, Phuket, Samui, Phangan, or a moving target? Add the window too. I am looking for rhythm, not a checklist.";
  }
  if (stage === "desire_mapping") {
    return "I am picking up the shape of it. Say the quiet part plainly: do you want warmth, wit, calm privacy, sharp nightlife energy, local guidance, or someone who can make the evening feel less improvised?";
  }
  if (stage === "safety_boundaries") {
    return "Before I route anything, give me the guardrails. What should feel absolutely off-limits, what pace feels comfortable, and how visible do you want this to be?";
  }
  if (stage === "recommendation_ready") {
    const city = signals.travelContext.city ? signals.travelContext.city.replace("-", " ") : "your first city";
    return `I have enough to sketch a discreet path for ${city}. I will keep it private, filter for tone and safety first, then show options only when the fit is clean.`;
  }
  return `Tell me what brings you here in one line. I will make the next question sharper than "${message.slice(0, 48)}" deserves.`;
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
    return { label: "Open companion assist", href: "/auth/login", kind: "auth" };
  }
  return { label: "Review private discovery", href: "/auth/login", kind: "auth" };
}

function createMuseChartFromSignals(signals: MuseProfileSignals) {
  const hasBirthContext = signals.birthContext.confidence !== "none";
  const city = signals.travelContext.city?.replace("-", " ") ?? "open city";
  const desire = signals.desireVector[0] ?? "private fit";
  const boundary = signals.boundarySignals[0] ?? "ask first";

  return {
    ...travellerMuseChart,
    summary: hasBirthContext
      ? "Muse has enough birth context to shape the read without exposing the private method."
      : "Muse is still waiting for birth date, place, and optional time before sharpening the read.",
    axes: [
      { label: "Birth read", value: hasBirthContext ? signals.birthContext.confidence : "needed", tone: "lavender" as const },
      { label: "City", value: city, tone: "pearl" as const },
      { label: "Mood", value: desire, tone: "rose" as const },
      { label: "Boundary", value: boundary, tone: "green" as const },
    ],
    cues: [
      hasBirthContext ? "Translate the read into plain language" : "Collect date, place, and optional time",
      signals.travelContext.city ? "Use city rhythm" : "Ask for the first city",
      signals.boundarySignals.length > 0 ? "Respect stated limits" : "Clarify what should stay off-limits",
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

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
