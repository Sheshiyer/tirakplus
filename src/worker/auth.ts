import type {
  AuthStartRequest,
  AuthStartResponse,
  AuthVerifyRequest,
  AuthVerifyResponse,
  RoleSwitchRequest,
  Session,
  SessionState,
  UserRole,
} from "../shared/contracts";
import { apiError, json } from "./http";

const SESSION_COOKIE = "tirak_staged_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

type JsonRecord = Record<string, unknown>;

export async function routeAuth(request: Request, pathname: string, requestId?: string): Promise<Response | null> {
  if (request.method === "GET" && pathname === "/api/session") {
    const session = readSessionCookie(request);
    return json<SessionState>({
      session,
      status: session ? "active" : "anonymous",
      protectedRoutesEnabled: true,
    }, { requestId });
  }

  if (request.method === "POST" && pathname === "/api/auth/start") {
    const body = await readJsonBody<AuthStartRequest>(request, requestId);
    if (body instanceof Response) return body;

    if (!isEmail(body.email)) {
      return apiError(422, "EMAIL_REQUIRED", "Enter a valid email address.", undefined, { requestId });
    }

    return json<AuthStartResponse>(
      {
        email: body.email.trim().toLowerCase(),
        status: "verification_pending",
        delivery: "email",
        nextStep: "verify_code",
      },
      { status: 202, requestId },
    );
  }

  if (request.method === "POST" && pathname === "/api/auth/verify") {
    const body = await readJsonBody<AuthVerifyRequest>(request, requestId);
    if (body instanceof Response) return body;

    if (!isEmail(body.email)) {
      return apiError(422, "EMAIL_REQUIRED", "Enter a valid email address.", undefined, { requestId });
    }

    if (typeof body.code !== "string" || !/^\d{6}$/.test(body.code)) {
      return apiError(422, "INVALID_CODE", "Enter the six digit verification code.", undefined, { requestId });
    }

    const session = createSession(body.email, normalizeCustomerRole(body.role));
    return json<AuthVerifyResponse>(
      { session },
      {
        requestId,
        headers: {
          "Set-Cookie": buildSessionCookie(request, session),
        },
      },
    );
  }

  if (request.method === "POST" && pathname === "/api/session/role") {
    const session = readSessionCookie(request);
    if (!session) {
      return apiError(401, "SESSION_REQUIRED", "Sign in before changing account context.", undefined, { requestId });
    }

    const body = await readJsonBody<RoleSwitchRequest>(request, requestId);
    if (body instanceof Response) return body;

    const nextRole = normalizeCustomerRole(body.role);
    const nextSession: Session = {
      ...session,
      profile: {
        ...session.profile,
        role: nextRole,
      },
    };

    return json<AuthVerifyResponse>(
      { session: nextSession },
      {
        requestId,
        headers: {
          "Set-Cookie": buildSessionCookie(request, nextSession),
        },
      },
    );
  }

  if (request.method === "POST" && pathname === "/api/auth/logout") {
    return json(
      { status: "signed_out" },
      {
        requestId,
        headers: {
          "Set-Cookie": clearSessionCookie(request),
        },
      },
    );
  }

  return null;
}

async function readJsonBody<T>(request: Request, requestId?: string): Promise<T | Response> {
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    return apiError(400, "INVALID_JSON", "Request body must be valid JSON.", undefined, { requestId });
  }

  if (!isRecord(value)) {
    return apiError(400, "INVALID_BODY", "Request body must be a JSON object.", undefined, { requestId });
  }

  return value as T;
}

function createSession(email: string, role: Extract<UserRole, "traveller" | "companion">): Session {
  const normalizedEmail = email.trim().toLowerCase();
  return {
    id: `sess_${crypto.randomUUID()}`,
    profile: {
      id: `usr_${crypto.randomUUID()}`,
      email: normalizedEmail,
      role,
    },
    expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString(),
  };
}

function normalizeCustomerRole(role: unknown): Extract<UserRole, "traveller" | "companion"> {
  return role === "companion" ? "companion" : "traveller";
}

function isEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readSessionCookie(request: Request): Session | null {
  const encoded = getCookie(request, SESSION_COOKIE);
  if (!encoded) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(encoded)) as unknown;
    if (!isSession(parsed)) return null;
    if (Date.parse(parsed.expiresAt) <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: Request): Session | null {
  return readSessionCookie(request);
}

function isSession(value: unknown): value is Session {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || typeof value.expiresAt !== "string") return false;
  if (!isRecord(value.profile)) return false;
  return (
    typeof value.profile.id === "string" &&
    typeof value.profile.email === "string" &&
    (value.profile.role === "traveller" || value.profile.role === "companion")
  );
}

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const pair = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return pair ? pair.slice(name.length + 1) : null;
}

function buildSessionCookie(request: Request, session: Session): string {
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(JSON.stringify(session))}`,
    "Path=/",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    "HttpOnly",
    "SameSite=Lax",
    secureAttribute(request),
  ]
    .filter(Boolean)
    .join("; ");
}

function clearSessionCookie(request: Request): string {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
    secureAttribute(request),
  ]
    .filter(Boolean)
    .join("; ");
}

function secureAttribute(request: Request): string {
  return new URL(request.url).protocol === "https:" ? "Secure" : "";
}
