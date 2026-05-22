const baseUrl = process.env.API_BASE_URL || "http://127.0.0.1:8787";

const results = [];

async function request(path, options = {}) {
  const requestId = options.requestId || `contract-${crypto.randomUUID()}`;
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": requestId,
      ...(options.cookie ? { Cookie: options.cookie } : {}),
      ...(options.headers || {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const payload = await response.json().catch(() => ({}));
  return { response, payload, requestId };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEnvelope(result, label) {
  assert(result.payload.requestId === result.requestId, `${label}: requestId was not propagated`);
  assert(result.response.headers.get("x-request-id") === result.requestId, `${label}: X-Request-Id header missing`);
}

async function expectOk(label, path, options = {}) {
  const result = await request(path, options);
  assert(result.response.ok, `${label}: expected ok, got ${result.response.status}`);
  assertEnvelope(result, label);
  assert("data" in result.payload, `${label}: expected data envelope`);
  results.push({ label, status: result.response.status });
  return result.payload.data;
}

async function expectError(label, path, status, options = {}) {
  const result = await request(path, options);
  assert(result.response.status === status, `${label}: expected ${status}, got ${result.response.status}`);
  assertEnvelope(result, label);
  assert(typeof result.payload.code === "string", `${label}: expected error code`);
  assert(typeof result.payload.message === "string", `${label}: expected error message`);
  results.push({ label, status: result.response.status, code: result.payload.code });
  return result.payload;
}

async function createSession(role) {
  await expectOk(`auth start ${role}`, "/api/auth/start", {
    method: "POST",
    body: { email: `${role}-contract@example.com` },
  });
  const result = await request("/api/auth/verify", {
    method: "POST",
    body: { email: `${role}-contract@example.com`, code: "123456", role },
  });
  assert(result.response.ok, `auth verify ${role}: expected ok, got ${result.response.status}`);
  assertEnvelope(result, `auth verify ${role}`);
  const setCookie = result.response.headers.get("set-cookie");
  assert(setCookie, `auth verify ${role}: missing Set-Cookie`);
  const csrfToken = result.payload.data?.csrfToken || result.payload.data?.session?.csrfToken;
  assert(csrfToken, `auth verify ${role}: missing CSRF token`);
  results.push({ label: `auth verify ${role}`, status: result.response.status });
  return { cookie: setCookie.split(";")[0], csrfToken };
}

const routes = await expectOk("route registry", "/api/system/routes");
assert(routes.routes.length >= 30, "route registry: expected at least 30 routes");
assert(routes.routes.some((route) => route.path === "/api/account"), "route registry: missing account route");

const storage = await expectOk("storage boundaries", "/api/system/storage-boundaries");
assert(storage.boundaries.some((item) => item.kind === "D1"), "storage boundaries: missing D1 boundary");
assert(storage.boundaries.some((item) => item.kind === "R2"), "storage boundaries: missing R2 boundary");
assert(storage.boundaries.some((item) => item.kind === "KV"), "storage boundaries: missing KV boundary");

const schema = await expectOk("data model", "/api/system/data-model");
assert(schema.entities.some((entity) => entity.name === "CompanionProfile"), "data model: missing CompanionProfile");

await expectOk("public home", "/api/public/home");
await expectOk("public experiences", "/api/public/experiences?city=bangkok");
await expectOk("safety content", "/api/safety/content");
await expectOk("payment providers", "/api/payments/providers");

await expectError("traveller discovery unauthorized", "/api/traveller/discovery", 401);
const travellerSession = await createSession("traveller");
const travellerCookie = travellerSession.cookie;
const travellerCsrfHeaders = { "X-Tirak-CSRF": travellerSession.csrfToken };
await expectOk("traveller dashboard", "/api/traveller/dashboard", { cookie: travellerCookie });
await expectOk("traveller discovery", "/api/traveller/discovery?city=bangkok&experience=nightlife", { cookie: travellerCookie });
await expectOk("traveller profile", "/api/traveller/companions/cmp-aura", { cookie: travellerCookie });
await expectOk("traveller sessions", "/api/traveller/sessions", { cookie: travellerCookie });
await expectOk("traveller session detail", "/api/traveller/sessions/sess-bkk-aura-001", { cookie: travellerCookie });
await expectError("traveller restricted profile", "/api/traveller/companions/cmp-nara", 423, { cookie: travellerCookie });
await expectError("traveller mutation missing csrf", "/api/traveller/inquiries", 403, {
  method: "POST",
  cookie: travellerCookie,
  body: {
    companionId: "cmp-aura",
    city: "bangkok",
    experience: "nightlife",
    preferredWindow: "",
    message: "short",
    privacyAcknowledged: false,
  },
});
await expectError("traveller inquiry validation", "/api/traveller/inquiries", 422, {
  method: "POST",
  cookie: travellerCookie,
  headers: travellerCsrfHeaders,
  body: {
    companionId: "cmp-aura",
    city: "bangkok",
    experience: "nightlife",
    preferredWindow: "",
    message: "short",
    privacyAcknowledged: false,
  },
});
const stripeGate = await expectError("stripe compliance gate", "/api/traveller/inquiries/inq-staged-aura/stripe-checkout-session", 409, {
  method: "POST",
  cookie: travellerCookie,
  headers: travellerCsrfHeaders,
  body: {},
});
assert(stripeGate.code === "PAYMENT_PROVIDER_NOT_APPROVED", "stripe compliance gate: expected provider approval code");
await expectOk("account detail", "/api/account", { cookie: travellerCookie });
await expectOk("account privacy", "/api/account/privacy", {
  method: "PATCH",
  cookie: travellerCookie,
  headers: travellerCsrfHeaders,
  body: { receiveInquiryUpdates: false },
});
await expectOk("safety report", "/api/safety/reports", {
  method: "POST",
  cookie: travellerCookie,
  headers: travellerCsrfHeaders,
  body: {
    targetType: "profile",
    targetId: "cmp-aura",
    reasonCategory: "privacy",
    summary: "Privacy concern raised during staged contract smoke testing.",
    contactAllowed: false,
  },
});

await expectError("companion onboarding wrong role", "/api/companion/onboarding", 403, { cookie: travellerCookie });
const companionSession = await createSession("companion");
const companionCookie = companionSession.cookie;
const companionCsrfHeaders = { "X-Tirak-CSRF": companionSession.csrfToken };
await expectOk("companion onboarding", "/api/companion/onboarding", { cookie: companionCookie });
await expectOk("companion dashboard", "/api/companion/dashboard", { cookie: companionCookie });
await expectOk("companion inquiries", "/api/companion/inquiries", { cookie: companionCookie });
await expectOk("companion inquiry detail", "/api/companion/inquiries/cinq-staged-001", { cookie: companionCookie });
await expectError("companion profile validation", "/api/companion/profile", 422, {
  method: "PATCH",
  cookie: companionCookie,
  headers: companionCsrfHeaders,
  body: { displayName: "M", city: "bad", experienceTags: [], bio: "short" },
});
await expectOk("companion availability save", "/api/companion/availability", {
  method: "PATCH",
  cookie: companionCookie,
  headers: companionCsrfHeaders,
  body: {
    availabilityWindows: [
      {
        id: "av-contract",
        city: "phuket",
        label: "Resort evening",
        status: "tentative",
        note: "Review-only resort planning window.",
      },
    ],
  },
});

console.log(JSON.stringify({ baseUrl, checks: results.length, results }, null, 2));
