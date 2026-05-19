type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number; limit: number };

const buckets = new Map<string, Bucket>();

const policyByGroup = {
  auth: { limit: 24, windowMs: 60_000 },
  muse: { limit: 36, windowMs: 60_000 },
  mutation: { limit: 30, windowMs: 60_000 },
  report: { limit: 8, windowMs: 60_000 },
} as const;

export type RateLimitGroup = keyof typeof policyByGroup;

export function checkRateLimit(request: Request, group: RateLimitGroup): RateLimitResult {
  const policy = policyByGroup[group];
  const key = `${group}:${clientKey(request)}`;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + policy.windowMs });
    return { allowed: true };
  }

  if (existing.count >= policy.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      limit: policy.limit,
    };
  }

  existing.count += 1;
  return { allowed: true };
}

function clientKey(request: Request): string {
  const cfIp = request.headers.get("CF-Connecting-IP");
  const forwarded = request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim();
  const userAgent = request.headers.get("User-Agent") ?? "unknown-agent";
  return `${cfIp ?? forwarded ?? "local"}:${userAgent.slice(0, 80)}`;
}
