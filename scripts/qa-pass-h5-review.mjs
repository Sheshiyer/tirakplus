#!/usr/bin/env node
/**
 * qa-pass-h5-review.mjs — Mobile (390×844) visual review of Pass H5
 * (day-of-details + read-only itinerary). H5 closes the booking loop:
 * once a session is scheduled, the companion sets meeting point /
 * contact / day-of notes; both sides see the read-only SessionItinerary
 * 24 hours before the session's scheduledFor.
 *
 * Trick: the same code path branches on scheduledFor → the
 * SetDayOfDetailsForm flow only shows while the itinerary is LOCKED
 * (> 24h out), and SessionItinerary only shows while it's UNLOCKED
 * (≤ 24h out, but the 2h-minimum validator on the windows endpoint
 * means our sweet spot is 23h out). To capture both states cleanly
 * we create TWO inquiries:
 *   - LOCKED inquiry: scheduledFor = +48h (frames 01–05)
 *   - UNLOCKED inquiry: scheduledFor = +23h (frames 06–08)
 * Both have day-of details populated so the same SessionItinerary
 * renders fully on the unlocked side.
 *
 * Captures 8 frames mirroring H4-stub:
 *   01. /companion/inbox/<lockedId> — session_scheduled + locked
 *       itinerary; "Set day-of details" CTA visible (.plan-stage-cta).
 *   02. Click "Set details" → SetDayOfDetailsForm visible
 *       (.day-of-details-form) with empty fields.
 *   03. Fill meetingPoint + contactNumber + 2 notes.
 *   04. Submit → success → "Edit details" CTA now (since details exist).
 *   05. /traveller/inbox/<lockedId> — locked-side "Coming 24 hours
 *       before the session" placeholder (.plan-stage-cta).
 *   06. /companion/inbox/<unlockedId> — SessionItinerary visible
 *       (.session-itinerary) with meeting point + contact + notes
 *       + safety, perspective="companion".
 *   07. /traveller/inbox/<unlockedId> — same SessionItinerary,
 *       perspective="traveller" (Companion contact / Notes from your
 *       companion labels).
 *   08. Close-up of the "Open in Maps" link inside the itinerary
 *       (scroll the meeting-point card into view).
 *
 * Setup: API-only chain per inquiry (create → accept → windows → select
 * → confirm → hold → day-of-details). Browser only takes over for the
 * H5 visual capture starting at frame 01.
 *
 * Saves to: generated/qa-screenshots/pass-h5-review-<YYYYMMDD>/
 *
 * Run:  node scripts/qa-pass-h5-review.mjs
 */

