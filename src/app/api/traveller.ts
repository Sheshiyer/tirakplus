import type {
  CitySlug,
  CompanionProfile,
  DiscoveryFilterSelection,
  DiscoveryResponse,
  ExperienceSlug,
  TravellerInquiryCreateResponse,
  TravellerInquiryDetail,
  TravellerInquiryListResponse,
  TravellerInquiryRequest,
  TravellerDashboardResponse,
  TravellerSessionDetail,
  TravellerSessionListResponse,
} from "../../shared/contracts";
import { csrfHeaders } from "./csrf";

type ApiEnvelope<T> = {
  data: T;
  requestId: string;
};

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, code?: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

type ApiFailure = {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export type DiscoveryQuery = Partial<DiscoveryFilterSelection>;

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders(init.headers),
    },
  });

  const payload = await readJson<ApiEnvelope<T> | ApiFailure>(response);
  if (!response.ok) {
    const failure = payload as ApiFailure;
    throw new ApiRequestError(
      failure.message || "Request failed.",
      response.status,
      failure.code,
      failure.fieldErrors,
    );
  }

  if (!("data" in payload)) {
    throw new ApiRequestError("Malformed API response.", response.status);
  }

  return payload.data;
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

function buildDiscoveryQuery(filters: DiscoveryQuery): string {
  const params = new URLSearchParams();
  if (filters.city && filters.city !== "all") params.set("city", filters.city);
  if (filters.experience && filters.experience !== "all") params.set("experience", filters.experience);
  if (filters.availability && filters.availability !== "any") params.set("availability", filters.availability);
  if (filters.verified && filters.verified !== "approved") params.set("verified", filters.verified);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const TravellerService = {
  getDashboard(): Promise<TravellerDashboardResponse> {
    return apiRequest<TravellerDashboardResponse>("/api/traveller/dashboard");
  },

  getDiscovery(filters: DiscoveryQuery): Promise<DiscoveryResponse> {
    return apiRequest<DiscoveryResponse>(`/api/traveller/discovery${buildDiscoveryQuery(filters)}`);
  },

  getProfile(companionId: string): Promise<CompanionProfile> {
    return apiRequest<CompanionProfile>(`/api/traveller/companions/${encodeURIComponent(companionId)}`);
  },

  getInquiries(): Promise<TravellerInquiryListResponse> {
    return apiRequest<TravellerInquiryListResponse>("/api/traveller/inquiries");
  },

  getSessions(): Promise<TravellerSessionListResponse> {
    return apiRequest<TravellerSessionListResponse>("/api/traveller/sessions");
  },

  getSession(sessionId: string): Promise<TravellerSessionDetail> {
    return apiRequest<TravellerSessionDetail>(`/api/traveller/sessions/${encodeURIComponent(sessionId)}`);
  },

  getInquiry(inquiryId: string): Promise<TravellerInquiryDetail> {
    return apiRequest<TravellerInquiryDetail>(`/api/traveller/inquiries/${encodeURIComponent(inquiryId)}`);
  },

  createInquiry(payload: TravellerInquiryRequest): Promise<TravellerInquiryCreateResponse> {
    return apiRequest<TravellerInquiryCreateResponse>("/api/traveller/inquiries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export function isCitySlug(value: string | null): value is CitySlug {
  return value === "bangkok" || value === "phuket" || value === "koh-samui" || value === "koh-phangan";
}

export function isExperienceSlug(value: string | null): value is ExperienceSlug {
  return (
    value === "nightlife" ||
    value === "island-explorer" ||
    value === "muay-thai-night" ||
    value === "private-dining" ||
    value === "local-guidance"
  );
}
