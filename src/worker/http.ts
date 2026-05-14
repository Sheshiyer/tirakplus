type ApiResponseInit = ResponseInit & {
  requestId?: string;
};

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
        "Cache-Control": "no-store",
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
        "Cache-Control": "no-store",
        "X-Request-Id": requestId,
        ...headers,
      },
    },
  );
}