import { chromium } from "playwright";
import { mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const BASE = "http://localhost:8787";
const TODAY = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const OUT_DIR = `generated/qa-screenshots/pass-h5-review-${TODAY}`;
const VIEWPORT = { width: 390, height: 844 };
const COMPANION_ID = "cmp-aura";

const IGNORE_CONSOLE = [
  /runtime\.lastError/i,
  /FrameDoesNotExistError/i,
  /back\/forward cache/i,
  /message channel is closed/i,
  /message port closed/i,
  // Same caveat as H3/H4-stub: cancelAllTravellerInquiries() best-effort
  // loops DELETE over every active inquiry, and the server returns 409
  // for any inquiry past the cancellable window (accepted/date_*/
  // payment_held/session_scheduled). Filter so console-error reporting
  // stays signal-only.
  /Failed to load resource.*status of 409/i,
  // H5.T8: when this script runs back-to-back with the Sub-task A curl
  // smoke we can blow through the 30/min mutation bucket. postWithRetry
  // / createRoutedInquiry handle the 429 by waiting + retrying, but the
  // first failed attempt still surfaces as a console error. The retry's
  // success is what proves the flow works — filter the noise.
  /Failed to load resource.*status of 429/i,
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

// Mutation rate limit is 30/min (see src/worker/rate-limit.ts). This
// script fires ~12 mutations across the two-inquiry setup chain, which
// alone fits the budget — but co-running with the curl smoke from
// Sub-task A doubles the request count against the same client bucket
// (same IP + UA). Helper retries once on HTTP 429 after pausing the
// suggested Retry-After window so the script is resilient when run
// back-to-back with the smoke.
async function postWithRetry(page, url, csrf, body) {
  const attempt = await page.evaluate(
    async ({ u, token, b }) => {
      const r = await fetch(u, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-Tirak-CSRF": token },
        body: JSON.stringify(b),
      });
      const retryAfter = r.headers.get("Retry-After");
      return { status: r.status, retryAfter };
    },
    { u: url, token: csrf, b: body },
  );
  if (attempt.status !== 429) return attempt.status;
  const waitSec = Math.max(1, Number(attempt.retryAfter) || 61);
  console.log(`   ⏸  ${url} hit 429 — waiting ${waitSec}s for bucket reset`);
  await page.waitForTimeout(waitSec * 1000);
  const retry = await page.evaluate(
    async ({ u, token, b }) => {
      const r = await fetch(u, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-Tirak-CSRF": token },
        body: JSON.stringify(b),
      });
      return r.status;
    },
    { u: url, token: csrf, b: body },
  );
  return retry;
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

async function createRoutedInquiry(page, csrf, companionId, message) {
  const body = {
    companionId,
    city: "bangkok",
    experience: "nightlife",
    preferredWindow: "weekend evening",
    message,
    privacyAcknowledged: true,
  };
  const doPost = async () =>
    await page.evaluate(
      async ({ token, b }) => {
        const response = await fetch("/api/traveller/inquiries", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-Tirak-CSRF": token,
          },
          body: JSON.stringify(b),
        });
        const json = await response.json().catch(() => ({}));
        return {
          status: response.status,
          retryAfter: response.headers.get("Retry-After"),
          inquiryId: json?.data?.inquiry?.id ?? null,
        };
      },
      { token: csrf, b: body },
    );
  let result = await doPost();
  if (result.status === 429) {
    const waitSec = Math.max(1, Number(result.retryAfter) || 61);
    console.log(`   ⏸  POST /api/traveller/inquiries hit 429 — waiting ${waitSec}s`);
    await page.waitForTimeout(waitSec * 1000);
    result = await doPost();
  }
  return result.inquiryId;
}

