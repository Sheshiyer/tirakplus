// booking.ts — Client class for Pass H Inquiry creation + listing.
//
// Mirrors the AccountService pattern (apiRequest envelope, typed error
// surface) so booking pages can use it the same way other pages use
// AccountService / CompanionService. Consolidates the traveller- and
// companion-side inquiry endpoints behind a single BookingService.

import type {
  ChatThreadResponse,
  CompanionDeclineInquiryRequest,
  CompanionInquiryDecisionResponse,
  CompanionInquiryListResponse,
  CompanionReviewsResponse,
  CompanionSessionDetail,
  DayOfDetailsResponse,
  MarkThreadReadResponse,
  PlanTravellerResponse,
  ReviewRequest,
  ReviewSubmissionResponse,
  SendMessageRequest,
  SendMessageResponse,
  SetDayOfDetailsRequest,
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

  /** Companion accepts a routed inquiry. Empty body — id is the URL param. */
  acceptInquiry(id: string): Promise<CompanionInquiryDecisionResponse> {
    return apiRequest<CompanionInquiryDecisionResponse>(
      `/api/companion/inquiries/${encodeURIComponent(id)}/accept`,
      { method: "POST", body: JSON.stringify({}) },
    );
  },

  /** Companion declines a routed inquiry. Requires a reason category; notes optional. */
  declineInquiry(id: string, payload: CompanionDeclineInquiryRequest): Promise<CompanionInquiryDecisionResponse> {
    return apiRequest<CompanionInquiryDecisionResponse>(
      `/api/companion/inquiries/${encodeURIComponent(id)}/decline`,
      { method: "POST", body: JSON.stringify(payload) },
    );
  },

  /**
   * Place a payment hold on a confirmed plan. H4-stub: server transitions
   * date_confirmed → payment_held → session_scheduled (non-prod auto-
   * advance) with no real Stripe call yet. Future H4-real will require a
   * PaymentHoldRequest body with a Stripe checkout session token.
   */
  holdBooking(inquiryId: string): Promise<PlanTravellerResponse> {
    return apiRequest<PlanTravellerResponse>(
      `/api/plans/${encodeURIComponent(inquiryId)}/hold`,
      { method: "POST", body: JSON.stringify({}) },
    );
  },

  /**
   * Companion sets day-of details on a confirmed plan (meeting point,
   * contact number, optional notes). Metadata-only; no status change.
   * Editable from date_confirmed through session_completed.
   */
  setDayOfDetails(inquiryId: string, payload: SetDayOfDetailsRequest): Promise<DayOfDetailsResponse> {
    return apiRequest<DayOfDetailsResponse>(
      `/api/plans/${encodeURIComponent(inquiryId)}/day-of-details`,
      { method: "POST", body: JSON.stringify(payload) },
    );
  },

  /**
   * Traveller submits a 1-5 score + 20-500 char comment after the session
   * transitions to review_pending. Reviews are immutable in v1 — the
   * server returns 409 if you try to submit a second one on the same
   * inquiry.
   */
  submitReview(inquiryId: string, payload: ReviewRequest): Promise<ReviewSubmissionResponse> {
    return apiRequest<ReviewSubmissionResponse>(
      `/api/plans/${encodeURIComponent(inquiryId)}/review`,
      { method: "POST", body: JSON.stringify(payload) },
    );
  },

  /**
   * Public companion reviews + aggregate rating. No auth required — used
   * by traveller browsing companion profiles. Returns empty arrays for
   * brand-new companions.
   */
  getCompanionReviews(companionId: string): Promise<CompanionReviewsResponse> {
    return apiRequest<CompanionReviewsResponse>(
      `/api/companions/${encodeURIComponent(companionId)}/reviews`,
    );
  },

  /**
   * Pass I — send a chat message on a booking thread. Either party may
   * post once the booking is past `accepted`. Server trims + validates
   * content (1-2000 chars) and stamps authorRole/authorLabel from the
   * caller's session — clients never set those.
   */
  sendMessage(inquiryId: string, payload: SendMessageRequest): Promise<SendMessageResponse> {
    return apiRequest<SendMessageResponse>(
      `/api/plans/${encodeURIComponent(inquiryId)}/messages`,
      { method: "POST", body: JSON.stringify(payload) },
    );
  },

  /**
   * Pass I — fetch the full booking thread (capped 200 messages, oldest
   * first) plus the caller's lastReadAt + server-computed unreadCount
   * (messages from the OTHER party after lastReadAt). Polled at 3-5s
   * cadence by the chat view.
   */
  getMessages(inquiryId: string): Promise<ChatThreadResponse> {
    return apiRequest<ChatThreadResponse>(
      `/api/plans/${encodeURIComponent(inquiryId)}/messages`,
    );
  },

  /**
   * Pass I — mark the booking thread as read for the current user.
   * Server sets lastReadAt to now and returns unreadCount: 0. Empty
   * body — reserved for future "read up to message id" extension.
   */
  markThreadRead(inquiryId: string): Promise<MarkThreadReadResponse> {
    return apiRequest<MarkThreadReadResponse>(
      `/api/plans/${encodeURIComponent(inquiryId)}/messages/read`,
      { method: "POST", body: JSON.stringify({}) },
    );
  },
};
