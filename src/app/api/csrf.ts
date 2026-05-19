let csrfToken: string | null = null;

export function setCsrfToken(nextToken: string | null | undefined): void {
  csrfToken = nextToken ?? null;
}

export function csrfHeaders(init?: HeadersInit): HeadersInit {
  return {
    ...(init ?? {}),
    ...(csrfToken ? { "X-Tirak-CSRF": csrfToken } : {}),
  };
}
