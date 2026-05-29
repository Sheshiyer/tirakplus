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
  AccountDataExportRequest,
  AccountDeletionCreateRequest,
  AccountDeletionResponse,
  AccountPrivacyUpdateRequest,
  AvailabilityWindow,
  BookingRecord,
  ChatAuthorRole,
  ChatMessage,
  ChatThreadResponse,
  CitySlug,
  CompanionAvailabilityUpdateRequest,
  CompanionDeclineInquiryRequest,
  CompanionDeclineReasonCategory,
  CompanionDraftProfile,
  CompanionInquiryDecisionResponse,
  CompanionOptionSet,
  CompanionOnboardingStep,
  CompanionOnboardingState,
  CompanionProfileUpdateRequest,
  CompanionReviewsResponse,
  CompanionVerificationSubmitRequest,
  CompanionVisibilityUpdateRequest,
  DayOfDetailsResponse,
  DiscoveryFilterSelection,
  ExperienceSlug,
  InquiryStatus,
  MarkThreadReadRequest,
  MarkThreadReadResponse,
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
  PaymentHoldRequest,
  ReviewRequest,
  ReviewSubmissionResponse,
  SafetyReportRequest,
  SendMessageRequest,
  SendMessageResponse,
  SetDayOfDetailsRequest,
  TravellerInquiryDetail,
  TravellerInquiryRequest,
  TravellerSessionDetail,
} from "../shared/contracts";
import {
  appendSafetyReport,
  cancelDeletion,
  readDataExport,
  readDeletion,
  readPrivacy,
  readSafetyReports,
  requestDataExport,
  requestDeletion,
  writePrivacy,
} from "./account-store.js";
import {
  computeAggregateRating,
  computeUnreadCount,
  createBooking,
  detailOrFallback,
  forceSetBookingStatus,
  isTravellerOwner,
  labelForDeclineReason,
  listCompanionBookings,
  listOrFallback,
  listTravellerBookings,
  markThreadRead,
  maybeAdvanceSessionStatus,
  maybeAdvanceSessionStatusBatch,
  patchBooking,
  projectBookingToCompanionInquirySummary,
  projectBookingToCompanionSessionDetail,
  projectBookingToTravellerInquiryDetail,
  projectBookingToTravellerInquirySummary,
  readBooking,
  readCompanionReviews,
  readLastReadAt,
  readMessages,
  sendMessage,
  submitReview,
  transitionBookingStatus,
  travellerLabelFromBooking,
} from "./booking-store.js";
import { sendInquiryDecisionEmail, sendPlanConfirmedEmail } from "./email.js";

type PaymentProviderMode = "compliance_hold" | "stripe_test";

// H3.T2 fix (2026-05-27) — Strict ISO datetime pre-check used by both plan
// window validators below. Date.parse alone is too lenient: it accepts
// date-only "2026-06-01" and US-format "06/01/2026" strings that the
// contract type DateWindow (contracts.ts) documents as "ISO datetime".
// This regex requires at minimum YYYY-MM-DDTHH:MM; trailing seconds,
// milliseconds, and timezone (Z or ±HH:MM) are allowed.
const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

// Pass I (2026-05-27) — Statuses at which the chat thread is unlocked.
// Originally declared local to the chat-message handlers; hoisted to
// module scope in Pass I.T8 so the inquiry-list handlers can also gate
// `unreadMessageCount` enrichment on the same allowlist (avoids N+1 KV
// reads on routed/declined/cancelled bookings that can never have a
// thread).
const MATCHED_STATUSES: InquiryStatus[] = [
  "accepted",
  "date_pending",
  "date_proposed",
  "date_confirmed",
  "payment_held",
  "session_scheduled",
  "session_live",
  "session_completed",
  "review_pending",
  "review_completed",
];

