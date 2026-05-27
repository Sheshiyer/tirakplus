#!/usr/bin/env node
/**
 * qa-pass-h4-stub-review.mjs — Mobile (390×844) visual review of Pass
 * H4-stub (dummy payment hold). H3 ends at date_confirmed; H4-stub adds
 * the traveller's "Hold your booking" CTA which in dev/staging
 * auto-advances payment_held → session_scheduled in one round-trip.
 *
 * Walks the H4-stub-specific frames (setup chain happens via API to keep
 * this script focused on the H4 surfaces):
 *   01. /traveller/inbox/<id> — date_confirmed summary card visible
 *       WITH the "Hold your booking" CTA + dev-preview note.
 *   02. /traveller/inbox/<id> — after clicking Hold, status flips to
 *       session_scheduled; the .plan-stage-scheduled panel is visible.
 *   03. Switch role → companion. /companion/inbox/<id> — sees the
 *       session_scheduled panel (read-only, no CTA on this side).
 *   04. Switch back → traveller. /traveller/inbox — the inquiry card
 *       shows the new "session scheduled" status in the meta line.
 *
 * Setup: same KV-reset pattern as H3 (cancel pre-existing traveller
 * inquiries via DELETE), then drive create → accept → windows → select
 * → confirm entirely through the API so we reach date_confirmed in one
 * shot. The browser only takes over for the H4-stub visual capture.
 *
 * Saves to: generated/qa-screenshots/pass-h4-stub-review-<YYYYMMDD>/
 *
 * Run:  node scripts/qa-pass-h4-stub-review.mjs
 */

import { chromium } from "playwright";
import { mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const BASE = "http://localhost:8787";
const TODAY = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const OUT_DIR = `generated/qa-screenshots/pass-h4-stub-review-${TODAY}`;
const VIEWPORT = { width: 390, height: 844 };
const COMPANION_ID = "cmp-aura";

const IGNORE_CONSOLE = [
  /runtime\.lastError/i,
  /FrameDoesNotExistError/i,
  /back\/forward cache/i,
  /message channel is closed/i,
  /message port closed/i,
  // Same caveat as H3.T10: cancelAllTravellerInquiries() best-effort
  // loops DELETE over every active inquiry, and the server returns 409
  // for any inquiry past the cancellable window (accepted/date_*/
  // payment_held/session_scheduled). Filter so console-error reporting
  // stays signal-only.
  /Failed to load resource.*status of 409/i,
];
const ignoreConsole = (t) => IGNORE_CONSOLE.some((re) => re.test(t));

async function shoot(page, dir, name) {
  await page.screenshot({ path: join(dir, `${name}.png`) });
  console.log(`  ✓ ${name}.png`);
}

async function scrollTo(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ block: "start", behavior: "instant" });
  }, selector);
  await page.waitForTimeout(300);
}

async function getCsrf(page) {
  const sess = await page.evaluate(async () => {
    const r = await fetch("/api/session", { credentials: "include" });
    return (await r.json()).data;
  });
  if (!sess?.csrfToken) throw new Error("Could not get CSRF token from /api/session");
  return sess.csrfToken;
}

