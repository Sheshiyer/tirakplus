import { json, apiError } from "./http";
import {
  cities,
  companionProfiles,
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
  CitySlug,
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

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return routeApi(request);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