type WorkerEnv = Omit<Env, "ENVIRONMENT" | "PAYMENT_PROVIDER_MODE"> & {
  ACCOUNT_DATA?: KVNamespace;        // Pass E (2026-05-26): per-account prefs, exports, deletions, safety-report list
  AUTH_OTPS?: KVNamespace;
  BOOKING_DATA?: KVNamespace;        // Pass H (2026-05-27): inquiry → booking lifecycle state + per-user inquiry lists + companion rating aggregates
  // EMAIL?: SendEmail; — CF send_email binding removed 2026-05-26
  // ENVIRONMENT — widened from the generated `"staging"` literal so prod-vs-non-prod
  // comparisons (e.g. dev login gate, H2.T1 auto-route) typecheck against "production".
  ENVIRONMENT?: string;
  MUSE_AGENT_API_KEY?: string;
  MUSE_AGENT_CONFIG?: KVNamespace;
  MUSE_AGENT_CONFIG_KEY?: string;
  MUSE_AGENT_MODE?: "staged" | "external";
  MUSE_CONVERSATIONS?: KVNamespace;
  MUSE_RAG?: Fetcher;
  PAYMENT_PROVIDER_MODE?: PaymentProviderMode;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
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

  // H6.T4 (2026-05-27) — Public companion reviews endpoint.
  // No session/role required: anyone browsing companion profiles can
  // see the rating + last 25 reviews. Path uses /api/companions/ (plural,
  // public) to distinguish it from /api/companion/ (singular, companion-
  // protected role guard below). 404 if the companion profile doesn't
  // exist; otherwise empty aggregate + reviews for brand-new companions.
  const companionReviewsMatch = pathname.match(/^\/api\/companions\/([^/]+)\/reviews$/);
  if (request.method === "GET" && companionReviewsMatch) {
    const companionId = companionReviewsMatch[1];

    const profile = provider.getCompanionProfile(companionId);
    if (!profile) {
      return fail(404, "PROFILE_NOT_FOUND", "This companion profile is unavailable.");
    }

    // companionEmail synthesis matches booking-store.ts companionEmailFor()
    const companionEmail = `companion-${companionId.toLowerCase()}@tirak.app`;
    const reviews = await readCompanionReviews(env.BOOKING_DATA, companionEmail);
    const aggregate = computeAggregateRating(reviews);

    const response: CompanionReviewsResponse = {
      companionId,
      aggregate,
      reviews,
    };
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
    // Pass H (2026-05-27) — KV-backed: inquiry is persisted as a
    // BookingRecord under booking:{id} and indexed under both the
    // traveller's and the companion's email. Session check happens
    // before body parsing so unauthenticated callers fail fast.
    const session = getSessionFromRequest(request);
    if (!session) {
      return fail(401, "SESSION_REQUIRED", "Sign in before submitting an inquiry.");
    }

    const body = await readJsonBody<TravellerInquiryRequest>(request, requestId);
    if (body instanceof Response) return body;

    const fieldErrors = validateInquiry(body);
    if (Object.keys(fieldErrors).length > 0) {
      return fail(422, "INQUIRY_VALIDATION_FAILED", "Review the inquiry fields and try again.", fieldErrors);
    }

    // P2 (2026-05-28) — experience is now user-selected in the composer (no
    // longer trusted from a URL prop), so validate the slug server-side.
    if (!isExperienceSlug(body.experience)) {
      return fail(422, "INVALID_EXPERIENCE", "Choose a supported experience style.", {
        experience: "Choose a supported experience style.",
      });
    }

    // P2 (2026-05-28) — scheduledFor must be a future ISO datetime (≥2h lead).
    const scheduleError = validateScheduledFor(body.scheduledFor);
    if (scheduleError) {
      return fail(422, "INVALID_SCHEDULE", scheduleError, { scheduledFor: scheduleError });
    }

    // P2 (2026-05-28) — location is the traveller's preferred meeting place,
    // trimmed length 1-200.
    const trimmedLocation = typeof body.location === "string" ? body.location.trim() : "";
    if (trimmedLocation.length === 0) {
      return fail(422, "LOCATION_REQUIRED", "Add a preferred meeting place.", {
        location: "Add a preferred meeting place.",
      });
    }
    if (trimmedLocation.length > 200) {
      return fail(422, "LOCATION_TOO_LONG", "Keep the meeting place under 200 characters.", {
        location: "Keep the meeting place under 200 characters.",
      });
    }

    const profile = provider.getCompanionProfile(body.companionId);
    if (!profile || profile.visibilityState !== "public") {
      return fail(404, "PROFILE_NOT_FOUND", "This profile is unavailable for inquiry.");
    }

    // H2.T1 (2026-05-27) — Dev/staging auto-route. Real Tirak admin
    // review tooling is out of scope, so any non-prod environment skips
    // the "submitted" + "under_review" steps and lands the inquiry at
    // "routed" directly. This lets the H2 companion accept/decline flow
    // be exercised end-to-end. Production preserves status="submitted".
    const autoRoute = env.ENVIRONMENT !== "production";
    const booking = await createBooking(env.BOOKING_DATA, body, session.profile.email, { autoRoute });
    return ok(
      {
        inquiry: projectBookingToTravellerInquiryDetail(booking, profile.displayName),
      },
      { status: 201 },
    );
  }

  if (request.method === "GET" && pathname === "/api/traveller/inquiries") {
    // Pass H (2026-05-27) — KV-backed listing for the current traveller,
    // with fixture fallback when KV returns empty so first-time dev runs
    // still surface demo content. Uses the summary projector directly
    // so list rows don't allocate the heavy detail fields.
    const session = getSessionFromRequest(request);
    if (!session) {
      return fail(401, "SESSION_REQUIRED", "Sign in to view your private inquiries.");
    }
    const results = await listOrFallback(
      async () => {
        const bookings = await listTravellerBookings(env.BOOKING_DATA, session.profile.email);
        return await maybeAdvanceSessionStatusBatch(env.BOOKING_DATA, bookings);
      },
      (booking) => {
        const companion = provider.getCompanionProfile(booking.companionId);
        return projectBookingToTravellerInquirySummary(booking, companion?.displayName ?? "Companion profile");
      },
      () => provider.listTravellerInquiries().map(toInquirySummary),
    );
    // Pass I.T8 — populate `unreadMessageCount` per row (matched
    // statuses only; locked threads keep the field undefined).
    await enrichSummariesWithUnreadCounts(results, env.BOOKING_DATA, session.profile.email, "traveller");
    return ok({
      results,
      emptyState: {
        title: "No private inquiries yet.",
        description: "Start from a reviewed profile and submit a respectful inquiry for human review.",
      },
    });
  }

  const inquiryMatch = pathname.match(/^\/api\/traveller\/inquiries\/([^/]+)$/);
  if (request.method === "GET" && inquiryMatch) {
    // Pass H (2026-05-27) — load KV-first, fall back to fixture for demo
    // continuity. isTravellerOwner prevents cross-traveller leaks even
    // when both rows happen to be in KV.
    const session = getSessionFromRequest(request);
    if (!session) {
      return fail(401, "SESSION_REQUIRED", "Sign in to view this inquiry.");
    }
    const detail = await detailOrFallback(
      async () => {
        const booking = await readBooking(env.BOOKING_DATA, inquiryMatch[1]);
        return booking ? await maybeAdvanceSessionStatus(env.BOOKING_DATA, booking) : null;
      },
      (booking) => isTravellerOwner(booking, session),
      (booking) => {
        const companion = provider.getCompanionProfile(booking.companionId);
        return projectBookingToTravellerInquiryDetail(booking, companion?.displayName ?? "Companion profile");
      },
      () => provider.getTravellerInquiry(inquiryMatch[1]),
    );
    if (!detail) return fail(404, "INQUIRY_NOT_FOUND", "This inquiry is unavailable.");
    return ok(detail);
  }

  if (request.method === "DELETE" && inquiryMatch) {
    // Pass H1.T6 (2026-05-27) — KV-only cancellation. Fixture rows aren't
    // mutable so we 404 rather than pretend success. Ownership is checked
    // via isTravellerOwner before any state machine work; the allowlist
    // (submitted | under_review | routed → cancelled, traveller actor) is
    // enforced by transitionBookingStatus. CSRF + rate limit are already
    // applied by guardApiMutation at the top of routeApi.
    const session = getSessionFromRequest(request);
    if (!session) {
      return fail(401, "SESSION_REQUIRED", "Sign in to cancel this inquiry.");
    }
    const booking = await readBooking(env.BOOKING_DATA, inquiryMatch[1]);
    if (!booking) {
      return fail(404, "INQUIRY_NOT_FOUND", "This inquiry is unavailable.");
    }
    if (!isTravellerOwner(booking, session)) {
      return fail(403, "NOT_OWNER", "You can only cancel your own inquiries.");
    }
    const updated = await transitionBookingStatus(
      env.BOOKING_DATA,
      inquiryMatch[1],
      ["submitted", "under_review", "routed"],
      "cancelled",
      session.profile.email,
    );
    if (!updated) {
      return fail(
        409,
        "INVALID_TRANSITION",
        "This inquiry can no longer be cancelled from its current stage.",
      );
    }
    const displayName =
      provider.getCompanionProfile(updated.companionId)?.displayName ?? "Companion profile";
    return ok({
      inquiry: projectBookingToTravellerInquiryDetail(updated, displayName),
    });
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
    // Pass H (2026-05-27) — companion list. Seeded companions don't have
    // real emails today, so listCompanionBookings against session email
    // typically returns []; the fixture fallback keeps the inbox useful
    // during dev. Real-companion emails will land here once the Pass E
    // onboarding flow stamps verified addresses on profiles.
    const roleGuard = requireCustomerRole(request, "companion", fail);
    if (roleGuard) return roleGuard;
    const session = getSessionFromRequest(request)!;
    const results = await listOrFallback(
      async () => {
        const bookings = await listCompanionBookings(env.BOOKING_DATA, session.profile.email);
        return await maybeAdvanceSessionStatusBatch(env.BOOKING_DATA, bookings);
      },
      projectBookingToCompanionInquirySummary,
      () => provider.listCompanionInquiries(),
    );
    // Pass I.T8 — populate `unreadMessageCount` per row (matched
    // statuses only; locked threads keep the field undefined). The
    // session email may not match the synthetic companion-fixture
    // email today (see L660 H2 note), so for fixture-fallback rows
    // lastReadAt will be undefined and the badge will show every
    // companion message until the thread is opened — acceptable for
    // v1 demo data.
    await enrichSummariesWithUnreadCounts(results, env.BOOKING_DATA, session.profile.email, "companion");
    return ok({
      results,
      emptyState: {
        title: "No reviewed inquiries yet.",
        description: "Tirak sends inquiries after review, without fake demand or online-now pressure.",
      },
    });
  }

  const companionSessionMatch = pathname.match(/^\/api\/companion\/inquiries\/([^/]+)$/);
  if (request.method === "GET" && companionSessionMatch) {
    // Pass H (2026-05-27) — KV-first, fixture fallback. Authorization is
    // role-only here because companion emails on BookingRecord are still
    // synthetic placeholders; H2 will tighten ownership (via isCompanionOwner)
    // once verified companion emails exist.
    const roleGuard = requireCustomerRole(request, "companion", fail);
    if (roleGuard) return roleGuard;
    const detail = await detailOrFallback(
      async () => {
        const booking = await readBooking(env.BOOKING_DATA, companionSessionMatch[1]);
        return booking ? await maybeAdvanceSessionStatus(env.BOOKING_DATA, booking) : null;
      },
      () => true,
      (booking) => projectBookingToCompanionSessionDetail(booking, companionMuseChart),
      () => provider.getCompanionSession(companionSessionMatch[1]),
    );
    if (!detail) return fail(404, "COMPANION_INQUIRY_NOT_FOUND", "This routed inquiry is unavailable.");
    return ok(detail);
  }

  const companionDecisionMatch = pathname.match(/^\/api\/companion\/inquiries\/([^/]+)\/(accept|decline)$/);
  if (request.method === "POST" && companionDecisionMatch) {
    const id = companionDecisionMatch[1];
    const decision = companionDecisionMatch[2] as "accept" | "decline";

    // Role gate (session is already guaranteed by requireCustomerRole)
    const roleGuard = requireCustomerRole(request, "companion", fail);
    if (roleGuard) return roleGuard;

    // Load booking; must exist + must be routed
    const booking = await readBooking(env.BOOKING_DATA, id);
    if (!booking) return fail(404, "INQUIRY_NOT_FOUND", "This routed inquiry is unavailable.");
    if (booking.status !== "routed") {
      return fail(409, "INVALID_TRANSITION", "This inquiry is past the accept/decline window.");
    }

    // NOTE on ownership: companion emails on BookingRecord are synthetic in v1
    // (companion-{id}@tirak.app), so isCompanionOwner won't match the session's
    // dev.companion@tirak.app. For H2 we gate on role + status only.
    // We pass booking.companionEmail (the synthetic record-side identifier) as
    // the actor so transitionBookingStatus's actor==companionEmail check
    // succeeds — the audit trail still attributes the action to the matched
    // companion identifier rather than a contradictory session email.
    // TODO: pass session.profile.email + re-enable isCompanionOwner once real
    // companion email verification ships.

    if (decision === "accept") {
      let updated = await transitionBookingStatus(
        env.BOOKING_DATA,
        id,
        ["routed"],
        "accepted",
        booking.companionEmail,
        { acceptedAt: new Date().toISOString() },
      );
      if (!updated) return fail(409, "INVALID_TRANSITION", "Could not accept this inquiry.");

      // P2 (2026-05-28) — Single-page composer sets scheduledFor at inquiry
      // creation, so accept auto-advances accepted → date_confirmed in the
      // same request (actor="system") and stamps confirmedAt. If scheduledFor
      // is missing (legacy H3 booking), SKIP the auto-advance and leave it at
      // "accepted" — the T2/T5 reschedule fallback handles it. No crash.
      if (updated.scheduledFor) {
        const confirmed = await transitionBookingStatus(
          env.BOOKING_DATA,
          id,
          ["accepted"],
          "date_confirmed",
          "system",
          { confirmedAt: new Date().toISOString() },
        );
        if (confirmed) updated = confirmed;
      }

      // H2.T4 (2026-05-27) — Email notification on decision. Fire-and-forget;
      // failures don't block the response. Sent with "accepted" decision even
      // when we auto-advanced to date_confirmed (the decision was an accept).
      await sendInquiryDecisionEmail(env, {
        travellerEmail: updated.travellerEmail,
        companionDisplayName: provider.getCompanionProfile(updated.companionId)?.displayName ?? "Companion",
        decision: "accepted",
        declineReason: updated.declineReason ? labelForDeclineReason(updated.declineReason) : undefined,
        inquiryUrl: `https://tirak.app/traveller/inbox/${updated.id}`,
      }).catch((err) => console.warn("[inquiry-decision-email]", err));
      return ok({
        inquiry: projectBookingToCompanionSessionDetail(updated, companionMuseChart),
        message: "Inquiry accepted. The traveller will be notified.",
      });
    }

    // decline branch
    const body = await readJsonBody<CompanionDeclineInquiryRequest>(request, requestId);
    if (body instanceof Response) return body;
    const fieldErrors = validateDecline(body);
    if (Object.keys(fieldErrors).length > 0) {
      return fail(422, "DECLINE_VALIDATION_FAILED", "Review the decline reason and try again.", fieldErrors);
    }

    const updated = await transitionBookingStatus(
      env.BOOKING_DATA,
      id,
      ["routed"],
      "declined",
      booking.companionEmail,
      {
        declineReason: body.reasonCategory,
        declineNotes: body.notes?.trim() || undefined,
        declinedAt: new Date().toISOString(),
      },
    );
    if (!updated) return fail(409, "INVALID_TRANSITION", "Could not decline this inquiry.");
    // H2.T4 (2026-05-27) — Email notification on decision. Fire-and-forget;
    // failures don't block the response.
    await sendInquiryDecisionEmail(env, {
      travellerEmail: updated.travellerEmail,
      companionDisplayName: provider.getCompanionProfile(updated.companionId)?.displayName ?? "Companion",
      decision: updated.status as "accepted" | "declined",
      declineReason: updated.declineReason ? labelForDeclineReason(updated.declineReason) : undefined,
      inquiryUrl: `https://tirak.app/traveller/inbox/${updated.id}`,
    }).catch((err) => console.warn("[inquiry-decision-email]", err));
    return ok({
      inquiry: projectBookingToCompanionSessionDetail(updated, companionMuseChart),
      message: "Inquiry declined. The traveller will be notified.",
    });
  }

  // H4-stub (2026-05-27) — Dummy payment hold. Real Stripe checkout-session
  // creation is deferred to H4-real at the end of the roadmap. This endpoint
  // transitions date_confirmed → payment_held with placeholder values
  // (paymentSessionId="dev_stub", paymentStatus="held") so the eventual
  // real-Stripe replacement can diff against them cleanly. In non-prod
  // environments we ALSO auto-advance payment_held → session_scheduled
  // immediately (mirrors the H2.T1 auto-route bridge) so H5 day-of work
  // has something to render against.
  const planHoldMatch = pathname.match(/^\/api\/plans\/([^/]+)\/hold$/);
  if (request.method === "POST" && planHoldMatch) {
    const id = planHoldMatch[1];
    const session = getSessionFromRequest(request);
    if (!session) return fail(401, "SESSION_REQUIRED", "Sign in to hold this plan.");
    const booking = await readBooking(env.BOOKING_DATA, id);
    if (!booking) return fail(404, "INQUIRY_NOT_FOUND", "This inquiry is unavailable.");
    if (!isTravellerOwner(booking, session)) {
      return fail(403, "NOT_OWNER", "You can only hold your own inquiries.");
    }
    if (booking.status !== "date_confirmed") {
      return fail(409, "INVALID_TRANSITION", "This inquiry is not ready for a payment hold.");
    }
    // PaymentHoldRequest is currently `{}` but we still parse to enforce
    // a JSON object body (consistency with other mutation endpoints).
    const body = await readJsonBody<PaymentHoldRequest>(request, requestId);
    if (body instanceof Response) return body;
    let updated = await transitionBookingStatus(
      env.BOOKING_DATA,
      id,
      ["date_confirmed"],
      "payment_held",
      session.profile.email,
      {
        paymentSessionId: "dev_stub",
        paymentStatus: "held",
        paymentAmount: undefined,
        paymentCurrency: undefined,
        heldAt: new Date().toISOString(),
      },
    );
    if (!updated) return fail(409, "INVALID_TRANSITION", "Could not hold this plan.");

    // Non-prod auto-advance to session_scheduled. Mirrors H2.T1's
    // auto-route bridge so H5 day-of itinerary work has a stable target
    // status to render against. Production keeps status="payment_held"
    // until the real Stripe webhook arrives.
    if (env.ENVIRONMENT !== "production") {
      const advanced = await transitionBookingStatus(
        env.BOOKING_DATA,
        id,
        ["payment_held"],
        "session_scheduled",
        "system",
      );
      if (advanced) updated = advanced;
    }

    const displayName =
      provider.getCompanionProfile(updated.companionId)?.displayName ?? "Companion profile";
    return ok({
      inquiry: projectBookingToTravellerInquiryDetail(updated, displayName),
      message: "Booking held. Tirak will share day-of details closer to the date.",
    });
  }

  // H5.T1 (2026-05-27) — Companion sets day-of details on a confirmed
  // booking. Metadata-only: patchBooking writes the record without
  // touching the state machine. Editable from date_confirmed through
  // session_completed.
  const planDayOfDetailsMatch = pathname.match(/^\/api\/plans\/([^/]+)\/day-of-details$/);
  if (request.method === "POST" && planDayOfDetailsMatch) {
    const id = planDayOfDetailsMatch[1];
    const roleGuard = requireCustomerRole(request, "companion", fail);
    if (roleGuard) return roleGuard;

    const booking = await readBooking(env.BOOKING_DATA, id);
    if (!booking) return fail(404, "INQUIRY_NOT_FOUND", "This inquiry is unavailable.");

    // Day-of details are editable from date_confirmed through session_completed.
    // Outside that window the form makes no sense.
    const editableStatuses: InquiryStatus[] = [
      "date_confirmed", "payment_held", "session_scheduled", "session_live", "session_completed",
    ];
    if (!editableStatuses.includes(booking.status)) {
      return fail(409, "INVALID_STAGE", "Day-of details can only be set on a confirmed plan.");
    }

    const body = await readJsonBody<SetDayOfDetailsRequest>(request, requestId);
    if (body instanceof Response) return body;

    const fieldErrors = validateDayOfDetails(body);
    if (Object.keys(fieldErrors).length > 0) {
      return fail(422, "DAY_OF_DETAILS_VALIDATION_FAILED", "Review the day-of fields and try again.", fieldErrors);
    }

    const updated = await patchBooking(env.BOOKING_DATA, id, {
      meetingPoint: body.meetingPoint?.trim() || undefined,
      contactNumber: body.contactNumber?.trim() || undefined,
      dayOfNotes: body.dayOfNotes?.filter((n) => n && n.trim().length > 0).map((n) => n.trim()),
    });
    if (!updated) return fail(404, "INQUIRY_NOT_FOUND", "This inquiry is unavailable.");

    const response: DayOfDetailsResponse = {
      inquiry: projectBookingToCompanionSessionDetail(updated, companionMuseChart),
      message: "Day-of details saved. Both sides will see them when the itinerary unlocks.",
    };
    return ok(response);
  }

  // H6.T3 (2026-05-27) — Traveller submits a post-session review.
  // Pre-validates session → ownership → status → body BEFORE calling
  // submitReview, which prevents the orphan-review case flagged in T2:
  // if any gate fails, the reviews KV index stays untouched. submitReview
  // appends the ReviewSummary to the companion's reviews list and
  // transitions review_pending → review_completed atomically.
  const planReviewMatch = pathname.match(/^\/api\/plans\/([^/]+)\/review$/);
  if (request.method === "POST" && planReviewMatch) {
    const id = planReviewMatch[1];

    const session = getSessionFromRequest(request);
    if (!session) return fail(401, "SESSION_REQUIRED", "Sign in to leave a review.");

    const booking = await readBooking(env.BOOKING_DATA, id);
    if (!booking) return fail(404, "INQUIRY_NOT_FOUND", "This inquiry is unavailable.");

    if (!isTravellerOwner(booking, session)) {
      return fail(403, "NOT_OWNER", "You can only review your own sessions.");
    }

    if (booking.status !== "review_pending") {
      return fail(
        409,
        "INVALID_STAGE",
        booking.status === "review_completed"
          ? "This session has already been reviewed."
          : "This session is not ready for a review.",
      );
    }

    const body = await readJsonBody<ReviewRequest>(request, requestId);
    if (body instanceof Response) return body;

    const fieldErrors = validateReview(body);
    if (Object.keys(fieldErrors).length > 0) {
      return fail(422, "REVIEW_VALIDATION_FAILED", "Review the score + comment and try again.", fieldErrors);
    }

    const updated = await submitReview(env.BOOKING_DATA, booking, {
      score: body.score,
      comment: body.comment.trim(),
      travellerLabel: travellerLabelFromBooking(booking),
    });
    if (!updated) {
      return fail(409, "INVALID_TRANSITION", "Could not submit the review (status changed).");
    }

    const companionDisplayName =
      provider.getCompanionProfile(updated.companionId)?.displayName ?? "Companion";

    const response: ReviewSubmissionResponse = {
      inquiry: projectBookingToTravellerInquiryDetail(updated, companionDisplayName),
      message: "Review submitted. Thanks for sharing.",
    };
    return ok(response);
  }

  // ===== Pass I (2026-05-27) — Booking-thread chat =====
  //
  // Three endpoints back the per-booking message panel:
  //   1. POST /api/plans/:id/messages       — send (either party)
  //   2. GET  /api/plans/:id/messages       — fetch thread + unread count
  //   3. POST /api/plans/:id/messages/read  — mark thread read (per-user)
  //
  // State gate: thread is unlocked once booking.status enters the
  // matched range (accepted) and stays unlocked through review_completed.
  // Outside that range (routed, submitted, declined, cancelled, etc.)
  // we return 409 THREAD_LOCKED so the UI can hide / disable the panel.
  //
  // Authorization is loose on the companion side because companion emails
  // on BookingRecord are synthetic in v1 (see H2 limitation note around
  // L660) — we gate companion access on role + booking existence + status,
  // not on session.profile.email match. Traveller access still goes
  // through isTravellerOwner to prevent cross-traveller leaks.
  //
  // authorLabel is server-derived (never user input): "Traveller" for the
  // traveller, companion.displayName for the companion. Mirrors the H6
  // review PII stance — no email/full-name exposure in chat history.
  //
  // MATCHED_STATUSES (the chat-unlocked allowlist) lives at module scope
  // since Pass I.T8 so the inquiry-list handlers can share it.

  // Match the more-specific /messages/read BEFORE /messages so the
  // dispatch order is correct (otherwise a POST to /messages/read would
  // mis-trigger the send handler with a malformed id "{id}/read").
  const planMessagesReadMatch = pathname.match(/^\/api\/plans\/([^/]+)\/messages\/read$/);
  if (request.method === "POST" && planMessagesReadMatch) {
    const id = planMessagesReadMatch[1];

    const session = getSessionFromRequest(request);
    if (!session) return fail(401, "SESSION_REQUIRED", "Sign in to open this thread.");

    const role = session.profile.role;
    if (role !== "traveller" && role !== "companion") {
      return fail(403, "ROLE_REQUIRED", "Switch to your traveller or companion view to open this thread.");
    }

    const booking = await readBooking(env.BOOKING_DATA, id);
    if (!booking) return fail(404, "INQUIRY_NOT_FOUND", "This inquiry is unavailable.");

    if (role === "traveller" && !isTravellerOwner(booking, session)) {
      return fail(403, "NOT_OWNER", "You can only open your own threads.");
    }

    if (!MATCHED_STATUSES.includes(booking.status)) {
      return fail(409, "THREAD_LOCKED", "Messaging opens once the inquiry is accepted.");
    }

    const lastReadAt = await markThreadRead(env.BOOKING_DATA, id, session.profile.email);
    const response: MarkThreadReadResponse = {
      threadId: id,
      lastReadAt,
      unreadCount: 0,
    };
    return ok(response);
  }

  const planMessagesMatch = pathname.match(/^\/api\/plans\/([^/]+)\/messages$/);
  if (request.method === "POST" && planMessagesMatch) {
    const id = planMessagesMatch[1];

    const session = getSessionFromRequest(request);
    if (!session) return fail(401, "SESSION_REQUIRED", "Sign in to send a message.");

    const role = session.profile.role;
    if (role !== "traveller" && role !== "companion") {
      return fail(403, "ROLE_REQUIRED", "Switch to your traveller or companion view to send a message.");
    }

    const booking = await readBooking(env.BOOKING_DATA, id);
    if (!booking) return fail(404, "INQUIRY_NOT_FOUND", "This inquiry is unavailable.");

    if (role === "traveller" && !isTravellerOwner(booking, session)) {
      return fail(403, "NOT_OWNER", "You can only message in your own threads.");
    }

    if (!MATCHED_STATUSES.includes(booking.status)) {
      return fail(409, "THREAD_LOCKED", "Messaging opens once the inquiry is accepted.");
    }

    const body = await readJsonBody<SendMessageRequest>(request, requestId);
    if (body instanceof Response) return body;

    const fieldErrors = validateChatMessage(body);
    if (Object.keys(fieldErrors).length > 0) {
      return fail(422, "CHAT_MESSAGE_VALIDATION_FAILED", "Review your message and try again.", fieldErrors);
    }

    const authorRole = role as ChatAuthorRole;
    const authorLabel =
      role === "traveller"
        ? "Traveller"
        : provider.getCompanionProfile(booking.companionId)?.displayName ?? "Companion";

    const message: ChatMessage = await sendMessage(env.BOOKING_DATA, {
      threadId: id,
      authorRole,
      authorLabel,
      content: body.content.trim(),
    });

    const response: SendMessageResponse = { message };
    return ok(response, { status: 201 });
  }

  if (request.method === "GET" && planMessagesMatch) {
    const id = planMessagesMatch[1];

    const session = getSessionFromRequest(request);
    if (!session) return fail(401, "SESSION_REQUIRED", "Sign in to open this thread.");

    const role = session.profile.role;
    if (role !== "traveller" && role !== "companion") {
      return fail(403, "ROLE_REQUIRED", "Switch to your traveller or companion view to open this thread.");
    }

    const booking = await readBooking(env.BOOKING_DATA, id);
    if (!booking) return fail(404, "INQUIRY_NOT_FOUND", "This inquiry is unavailable.");

    if (role === "traveller" && !isTravellerOwner(booking, session)) {
      return fail(403, "NOT_OWNER", "You can only open your own threads.");
    }

    if (!MATCHED_STATUSES.includes(booking.status)) {
      return fail(409, "THREAD_LOCKED", "Messaging opens once the inquiry is accepted.");
    }

    const messages = await readMessages(env.BOOKING_DATA, id);
    const lastReadAt = await readLastReadAt(env.BOOKING_DATA, id, session.profile.email);
    const unreadCount = computeUnreadCount(messages, lastReadAt, role as ChatAuthorRole);

    const response: ChatThreadResponse = {
      threadId: id,
      messages,
      lastReadAt,
      unreadCount,
    };
    return ok(response);
  }

  // H6.Task 9 (2026-05-27) — DEV ONLY: forcibly advance a booking to an
  // arbitrary status (and optionally spoof scheduledFor / durationMinutes)
  // for end-to-end test scenarios that the time-based state machine
  // can't reach without real wall-clock time (e.g. session_completed →
  // review_pending requires scheduledFor + durationMinutes to be in the
  // past, which is impossible to construct in a single test run without
  // either waiting or rewriting state).
  //
  // Hard production gate — env.ENVIRONMENT !== "production". The handler
  // returns 404 in prod so a misuse leaks no information about the
  // endpoint's existence. Mirrors /api/dev/login's gate (auth.ts:181).
  //
  // The CSRF + session guard still applies (the caller has a dev/login
  // session). forceSetBookingStatus bypasses the TRANSITION_ALLOWLIST and
  // the actor check that transitionBookingStatus enforces — that's the
  // whole point.
  if (request.method === "POST" && pathname === "/api/dev/advance-booking") {
    if (env.ENVIRONMENT === "production") {
      return fail(404, "NOT_FOUND", "Not found.");
    }
    const body = await readJsonBody<{
      id: string;
      to: InquiryStatus;
      scheduledFor?: string;
      durationMinutes?: number;
    }>(request, requestId);
    if (body instanceof Response) return body;
    if (!body?.id || typeof body?.to !== "string") {
      return fail(422, "INVALID_REQUEST", "Provide id + to (target status).");
    }

    // Optionally spoof scheduledFor + durationMinutes BEFORE the status
    // change. patchBooking explicitly preserves status, so this only
    // mutates the time fields — exactly what we want for the "session
    // ended 1h ago" review scenario.
    if (body.scheduledFor !== undefined || body.durationMinutes !== undefined) {
      const timePatched = await patchBooking(env.BOOKING_DATA, body.id, {
        ...(body.scheduledFor !== undefined ? { scheduledFor: body.scheduledFor } : {}),
        ...(body.durationMinutes !== undefined ? { durationMinutes: body.durationMinutes } : {}),
      });
      if (!timePatched) return fail(404, "INQUIRY_NOT_FOUND", "Booking not found.");
    }

    const updated = await forceSetBookingStatus(env.BOOKING_DATA, body.id, body.to);
    if (!updated) return fail(404, "INQUIRY_NOT_FOUND", "Booking not found.");

    const companionDisplayName =
      provider.getCompanionProfile(updated.companionId)?.displayName ?? "Companion";
    return ok({
      inquiry: projectBookingToTravellerInquiryDetail(updated, companionDisplayName),
      message: `Status forcibly set to ${body.to} (DEV ONLY).`,
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

    const response = provider.createSafetyReport(body);
    // Pass E (2026-05-26): append summary so AccountSettings → Safety reports
    // card can list what this account has submitted. KV failure must NOT
    // mask a successful canonical report submission — log and continue.
    try {
      await appendSafetyReport(env.ACCOUNT_DATA, session, response.reportId, body);
    } catch (err) {
      console.error("[safety.report] account-store append failed", err);
    }
    return ok(response, { status: 201 });
  }

  if (request.method === "GET" && pathname === "/api/account") {
    const session = getSessionFromRequest(request);
    if (!session) {
      return fail(401, "SESSION_REQUIRED", "Sign in before viewing account settings.");
    }
    const baseline = provider.getAccount(session);
    const [privacy, dataExport, deletion, safetyReports] = await Promise.all([
      readPrivacy(env.ACCOUNT_DATA, session),
      readDataExport(env.ACCOUNT_DATA, session),
      readDeletion(env.ACCOUNT_DATA, session),
      readSafetyReports(env.ACCOUNT_DATA, session),
    ]);
    return ok({
      ...baseline,
      privacy,
      dataExport,
      deletion,
      safetyReports,
    });
  }

  if (request.method === "PATCH" && pathname === "/api/account/privacy") {
    const session = getSessionFromRequest(request);
    if (!session) {
      return fail(401, "SESSION_REQUIRED", "Sign in before updating account privacy.");
    }

    const body = await readJsonBody<AccountPrivacyUpdateRequest>(request, requestId);
    if (body instanceof Response) return body;

    const privacy = await writePrivacy(env.ACCOUNT_DATA, session, body);
    const baseline = provider.getAccount(session);
    return ok({ account: { ...baseline, privacy } });
  }

  // ===== Pass E (2026-05-26) — data export, deletion, safety-report list =====

  if (request.method === "POST" && pathname === "/api/account/data-export") {
    const session = getSessionFromRequest(request);
    if (!session) {
      return fail(401, "SESSION_REQUIRED", "Sign in before requesting a data export.");
    }
    const record = await requestDataExport(env.ACCOUNT_DATA, session);
    return ok(
      {
        export: record,
        message:
          record.status === "queued"
            ? "Tirak will email you when your export is ready. This usually takes a few hours."
            : "Your previous export is still active and will be reused.",
      },
      { status: 201 },
    );
  }

  if (request.method === "GET" && pathname === "/api/account/data-export") {
    const session = getSessionFromRequest(request);
    if (!session) {
      return fail(401, "SESSION_REQUIRED", "Sign in before viewing data export status.");
    }
    const record = await readDataExport(env.ACCOUNT_DATA, session);
    // Always respond 200 so the client can treat null as "never requested".
    return ok<AccountDataExportRequest | null>(record);
  }

  if (request.method === "POST" && pathname === "/api/account/deletion") {
    const session = getSessionFromRequest(request);
    if (!session) {
      return fail(401, "SESSION_REQUIRED", "Sign in before requesting account deletion.");
    }
    const body = await readJsonBody<AccountDeletionCreateRequest>(request, requestId);
    if (body instanceof Response) return body;

    if (body.confirmation !== "DELETE") {
      return fail(
        422,
        "ACCOUNT_DELETION_CONFIRMATION_REQUIRED",
        "Type DELETE in capital letters to confirm.",
        { confirmation: "Type DELETE in capital letters." },
      );
    }

    const record = await requestDeletion(env.ACCOUNT_DATA, session, body.reason);
    const response: AccountDeletionResponse = {
      deletion: record,
      message: `Account will close on ${formatGraceDate(record.scheduledFor)}. Cancel anytime from this page.`,
    };
    return ok(response, { status: 201 });
  }

  if (request.method === "DELETE" && pathname === "/api/account/deletion") {
    const session = getSessionFromRequest(request);
    if (!session) {
      return fail(401, "SESSION_REQUIRED", "Sign in before cancelling a deletion request.");
    }
    const record = await cancelDeletion(env.ACCOUNT_DATA, session);
    const response: AccountDeletionResponse = {
      deletion: record,
      message: record
        ? "Deletion request cancelled. Your account stays open."
        : "No pending deletion request found.",
    };
    return ok(response);
  }

  if (request.method === "GET" && pathname === "/api/account/safety-reports") {
    const session = getSessionFromRequest(request);
    if (!session) {
      return fail(401, "SESSION_REQUIRED", "Sign in before viewing safety reports.");
    }
    const reports = await readSafetyReports(env.ACCOUNT_DATA, session);
    return ok({ reports });
  }

  return fail(404, "API_ROUTE_NOT_FOUND", "No API route exists for this request.");
}

function formatGraceDate(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
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
  if (request.method !== "POST" && request.method !== "PATCH" && request.method !== "DELETE") return null;
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

// P2 (2026-05-28) — Baseline inquiry validation for the single-page composer.
// scheduledFor / location / experience get DEDICATED error codes
// (INVALID_SCHEDULE / LOCATION_REQUIRED|LOCATION_TOO_LONG / INVALID_EXPERIENCE)
// checked in the handler, so they are intentionally NOT validated here —
// this covers only companionId, city, message, and privacy acknowledgement.
function validateInquiry(body: TravellerInquiryRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  if (typeof body.companionId !== "string" || body.companionId.trim().length === 0) {
    errors.companionId = "Choose a reviewed companion profile.";
  }
  if (!isCitySlug(body.city)) {
    errors.city = "Choose a supported Tirak city.";
  }
  if (typeof body.message !== "string" || body.message.trim().length < 24) {
    errors.message = "Add a respectful inquiry message with at least 24 characters.";
  }
  if (body.privacyAcknowledged !== true) {
    errors.privacyAcknowledged = "Acknowledge privacy and review before submitting.";
  }
  return errors;
}

// P2 (2026-05-28) — Validate the composer's scheduledFor datetime. Must be a
// full ISO datetime (reuses ISO_DATETIME_REGEX — rejects date-only / slash
// formats) AND at least 2 hours in the future, mirroring the old H3 window
// start-time rule. Returns an error message string, or null when valid.
const SCHEDULE_MIN_LEAD_MS = 2 * 60 * 60 * 1000;
function validateScheduledFor(scheduledFor: unknown): string | null {
  if (typeof scheduledFor !== "string" || !ISO_DATETIME_REGEX.test(scheduledFor)) {
    return "Pick a date and time (full ISO datetime).";
  }
  const ms = Date.parse(scheduledFor);
  if (Number.isNaN(ms)) {
    return "That date and time is not valid.";
  }
  if (ms < Date.now() + SCHEDULE_MIN_LEAD_MS) {
    return "Pick a time at least 2 hours from now.";
  }
  return null;
}

function validateDecline(body: CompanionDeclineInquiryRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  const validCategories: CompanionDeclineReasonCategory[] = ["schedule", "privacy", "safety", "other"];
  if (!validCategories.includes(body?.reasonCategory)) {
    errors.reasonCategory = "Pick a reason category.";
  }
  if (body?.notes != null && body.notes.length > 280) {
    errors.notes = "Notes must be 280 characters or fewer.";
  }
  return errors;
}

// H2.T5 (2026-05-27) — labelForDeclineReason moved to booking-store.ts so
// the projector and email builder share a single source of truth. Imported
// at the top of this file.

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

// H5.T1 (2026-05-27) — Validate companion-supplied day-of details.
// All three fields are individually optional; only enforce caps + types.
// Per-note errors use dotted paths (dayOfNotes.N) so the UI can map them
// back to individual list items.
function validateDayOfDetails(body: SetDayOfDetailsRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  if (body?.meetingPoint != null && body.meetingPoint.length > 280) {
    errors.meetingPoint = "Meeting point must be 280 characters or fewer.";
  }
  if (body?.contactNumber != null && body.contactNumber.length > 40) {
    errors.contactNumber = "Contact number must be 40 characters or fewer.";
  }
  if (body?.dayOfNotes != null) {
    if (!Array.isArray(body.dayOfNotes)) {
      errors.dayOfNotes = "Day-of notes must be a list of strings.";
    } else if (body.dayOfNotes.length > 5) {
      errors.dayOfNotes = "Day-of notes max 5 items.";
    } else {
      body.dayOfNotes.forEach((note, idx) => {
        if (typeof note !== "string") {
          errors[`dayOfNotes.${idx}`] = "Each note must be a string.";
        } else if (note.length > 200) {
          errors[`dayOfNotes.${idx}`] = "Each note must be 200 characters or fewer.";
        }
      });
    }
  }
  return errors;
}

// H6.T3 (2026-05-27) — Validate the traveller's review submission.
// Score must be an integer 1-5; comment is trimmed and must be 20-500
// characters. Errors use the same `{field: message}` shape as other
// validators so the UI can map them inline. submitReview expects the
// caller to have validated both fields, so this MUST run before the
// store call to avoid an orphan reviews-list write on bad input.
function validateReview(body: ReviewRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  const score = body?.score;
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    errors.score = "Pick a score between 1 and 5.";
  }
  const comment = (body?.comment ?? "").trim();
  if (comment.length < 20) {
    errors.comment = "Share at least 20 characters about the session.";
  } else if (comment.length > 500) {
    errors.comment = "Keep the comment under 500 characters.";
  }
  return errors;
}

// Pass I (2026-05-27) — Per-message chat validator. Trim before length
// check so a whitespace-only payload is rejected as empty (matches the
// server-side trim that sendMessage's caller applies). Upper bound of
// 2000 characters mirrors the contracts.ts ChatMessage doc and the
// CHAT_HISTORY_LIMIT slot size we budget per booking thread.
function validateChatMessage(body: SendMessageRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  const content = (body?.content ?? "").trim();
  if (content.length === 0) {
    errors.content = "Message can't be empty.";
  } else if (content.length > 2000) {
    errors.content = "Keep messages under 2000 characters.";
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

function toInquirySummary(inquiry: TravellerInquiryDetail) {
  const { message: _message, timeline: _timeline, paymentState: _paymentState, privacyNote: _privacyNote, ...summary } = inquiry;
  return summary;
}

// Pass I.T8 (2026-05-28) — Enrich each inquiry summary in a list with
// `unreadMessageCount` (other-party messages since this viewer's
// lastReadAt). Only computes when status is in MATCHED_STATUSES — at
// other statuses the chat thread is locked, so the field stays
// undefined and no KV reads happen. Costs 2 KV reads per matched
// booking; v1 lists are single-digit so the budget is fine. Mutates
// the summary objects in place.
//
// `viewerEmail` and `viewerRole` come from the calling handler's
// authenticated session. `kv` is optional so this is a no-op when the
// BOOKING_DATA binding is unbound (matches the rest of the worker's
// fixture-fallback story).
async function enrichSummariesWithUnreadCounts<
  T extends { id: string; status: InquiryStatus; unreadMessageCount?: number },
>(
  summaries: T[],
  kv: KVNamespace | undefined,
  viewerEmail: string,
  viewerRole: ChatAuthorRole,
): Promise<T[]> {
  if (!kv) return summaries;
  await Promise.all(
    summaries.map(async (summary) => {
      if (!MATCHED_STATUSES.includes(summary.status)) return;
      const [messages, lastReadAt] = await Promise.all([
        readMessages(kv, summary.id),
        readLastReadAt(kv, summary.id, viewerEmail),
      ]);
      summary.unreadMessageCount = computeUnreadCount(messages, lastReadAt, viewerRole);
    }),
  );
  return summaries;
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
