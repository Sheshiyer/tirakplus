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
import { consumeOtp, generateOtpCode, readAndCountOtp, sendOtpEmail, storeOtp } from "./email.js";
import { apiError, json } from "./http.js";
import { checkRateLimit } from "./rate-limit.js";

const SESSION_COOKIE = "tirak_staged_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
const CSRF_HEADER = "X-Tirak-CSRF";

type JsonRecord = Record<string, unknown>;

type AuthEnv = {
  AUTH_OTPS?: KVNamespace;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  ENVIRONMENT?: string;
};

export async function routeAuth(request: Request, pathname: string, requestId?: string, env?: AuthEnv): Promise<Response | null> {
  if (request.method === "GET" && pathname === "/api/session") {
    const session = readSessionCookie(request);
    return json<SessionState>({
      session,
      status: session ? "active" : "anonymous",
      protectedRoutesEnabled: true,
      csrfToken: session?.csrfToken ?? null,
    }, { requestId });
  }

  if (request.method === "POST" && pathname === "/api/auth/start") {
    const limited = rateLimitAuth(request, requestId);
    if (limited) return limited;

    const body = await readJsonBody<AuthStartRequest>(request, requestId);
    if (body instanceof Response) return body;

    if (!isEmail(body.email)) {
      return apiError(422, "EMAIL_REQUIRED", "Enter a valid email address.", undefined, { requestId });
    }

    const normalizedEmail = body.email.trim().toLowerCase();

    if (env) {
      // Generate, store, and send. If env.EMAIL is unavailable or the
      // send fails, sendOtpEmail logs to console and we still return
      // success so the UX can proceed (the user reads the code from the
      // dev console). In production this happens silently to the user;
      // the worker log + observability show the fallback.
      const code = generateOtpCode();
      await storeOtp(env, normalizedEmail, code);
      const channel = await sendOtpEmail(env, normalizedEmail, code);
      console.log(`[auth/start] email=${normalizedEmail} channel=${channel}`);
    } else {
      console.warn(`[auth/start] env not provided — OTP generation skipped for ${normalizedEmail}`);
    }

    return json<AuthStartResponse>(
      {
        email: normalizedEmail,
        status: "verification_pending",
        delivery: "email",
        nextStep: "verify_code",
      },
      { status: 202, requestId },
    );
  }

  if (request.method === "POST" && pathname === "/api/auth/verify") {
    const limited = rateLimitAuth(request, requestId);
    if (limited) return limited;

    const body = await readJsonBody<AuthVerifyRequest>(request, requestId);
    if (body instanceof Response) return body;

    if (!isEmail(body.email)) {
      return apiError(422, "EMAIL_REQUIRED", "Enter a valid email address.", undefined, { requestId });
    }

    if (typeof body.code !== "string" || !/^\d{6}$/.test(body.code)) {
      return apiError(422, "INVALID_CODE", "Enter the six digit verification code.", undefined, { requestId });
    }

    const normalizedEmail = body.email.trim().toLowerCase();

    if (env?.AUTH_OTPS) {
      const stored = await readAndCountOtp(env, normalizedEmail);
      if (!stored) {
        return apiError(
          401,
          "OTP_EXPIRED",
          "That code expired or was tried too many times. Request a new one.",
          undefined,
          { requestId },
        );
      }
      if (stored.code !== body.code) {
        return apiError(
          401,
          "OTP_MISMATCH",
          "That code does not match. Check the email and try again.",
          undefined,
          { requestId },
        );
      }
      // Burn the OTP on success — single-use.
      await consumeOtp(env, normalizedEmail);
    } else {
      // No KV binding (legacy / test mode) — fall through to staged
      // behavior where any 6-digit code passes. This preserves the
      // current dev experience until the binding is wired everywhere.
      console.warn(`[auth/verify] AUTH_OTPS KV missing — accepting any 6-digit code (staged mode)`);
    }

    const session = createSession(normalizedEmail, normalizeCustomerRole(body.role));
    return json<AuthVerifyResponse>(
      { session, csrfToken: session.csrfToken },
      {
        requestId,
        headers: {
          "Set-Cookie": buildSessionCookie(request, session),
        },
      },
    );
  }

  if (request.method === "POST" && pathname === "/api/session/role") {
    const csrfError = requireCsrf(request, requestId);
    if (csrfError) return csrfError;

    const session = readSessionCookie(request);
    if (!session) {
      return apiError(401, "SESSION_REQUIRED", "Sign in before changing account context.", undefined, { requestId });
    }

    const body = await readJsonBody<RoleSwitchRequest>(request, requestId);
    if (body instanceof Response) return body;

    const nextRole = normalizeCustomerRole(body.role);
    const nextSession: Session = {
      ...session,
      csrfToken: session.csrfToken ?? createCsrfToken(),
      profile: {
        ...session.profile,
        role: nextRole,
      },
    };

    return json<AuthVerifyResponse>(
      { session: nextSession, csrfToken: nextSession.csrfToken },
      {
        requestId,
        headers: {
          "Set-Cookie": buildSessionCookie(request, nextSession),
        },
      },
    );
  }

  if (request.method === "POST" && pathname === "/api/auth/logout") {
    const csrfError = requireCsrf(request, requestId);
    if (csrfError) return csrfError;

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

function rateLimitAuth(request: Request, requestId?: string): Response | null {
  const result = checkRateLimit(request, "auth");
  if (result.allowed) return null;
  return apiError(
    429,
    "RATE_LIMITED",
    "Too many auth attempts. Wait a moment before trying again.",
    undefined,
    {
      requestId,
      headers: { "Retry-After": String(result.retryAfterSeconds) },
    },
  );
}

function requireCsrf(request: Request, requestId?: string): Response | null {
  const result = verifyCsrfToken(request);
  if (result === "ok") return null;
  return apiError(
    result === "missing_session" ? 401 : 403,
    result === "missing_session" ? "SESSION_REQUIRED" : "CSRF_TOKEN_REQUIRED",
    result === "missing_session"
      ? "Sign in before changing account context."
      : "Refresh the page and try again.",
    undefined,
    { requestId },
  );
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
    csrfToken: createCsrfToken(),
  };
}

function createCsrfToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
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

export function verifyCsrfToken(request: Request): "ok" | "missing_session" | "invalid_token" {
  const session = readSessionCookie(request);
  if (!session) return "missing_session";
  const provided = request.headers.get(CSRF_HEADER);
  if (!session.csrfToken || !provided || provided !== session.csrfToken) return "invalid_token";
  return "ok";
}

function isSession(value: unknown): value is Session {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || typeof value.expiresAt !== "string") return false;
  if (value.csrfToken !== undefined && typeof value.csrfToken !== "string") return false;
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