// Drive an inquiry through accept → windows → select → confirm → hold,
// landing on session_scheduled. The windowOffsetHours arg picks the
// scheduledFor — 48h for the LOCKED screenshots, 23h for the UNLOCKED
// screenshots (the SessionItinerary 24h gate). Each role switch issues
// a new CSRF so we re-fetch after every dev-login call.
//
// Window math:
//   start = now + offsetHours
//   end   = start + 2h
// The server requires duration ≥ 2h and start ≥ +2h, so offsetHours
// must be ≥ 2. For the locked case we use 48h; for the unlocked case
// we use 23h (within 24h cutoff, ≥ 2h minimum).
async function driveToSessionScheduled(page, inquiryId, offsetHours) {
  // 1. Switch role to companion; accept.
  await page.goto(`${BASE}/api/dev/login?role=companion`, { waitUntil: "networkidle" });
  const companionCsrf = await getCsrf(page);
  const acceptStatus = await postWithRetry(
    page,
    `/api/companion/inquiries/${inquiryId}/accept`,
    companionCsrf,
    {},
  );
  if (acceptStatus !== 200) throw new Error(`accept failed: HTTP ${acceptStatus}`);

  // 2. Traveller submits 2 windows. The first window is the one we'll
  //    select (with the desired offset); the second is a decoy.
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });
  const travellerCsrf2 = await getCsrf(page);
  const windowsPayload = (() => {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const isoAt = (offset) => new Date(now + offset * hour).toISOString();
    return {
      windows: [
        { start: isoAt(offsetHours), end: isoAt(offsetHours + 2) },
        { start: isoAt(offsetHours + 24), end: isoAt(offsetHours + 26) },
      ],
    };
  })();
  const windowsStatus = await postWithRetry(
    page,
    `/api/plans/${inquiryId}/windows`,
    travellerCsrf2,
    windowsPayload,
  );
  if (windowsStatus !== 200) throw new Error(`windows POST failed: HTTP ${windowsStatus}`);

  // 3. Companion picks window[0] (the one with the requested offset).
  await page.goto(`${BASE}/api/dev/login?role=companion`, { waitUntil: "networkidle" });
  const companionCsrf2 = await getCsrf(page);
  const selectStatus = await postWithRetry(
    page,
    `/api/plans/${inquiryId}/select-window`,
    companionCsrf2,
    { selectedWindow: windowsPayload.windows[0] },
  );
  if (selectStatus !== 200) throw new Error(`select-window failed: HTTP ${selectStatus}`);

  // 4. Traveller confirms (→ date_confirmed) then holds (→ payment_held
  //    → session_scheduled in dev/staging via auto-advance).
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });
  const travellerCsrf3 = await getCsrf(page);
  const confirmStatus = await postWithRetry(
    page,
    `/api/plans/${inquiryId}/confirm`,
    travellerCsrf3,
    {},
  );
  if (confirmStatus !== 200) throw new Error(`confirm failed: HTTP ${confirmStatus}`);

  const holdStatus = await postWithRetry(
    page,
    `/api/plans/${inquiryId}/hold`,
    travellerCsrf3,
    {},
  );
  if (holdStatus !== 200) throw new Error(`hold failed: HTTP ${holdStatus}`);
}

