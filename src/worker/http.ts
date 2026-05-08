export function json<T>(data: T, init: ResponseInit = {}): Response {
  const requestId = crypto.randomUUID();
  return Response.json(
    { data, requestId },
    {
      ...init,
      headers: {
        "Cache-Control": "no-store",
        ...init.headers,
      },
    },
  );
}

export function apiError(status: number, code: string, message: string): Response {
  return Response.json(
    {
      status,
      code,
      message,
      requestId: crypto.randomUUID(),
    },
    { status },
  );
}
