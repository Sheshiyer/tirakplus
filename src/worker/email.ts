/**
 * email.ts — Cloudflare Email Sending integration for Tirak Plus auth.
 *
 * Uses the `env.EMAIL` send_email binding (declared in wrangler.jsonc)
 * to send transactional OTP codes. The binding is documented at
 *   https://developers.cloudflare.com/email-service/send/
 *
 * Local-dev behavior: `wrangler dev --local` does NOT bind to a real
 * email sender, and the user's tirak.app zone needs Email Sending
 * activated in the Dashboard before the first production send works.
 * In both cases we log the OTP to the worker console so the dev flow
 * remains testable end-to-end without leaking real email infra.
 */

// SendEmail + KVNamespace types are declared globally by the generated
// worker-configuration.d.ts — no import needed.
type EmailEnv = {
  EMAIL?: SendEmail;
  AUTH_OTPS?: KVNamespace;
  ENVIRONMENT?: string;
};

/** From-address used for all auth emails. Must be on a tirak.app zone
 *  that has Email Sending enabled. */
const AUTH_FROM = { email: "muse@tirak.app", name: "Muse · Tirak Plus" };

const OTP_TTL_SECONDS = 600; // 10 minutes
const OTP_MAX_ATTEMPTS = 6;

export type StoredOtp = {
  code: string;
  issuedAt: string;
  attempts: number;
  role?: "traveller" | "companion";
};

export function generateOtpCode(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  // 4 bytes → up to 4_294_967_295; mod 1_000_000 + pad to 6 digits.
  const n =
    ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  return String(n % 1_000_000).padStart(6, "0");
}

export function otpKey(email: string): string {
  return `otp:${email.trim().toLowerCase()}`;
}

export async function storeOtp(
  env: EmailEnv,
  email: string,
  code: string,
  role?: "traveller" | "companion",
): Promise<void> {
  if (!env.AUTH_OTPS) {
    console.warn("AUTH_OTPS KV binding missing — OTP not stored, verify will reject all codes");
    return;
  }
  const record: StoredOtp = {
    code,
    issuedAt: new Date().toISOString(),
    attempts: 0,
    ...(role ? { role } : {}),
  };
  await env.AUTH_OTPS.put(otpKey(email), JSON.stringify(record), {
    expirationTtl: OTP_TTL_SECONDS,
  });
}

/** Returns the stored OTP record or null if missing/expired. Increments
 *  attempts counter on every read — caller must check it and refuse
 *  verification past OTP_MAX_ATTEMPTS to prevent brute-forcing. */
export async function readAndCountOtp(env: EmailEnv, email: string): Promise<StoredOtp | null> {
  if (!env.AUTH_OTPS) return null;
  const key = otpKey(email);
  const raw = await env.AUTH_OTPS.get(key);
  if (!raw) return null;
  let parsed: StoredOtp;
  try {
    parsed = JSON.parse(raw) as StoredOtp;
  } catch {
    return null;
  }
  parsed.attempts = (parsed.attempts ?? 0) + 1;
  if (parsed.attempts > OTP_MAX_ATTEMPTS) {
    // Too many tries — burn the OTP entirely.
    await env.AUTH_OTPS.delete(key);
    return null;
  }
  // Re-PUT with bumped attempts (preserve remaining TTL roughly via
  // shorter TTL — we don't know the exact remaining, so 600s ceiling
  // is fine; the issuedAt prevents stale records).
  await env.AUTH_OTPS.put(key, JSON.stringify(parsed), {
    expirationTtl: OTP_TTL_SECONDS,
  });
  return parsed;
}

export async function consumeOtp(env: EmailEnv, email: string): Promise<void> {
  if (!env.AUTH_OTPS) return;
  await env.AUTH_OTPS.delete(otpKey(email));
}

/**
 * Send the OTP email. Returns the delivery channel used so callers can
 * log meaningfully ("email" in prod, "console" in dev).
 *
 * The Cloudflare Email Sending binding requires the `from` domain to
 * be activated. Until that's done, env.EMAIL.send() will throw and we
 * fall back to logging the code to the worker console so local + early
 * prod testing still works end-to-end.
 */
export async function sendOtpEmail(
  env: EmailEnv,
  email: string,
  code: string,
): Promise<"email" | "console"> {
  const subject = "Your Tirak Plus sign-in code";
  const text =
    `Your Tirak Plus sign-in code is ${code}.\n\n` +
    `It expires in 10 minutes. If you didn't request this, you can\n` +
    `ignore this email — your account stays private.`;
  const html =
    `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:32px auto;padding:0 16px;color:#1a1a1a;">` +
    `<p style="font-size:14px;letter-spacing:0.12em;text-transform:uppercase;color:#7a6a5d;margin:0 0 8px;">Tirak Plus</p>` +
    `<h1 style="font-size:22px;font-weight:600;margin:0 0 16px;">Confirm your sign-in</h1>` +
    `<p style="font-size:15px;line-height:1.55;margin:0 0 24px;">Use this 6-digit code to finish signing in. It expires in 10 minutes.</p>` +
    `<p style="font-size:34px;letter-spacing:0.42em;font-weight:600;margin:0 0 28px;padding:18px 22px;background:#f4ede4;border-radius:14px;text-align:center;">${code}</p>` +
    `<p style="font-size:13px;line-height:1.5;color:#7a6a5d;margin:0;">If you didn't ask to sign in, you can ignore this email. Your account stays private and no one can access it without the code above.</p>` +
    `</body></html>`;

  // Dev convenience: ALWAYS log the OTP when not in production so the
  // local + staging flow is testable without digging through miniflare's
  // temp email files. In production (env.ENVIRONMENT === "production")
  // this log is suppressed so OTPs never appear in shipped worker logs.
  const isProd = env.ENVIRONMENT === "production";
  if (!isProd) {
    console.log(`[email/dev] OTP for ${email}: ${code}`);
  }

  if (!env.EMAIL) {
    return "console";
  }

  try {
    await env.EMAIL.send({
      to: email,
      from: AUTH_FROM,
      subject,
      html,
      text,
    });
    return "email";
  } catch (caught) {
    // Common in pre-activation state: zone hasn't been onboarded for
    // Email Sending yet. The OTP was already logged above (if non-prod);
    // user reads it from the worker output. In production the user has
    // to wait for the dashboard activation to land before the first
    // real send succeeds.
    console.warn(
      `[email/fallback] env.EMAIL.send failed (${caught instanceof Error ? caught.message : "unknown"})`,
    );
    return "console";
  }
}
