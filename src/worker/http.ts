type ApiResponseInit = ResponseInit & {
  requestId?: string;
};

export const SECURITY_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://api.fontshare.com",
    "img-src 'self' data: blob:",
    "font-src 'self' data: https://cdn.fontshare.com",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
} as const;

export const STATIC_SECURITY_HEADERS = {
  "Content-Security-Policy": SECURITY_HEADERS["Content-Security-Policy"],
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": SECURITY_HEADERS["Permissions-Policy"],
  "Referrer-Policy": SECURITY_HEADERS["Referrer-Policy"],
  "Strict-Transport-Security": SECURITY_HEADERS["Strict-Transport-Security"],
  "X-Content-Type-Options": SECURITY_HEADERS["X-Content-Type-Options"],
  "X-Frame-Options": SECURITY_HEADERS["X-Frame-Options"],
} as const;

export function createRequestId(request: Request): string {
  const incoming = request.headers.get("X-Request-Id");
  if (incoming && /^[A-Za-z0-9._:-]{8,96}$/.test(incoming)) {
    return incoming;
  }
  return crypto.randomUUID();
}

export function json<T>(data: T, init: ApiResponseInit = {}): Response {
  const { requestId = crypto.randomUUID(), headers, ...responseInit } = init;
  return Response.json(
    { data, requestId },
    {
      ...responseInit,
      headers: {
        ...SECURITY_HEADERS,
        "X-Request-Id": requestId,
        ...headers,
      },
    },
  );
}

export function apiError(
  status: number,
  code: string,
  message: string,
  fieldErrors?: Record<string, string>,
  init: ApiResponseInit = {},
): Response {
  const { requestId = crypto.randomUUID(), headers, ...responseInit } = init;
  return Response.json(
    {
      status,
      code,
      message,
      ...(fieldErrors ? { fieldErrors } : {}),
      requestId,
    },
    {
      ...responseInit,
      status,
      headers: {
        ...SECURITY_HEADERS,
        "X-Request-Id": requestId,
        ...headers,
      },
    },
  );
}
