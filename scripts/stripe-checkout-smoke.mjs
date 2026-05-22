const baseUrl = process.env.API_BASE_URL || "http://127.0.0.1:8787";
const expectCheckout = process.env.EXPECT_STRIPE_CHECKOUT === "1";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.cookie ? { Cookie: options.cookie } : {}),
      ...(options.headers || {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

await request("/api/auth/start", {
  method: "POST",
  body: { email: "stripe-smoke@example.com" },
});

const auth = await request("/api/auth/verify", {
  method: "POST",
  body: { email: "stripe-smoke@example.com", code: "123456", role: "traveller" },
});

assert(auth.response.ok, `auth failed: ${auth.response.status}`);
const cookie = auth.response.headers.get("set-cookie")?.split(";")[0];
const csrf = auth.payload.data?.csrfToken || auth.payload.data?.session?.csrfToken;
assert(cookie, "missing auth cookie");
assert(csrf, "missing csrf token");

const checkout = await request("/api/traveller/inquiries/inq-staged-aura/payment-session", {
  method: "POST",
  cookie,
  headers: { "X-Tirak-CSRF": csrf },
  body: {},
});

if (expectCheckout) {
  assert(checkout.response.status === 201, `expected checkout creation, got ${checkout.response.status}`);
  assert(checkout.payload.data?.status === "created", "expected created payment session");
  assert(
    typeof checkout.payload.data?.checkoutUrl === "string" &&
      checkout.payload.data.checkoutUrl.startsWith("https://checkout.stripe.com/"),
    "expected Stripe Checkout URL",
  );
} else {
  assert(checkout.response.status === 200, `expected blocked payment result envelope, got ${checkout.response.status}`);
  assert(checkout.payload.data?.status === "blocked", "expected blocked payment session");
  assert(typeof checkout.payload.data?.code === "string", "expected payment blocked code");
}

console.log(
  JSON.stringify(
    {
      baseUrl,
      mode: expectCheckout ? "stripe_checkout_expected" : "blocked_or_unconfigured_expected",
      status: checkout.response.status,
      code: checkout.payload.code || checkout.payload.data?.code,
      checkoutStatus: checkout.payload.data?.status,
    },
    null,
    2,
  ),
);