// Patch day-of details on an inquiry. Called for the UNLOCKED inquiry
// up front so the SessionItinerary frames render with meeting point /
// contact / notes already populated. The LOCKED inquiry gets its
// details set via the UI in frames 02-04 (that's the whole point).
async function setDayOfDetails(page, inquiryId) {
  await page.goto(`${BASE}/api/dev/login?role=companion`, { waitUntil: "networkidle" });
  const csrf = await getCsrf(page);
  const status = await postWithRetry(
    page,
    `/api/plans/${inquiryId}/day-of-details`,
    csrf,
    {
      meetingPoint: "W Bangkok lobby, 106 N Sathorn Rd. I will wear black.",
      contactNumber: "+66 81 234 5678",
      dayOfNotes: [
        "Text 15 min before arrival",
        "Cash is fine for tuktuks",
      ],
    },
  );
  if (status !== 200) throw new Error(`day-of-details failed: HTTP ${status}`);
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

  // ── Setup: dev-login traveller; clear; create TWO inquiries.
  //   LOCKED:   scheduledFor = +48h (frames 01–05, day-of CTA visible).
  //   UNLOCKED: scheduledFor = +23h (frames 06–08, SessionItinerary live).
  console.log("→ Dev login as traveller");
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });
  const travellerCsrf = await getCsrf(page);

  console.log("→ Reset state: cancel any existing traveller inquiries");
  await cancelAllTravellerInquiries(page, travellerCsrf);

  console.log("→ Create LOCKED inquiry (scheduledFor +48h, no details yet)");
  const lockedId = await createRoutedInquiry(
    page,
    travellerCsrf,
    COMPANION_ID,
    "H5 review walkthrough — LOCKED itinerary (day-of CTA flow).",
  );
  if (!lockedId) throw new Error("Could not create LOCKED inquiry");
  console.log(`   → locked inquiry id: ${lockedId}`);
  await driveToSessionScheduled(page, lockedId, 48);
  console.log("   → LOCKED inquiry at session_scheduled (scheduledFor +48h)");

  // Need a fresh traveller CSRF before creating the next inquiry — the
  // previous one was issued before the role-switching detour inside
  // driveToSessionScheduled and no longer matches the current session.
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });
  const travellerCsrf2 = await getCsrf(page);

  console.log("→ Create UNLOCKED inquiry (scheduledFor +23h, details pre-populated)");
  const unlockedId = await createRoutedInquiry(
    page,
    travellerCsrf2,
    COMPANION_ID,
    "H5 review walkthrough — UNLOCKED itinerary (SessionItinerary frames).",
  );
  if (!unlockedId) throw new Error("Could not create UNLOCKED inquiry");
  console.log(`   → unlocked inquiry id: ${unlockedId}`);
  await driveToSessionScheduled(page, unlockedId, 23);
  console.log("   → UNLOCKED inquiry at session_scheduled (scheduledFor +23h)");

  console.log("→ Pre-populate day-of details on UNLOCKED inquiry (companion API)");
  await setDayOfDetails(page, unlockedId);

  // ── 01: Companion at session_scheduled (LOCKED) — "Set day-of
  //   details" CTA visible. The form-vs-CTA branch hinges on
  //   showDayOfDetailsForm state; on first paint it's false.
  console.log("→ Switch role to companion (for frames 01-04)");
  await page.goto(`${BASE}/api/dev/login?role=companion`, { waitUntil: "networkidle" });

  console.log(`→ 01 /companion/inbox/${lockedId} — Set day-of details CTA visible`);
  await page.goto(`${BASE}/companion/inbox/${lockedId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".companion-inquiry-detail-page", { timeout: 8000 });
  await page.waitForSelector(".plan-stage-cta", { timeout: 6000 });
  // Confirm itinerary is NOT visible (locked state).
  await page.waitForTimeout(500);
  await scrollTo(page, ".plan-stage-cta");
  await shoot(page, OUT_DIR, "01-companion-set-details-cta");

  // ── 02: Click "Set details" → empty form ─────────────────────────
  console.log("→ 02 click 'Set details' → SetDayOfDetailsForm visible");
  await page.locator(".plan-stage-cta button:has-text('Set details')").first().click();
  await page.waitForSelector(".day-of-details-form", { timeout: 6000 });
  await page.waitForTimeout(400);
  await scrollTo(page, ".day-of-details-form");
  await shoot(page, OUT_DIR, "02-companion-set-details-form");

  // ── 03: Fill the form ─────────────────────────────────────────────
  // The Textarea / Input components use useId-generated ids tied to
  // <label htmlFor>, so getByLabel() finds the right control. The
  // "Add note" button mints a fresh empty note input each click.
  console.log("→ 03 fill meetingPoint + contactNumber + 2 notes");
  // Scope all input lookups inside the form section AND filter to the
  // textbox role — the parent <section> has an aria-labelledby that
  // resolves to text matching "Meeting point" too, so a bare
  // getByLabel() collides in strict mode.
  const formScope = page.locator(".day-of-details-form");
  await formScope
    .getByRole("textbox", { name: "Meeting point" })
    .fill("W Bangkok lobby, 106 N Sathorn Rd. I will wear black.");
  await formScope
    .getByRole("textbox", { name: "Contact number" })
    .fill("+66 81 234 5678");
  await formScope.locator(".day-of-details-add").click();
  await page.waitForSelector(".day-of-details-note", { timeout: 4000 });
  await formScope
    .getByRole("textbox", { name: "Note 1" })
    .fill("Text 15 min before arrival");
  await formScope.locator(".day-of-details-add").click();
  // Wait for the second note's input to appear before filling.
  await page.waitForFunction(
    () => document.querySelectorAll(".day-of-details-note").length >= 2,
    null,
    { timeout: 4000 },
  );
  await formScope
    .getByRole("textbox", { name: "Note 2" })
    .fill("Cash is fine for tuktuks");
  await page.waitForTimeout(300);
  await scrollTo(page, ".day-of-details-form");
  await shoot(page, OUT_DIR, "03-companion-set-details-filled");

  // ── 04: Submit → success → CTA returns with "Edit details" label ──
  // After a successful POST the form's onSubmitted callback flips
  // showDayOfDetailsForm to false and reseeds inquiry state. Since
  // hasDayOfDetails is now truthy the CTA copy reads "Edit details".
  console.log("→ 04 submit → success → 'Edit details' CTA");
  await page.locator(".day-of-details-actions button:has-text('Save day-of details')").click();
  // Wait for the form to unmount + the CTA to re-render with the
  // edit copy. Use a text-based locator so we wait for the precise
  // state we care about, not just the section appearing.
  await page.waitForSelector(".plan-stage-cta button:has-text('Edit details')", { timeout: 8000 });
  await page.waitForTimeout(400);
  await scrollTo(page, ".plan-stage-cta");
  await shoot(page, OUT_DIR, "04-companion-set-details-saved");

  // ── Switch role to traveller for the locked-side placeholder ──────
  console.log("→ Switch role to traveller (for frame 05)");
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });

  // ── 05: Traveller view of LOCKED inquiry — "Coming 24 hours
  //   before the session" placeholder. The traveller never sees the
  //   editable form — they only see the placeholder.
  console.log(`→ 05 /traveller/inbox/${lockedId} — locked itinerary placeholder`);
  await page.goto(`${BASE}/traveller/inbox/${lockedId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".inquiry-success-panel, .traveller-inquiry-detail-page", {
    timeout: 8000,
  });
  await page.waitForSelector(".plan-stage-cta", { timeout: 6000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".plan-stage-cta");
  await shoot(page, OUT_DIR, "05-traveller-itinerary-locked");

  // ── Switch role to companion for the unlocked-side itinerary ──────
  console.log("→ Switch role to companion (for frame 06)");
  await page.goto(`${BASE}/api/dev/login?role=companion`, { waitUntil: "networkidle" });

  // ── 06: Companion view of UNLOCKED inquiry — SessionItinerary
  //   visible with full data. perspective="companion" so the contact
  //   card reads as "Your contact" and the notes as "Your day-of notes".
  console.log(`→ 06 /companion/inbox/${unlockedId} — SessionItinerary (companion view)`);
  await page.goto(`${BASE}/companion/inbox/${unlockedId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".companion-inquiry-detail-page", { timeout: 8000 });
  await page.waitForSelector(".session-itinerary", { timeout: 6000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".session-itinerary");
  await shoot(page, OUT_DIR, "06-companion-itinerary-unlocked");

  // ── Switch role back to traveller for the traveller-perspective view ──
  console.log("→ Switch role to traveller (for frames 07-08)");
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });

  // ── 07: Traveller view of UNLOCKED inquiry — same SessionItinerary,
  //   perspective="traveller" so labels swap to "Companion contact" /
  //   "Notes from your companion".
  console.log(`→ 07 /traveller/inbox/${unlockedId} — SessionItinerary (traveller view)`);
  await page.goto(`${BASE}/traveller/inbox/${unlockedId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".session-itinerary", { timeout: 8000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".session-itinerary");
  await shoot(page, OUT_DIR, "07-traveller-itinerary-unlocked");

  // ── 08: Close-up of the "Open in Maps" link inside the meeting-point
  //   card. We scroll the meeting-point card to top so the Maps link
  //   sits near the top of the viewport; same page as frame 07, so the
  //   inquiry context is preserved.
  console.log("→ 08 close-up of 'Open in Maps' link on the meeting-point card");
  // The meeting-point card is the .session-itinerary-card that contains
  // the .session-itinerary-link anchor; scroll that anchor's parent
  // card into view at the top of the viewport.
  await page.evaluate(() => {
    const link = document.querySelector(".session-itinerary-link");
    const card = link?.closest(".session-itinerary-card");
    if (card) card.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await page.waitForTimeout(400);
  await shoot(page, OUT_DIR, "08-traveller-itinerary-link-meeting-point");

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
