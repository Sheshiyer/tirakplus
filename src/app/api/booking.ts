// booking.ts — Client class for Pass H Inquiry creation + listing.
//
// Mirrors the AccountService pattern (apiRequest envelope, typed error
// surface) so booking pages can use it the same way other pages use
// AccountService / CompanionService. Consolidates the traveller- and
// companion-side inquiry endpoints behind a single BookingService.

import type {
  CompanionInquiryListResponse,
  CompanionSessionDetail,
  TravellerInquiryCreateResponse,
  TravellerInquiryDetail,
  TravellerInquiryListResponse,
  TravellerInquiryRequest,
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

export class BookingApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, code?: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "BookingApiError";
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
    throw new BookingApiError(
      failure.message || "Request failed.",
      response.status,
      failure.code,
      failure.fieldErrors,
    );
  }

  if (!("data" in payload)) {
    throw new BookingApiError("Malformed API response.", response.status);
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

export const BookingService = {
  /** Create a new traveller-side inquiry against a companion. */
  createInquiry(payload: TravellerInquiryRequest): Promise<TravellerInquiryCreateResponse> {
    return apiRequest<TravellerInquiryCreateResponse>("/api/traveller/inquiries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** List all inquiries created by the current traveller. */
  listTravellerInquiries(): Promise<TravellerInquiryListResponse> {
    return apiRequest<TravellerInquiryListResponse>("/api/traveller/inquiries");
  },

  /** Fetch a single traveller-side inquiry by id. */
  getTravellerInquiry(id: string): Promise<TravellerInquiryDetail> {
    return apiRequest<TravellerInquiryDetail>(`/api/traveller/inquiries/${encodeURIComponent(id)}`);
  },

  /** List all inquiries received by the current companion. */
  listCompanionInquiries(): Promise<CompanionInquiryListResponse> {
    return apiRequest<CompanionInquiryListResponse>("/api/companion/inquiries");
  },

  /** Fetch a single companion-side inquiry / session by id. */
  getCompanionInquiry(id: string): Promise<CompanionSessionDetail> {
    return apiRequest<CompanionSessionDetail>(`/api/companion/inquiries/${encodeURIComponent(id)}`);
  },

  /** Cancel an existing traveller inquiry. Returns the now-cancelled inquiry envelope. */
  cancelInquiry(id: string): Promise<TravellerInquiryCreateResponse> {
    return apiRequest<TravellerInquiryCreateResponse>(`/api/traveller/inquiries/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
