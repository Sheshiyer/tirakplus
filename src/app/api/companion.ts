import type {
  CompanionAvailabilityUpdateRequest,
  CompanionDashboardResponse,
  CompanionInquiryListResponse,
  CompanionOnboardingState,
  CompanionProfileUpdateRequest,
  CompanionProfileUpdateResponse,
  CompanionSessionDetail,
  CompanionVerificationSubmitRequest,
  CompanionVerificationSubmitResponse,
  CompanionVisibilityUpdateRequest,
} from "../../shared/contracts";
import { csrfHeaders } from "./csrf";

type ApiEnvelope<T> = {
  data: T;
  requestId: string;
};

type ApiFailure = {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export class CompanionApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, code?: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "CompanionApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

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
    throw new CompanionApiError(
      failure.message || "Request failed.",
      response.status,
      failure.code,
      failure.fieldErrors,
    );
  }

  if (!("data" in payload)) {
    throw new CompanionApiError("Malformed API response.", response.status);
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

export const CompanionService = {
  getOnboarding(): Promise<CompanionOnboardingState> {
    return apiRequest<CompanionOnboardingState>("/api/companion/onboarding");
  },

  getDashboard(): Promise<CompanionDashboardResponse> {
    return apiRequest<CompanionDashboardResponse>("/api/companion/dashboard");
  },

  getInquiries(): Promise<CompanionInquiryListResponse> {
    return apiRequest<CompanionInquiryListResponse>("/api/companion/inquiries");
  },

  getInquiry(inquiryId: string): Promise<CompanionSessionDetail> {
    return apiRequest<CompanionSessionDetail>(`/api/companion/inquiries/${encodeURIComponent(inquiryId)}`);
  },

  updateProfile(payload: CompanionProfileUpdateRequest): Promise<CompanionProfileUpdateResponse> {
    return apiRequest<CompanionProfileUpdateResponse>("/api/companion/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  updateVisibility(payload: CompanionVisibilityUpdateRequest): Promise<CompanionProfileUpdateResponse> {
    return apiRequest<CompanionProfileUpdateResponse>("/api/companion/visibility", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  updateAvailability(payload: CompanionAvailabilityUpdateRequest): Promise<CompanionProfileUpdateResponse> {
    return apiRequest<CompanionProfileUpdateResponse>("/api/companion/availability", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  submitVerification(payload: CompanionVerificationSubmitRequest): Promise<CompanionVerificationSubmitResponse> {
    return apiRequest<CompanionVerificationSubmitResponse>("/api/companion/submit-verification", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
