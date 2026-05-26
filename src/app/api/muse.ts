import type {
  ApiEnvelope,
  MuseAdoptRequest,
  MuseAdoptResponse,
  MuseChatRequest,
  MuseChatResponse,
  MuseTranscriptSnapshot,
} from "../../shared/contracts";

type ApiFailure = {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export class MuseApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, code?: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "MuseApiError";
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
      ...init.headers,
    },
  });

  const payload = await readJson<ApiEnvelope<T> | ApiFailure>(response);
  if (!response.ok) {
    const failure = payload as ApiFailure;
    throw new MuseApiError(failure.message || "Muse could not respond.", response.status, failure.code, failure.fieldErrors);
  }

  if (!("data" in payload)) {
    throw new MuseApiError("Malformed Muse response.", response.status);
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

export const MUSE_TRANSCRIPT_STORAGE_PREFIX = "museTranscript:";

export function museTranscriptStorageKey(conversationId: string): string {
  return `${MUSE_TRANSCRIPT_STORAGE_PREFIX}${conversationId}`;
}

export const MuseService = {
  chat(payload: MuseChatRequest): Promise<MuseChatResponse> {
    return apiRequest<MuseChatResponse>("/api/muse/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Adopt a pre-auth Muse transcript into the signed-in user's account.
   * Requires a live session cookie + X-Tirak-CSRF header (guardApiMutation
   * enforces both on the worker side).
   */
  adopt(snapshot: MuseTranscriptSnapshot, csrfToken: string): Promise<MuseAdoptResponse> {
    const payload: MuseAdoptRequest = { snapshot };
    return apiRequest<MuseAdoptResponse>("/api/muse/conversations/adopt", {
      method: "POST",
      headers: { "X-Tirak-CSRF": csrfToken },
      body: JSON.stringify(payload),
    });
  },
};
