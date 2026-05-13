import type {
  AuthStartRequest,
  AuthStartResponse,
  AuthVerifyRequest,
  AuthVerifyResponse,
  RoleSwitchRequest,
  Session,
  SessionState,
  UserRole,
} from "../../shared/contracts";

export type { Session, UserRole };

type ApiEnvelope<T> = {
  data: T;
  requestId: string;
};

type ApiFailure = {
  code?: string;
  message?: string;
  requestId?: string;
};

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
    const message = "message" in payload && payload.message ? payload.message : "Request failed.";
    throw new Error(message);
  }

  if (!("data" in payload)) {
    throw new Error("Malformed API response.");
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

export class SessionService {
  static async requestLogin(payload: AuthStartRequest): Promise<AuthStartResponse> {
    return apiRequest<AuthStartResponse>("/api/auth/start", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  static async verifyCode(payload: AuthVerifyRequest): Promise<AuthVerifyResponse> {
    return apiRequest<AuthVerifyResponse>("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  static async getSession(): Promise<Session | null> {
    const state = await apiRequest<SessionState>("/api/session");
    return state.session;
  }

  static async switchRole(role: RoleSwitchRequest["role"]): Promise<AuthVerifyResponse> {
    return apiRequest<AuthVerifyResponse>("/api/session/role", {
      method: "POST",
      body: JSON.stringify({ role }),
    });
  }

  static async logout(): Promise<void> {
    await apiRequest<{ status: "signed_out" }>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
    });
  }
}