async function cancelAllTravellerInquiries(page, csrf) {
  await page.evaluate(async (token) => {
    const listResponse = await fetch("/api/traveller/inquiries", { credentials: "include" });
    const listJson = await listResponse.json();
    const inquiries = listJson?.data?.results ?? [];
    for (const inquiry of inquiries) {
      if (inquiry.status === "cancelled" || inquiry.status === "completed") continue;
      await fetch(`/api/traveller/inquiries/${inquiry.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "X-Tirak-CSRF": token },
      });
    }
  }, csrf);
}

async function createRoutedInquiry(page, csrf, companionId) {
  return await page.evaluate(
    async ({ token, cid }) => {
      const response = await fetch("/api/traveller/inquiries", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Tirak-CSRF": token,
        },
        body: JSON.stringify({
          companionId: cid,
          city: "bangkok",
          experience: "nightlife",
          preferredWindow: "weekend evening",
          message:
            "H4-stub review walkthrough — capturing the payment-hold round-trip.",
          privacyAcknowledged: true,
        }),
      });
      const json = await response.json();
      return json?.data?.inquiry?.id;
    },
    { token: csrf, cid: companionId },
  );
}

// Drive accept → windows → select → confirm via API so we land on
// date_confirmed in one synchronous shot. Each role switch issues a
// new session (and CSRF) — so re-fetch the CSRF token after every
// `/api/dev/login` call rather than reusing a stale one. Returns
// nothing — the inquiry id stays the same end to end.
async function driveToDateConfirmed(page, inquiryId) {
  // 1. Switch role to companion; accept.
  await page.goto(`${BASE}/api/dev/login?role=companion`, { waitUntil: "networkidle" });
  const companionCsrf = await getCsrf(page);
  const acceptStatus = await page.evaluate(
    async ({ id, token }) => {
      const r = await fetch(`/api/companion/inquiries/${id}/accept`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-Tirak-CSRF": token },
        body: JSON.stringify({}),
      });
      return r.status;
    },
    { id: inquiryId, token: companionCsrf },
  );
  if (acceptStatus !== 200) throw new Error(`accept failed: HTTP ${acceptStatus}`);

  // 2. Switch role back to traveller; submit 2 windows. Using +24/+48h
  //    offsets keeps the windows inside the server's "future-only" guard
  //    while sitting comfortably inside the 1-6h duration band.
  //    CRITICAL: fetch a FRESH CSRF token here — the previous one was
  //    issued before the companion-role detour and no longer matches
  //    the new traveller session.
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });
  const travellerCsrf2 = await getCsrf(page);
  const windowsPayload = (() => {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const isoAt = (offsetHours) => new Date(now + offsetHours * hour).toISOString();
    return {
      windows: [
        { start: isoAt(24), end: isoAt(26) },
        { start: isoAt(48), end: isoAt(50) },
      ],
    };
  })();
  const windowsStatus = await page.evaluate(
    async ({ id, token, body }) => {
      const r = await fetch(`/api/plans/${id}/windows`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-Tirak-CSRF": token },
        body: JSON.stringify(body),
      });
      return r.status;
    },
    { id: inquiryId, token: travellerCsrf2, body: windowsPayload },
  );
  if (windowsStatus !== 200) throw new Error(`windows POST failed: HTTP ${windowsStatus}`);

  // 3. Switch role to companion; pick the second window.
  await page.goto(`${BASE}/api/dev/login?role=companion`, { waitUntil: "networkidle" });
  const companionCsrf2 = await getCsrf(page);
  const selectStatus = await page.evaluate(
    async ({ id, token, selected }) => {
      const r = await fetch(`/api/plans/${id}/select-window`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-Tirak-CSRF": token },
        body: JSON.stringify({ selectedWindow: selected }),
      });
      return r.status;
    },
    {
      id: inquiryId,
      token: companionCsrf2,
      selected: windowsPayload.windows[1],
    },
  );
  if (selectStatus !== 200) throw new Error(`select-window failed: HTTP ${selectStatus}`);

  // 4. Switch role back to traveller; confirm plan → date_confirmed.
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });
  const travellerCsrf3 = await getCsrf(page);
  const confirmStatus = await page.evaluate(
    async ({ id, token }) => {
      const r = await fetch(`/api/plans/${id}/confirm`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-Tirak-CSRF": token },
        body: JSON.stringify({}),
      });
      return r.status;
    },
    { id: inquiryId, token: travellerCsrf3 },
  );
  if (confirmStatus !== 200) throw new Error(`confirm failed: HTTP ${confirmStatus}`);
}

async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const page = await context.newPage();

  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (ignoreConsole(text)) return;
    errors.push(text);
  });
  page.on("pageerror", (err) => errors.push(String(err)));

  // ── Setup: dev-login traveller; clear; create routed inquiry; drive
  //    the full H1→H3 chain to date_confirmed via API. Browser takes
  //    over from frame 01 onward for the H4-stub visual capture.
  console.log("→ Dev login as traveller");
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });
  const travellerCsrf = await getCsrf(page);

  console.log("→ Reset state: cancel any existing traveller inquiries");
  await cancelAllTravellerInquiries(page, travellerCsrf);

  console.log("→ Create a fresh routed inquiry via API");
  const inquiryId = await createRoutedInquiry(page, travellerCsrf, COMPANION_ID);
  if (!inquiryId) throw new Error("Could not create routed inquiry");
  console.log(`   → captured inquiry id: ${inquiryId}`);

  console.log("→ Drive H1→H3 chain via API: accept → windows → select → confirm");
  await driveToDateConfirmed(page, inquiryId);
  console.log("   → inquiry is now in date_confirmed");

  // ── 01: Traveller detail (date_confirmed) WITH Hold CTA visible ──
  console.log(`→ 01 /traveller/inbox/${inquiryId} — date_confirmed + Hold CTA`);
  await page.goto(`${BASE}/traveller/inbox/${inquiryId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".inquiry-success-panel", { timeout: 8000 });
  await page.waitForSelector(".plan-stage-hold-cta", { timeout: 6000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".plan-stage-hold-cta");
  await shoot(page, OUT_DIR, "01-traveller-date-confirmed-with-hold-cta");

  // ── 02: Click Hold → status flips to session_scheduled ───────────
  // In dev the /hold endpoint auto-advances through payment_held and
  // returns session_scheduled directly; the traveller page rerenders
  // with .plan-stage-scheduled in one round-trip.
  console.log("→ 02 click Hold → status=session_scheduled (.plan-stage-scheduled)");
  await page.locator(".plan-stage-hold-cta button:has-text('Hold your booking')").first().click();
  await page.waitForSelector(".plan-stage-scheduled", { timeout: 6000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".plan-stage-scheduled");
  await shoot(page, OUT_DIR, "02-traveller-hold-submitted");

  // ── Switch role to companion ──────────────────────────────────────
  console.log("→ Switch role to companion (dev login)");
  await page.goto(`${BASE}/api/dev/login?role=companion`, { waitUntil: "networkidle" });

  // ── 03: Companion sees session_scheduled panel ───────────────────
  // Skip the inbox list (same synthetic-email caveat as H2/H3; routed
  // inquiry doesn't surface there). Navigate direct to detail.
  console.log(`→ 03 /companion/inbox/${inquiryId} — session_scheduled panel`);
  await page.goto(`${BASE}/companion/inbox/${inquiryId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".companion-inquiry-detail-page", { timeout: 8000 });
  await page.waitForSelector(".plan-stage-scheduled", { timeout: 6000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".plan-stage-scheduled");
  await shoot(page, OUT_DIR, "03-companion-session-scheduled");

  // ── Switch role back to traveller ─────────────────────────────────
  console.log("→ Switch role back to traveller (dev login)");
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });

  // ── 04: Traveller inbox shows the new status on the card ─────────
  // Card meta renders inquiry.status.replace("_", " ") so the badge
  // shows "session scheduled" without any extra mapping.
  console.log("→ 04 /traveller/inbox — card shows 'session scheduled' status");
  await page.goto(`${BASE}/traveller/inbox`, { waitUntil: "networkidle" });
  await page.waitForSelector(".inquiry-summary-card", { timeout: 8000 });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await shoot(page, OUT_DIR, "04-traveller-inbox-with-scheduled");

  await browser.close();

  // ── summary ──────────────────────────────────────────────────────
  const files = (await readdir(OUT_DIR)).filter((f) => f.endsWith(".png"));
  let totalBytes = 0;
  for (const f of files) {
    const s = await stat(join(OUT_DIR, f));
    totalBytes += s.size;
  }
  console.log(`\n✓ Captured ${files.length} screenshots to ${OUT_DIR}/`);
  console.log(`  Total: ${(totalBytes / 1024).toFixed(1)} KB`);

  if (errors.length) {
    console.error(`\n⚠ Console errors during run:`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Runner crashed:", err);
  process.exit(2);
});
