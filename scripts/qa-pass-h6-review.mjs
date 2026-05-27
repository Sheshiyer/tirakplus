#!/usr/bin/env node
/**
 * qa-pass-h6-review.mjs — Mobile (390×844) visual review of Pass H6
 * (post-session review + companion rating). H6 closes the booking
 * lifecycle: once the system advances past session_completed, the
 * traveller is in review_pending and can leave a 1–5 score + 20–500
 * char comment. Submission flips the booking to review_completed and
 * the companion's public profile picks up the new aggregate.
 *
 * Trick: review_pending requires scheduledFor + durationMinutes in the
 * past. Real wall-clock time can't run forward inside a single test, so
 * we use the H6.Task 9 dev endpoint (`POST /api/dev/advance-booking`,
 * gated on env.ENVIRONMENT !== "production") to forcibly set the
 * booking to review_pending with scheduledFor = now-2h, duration = 60m.
 * That mimics "a session ended an hour ago" without touching the clock.
 *
 * Captures 7 frames:
 *   01. /traveller/inbox/<id> — status=review_pending; "Leave a review"
 *       CTA visible inside .plan-stage-cta.
 *   02. Click CTA — ReviewFormSheet <dialog> open (.review-form-sheet).
 *   03. Pick score=4, fill comment (≥20 chars). Form remains valid.
 *   04. Submit — submitted state visible inside the modal (button label
 *       flips to "Submitted") before it auto-closes.
 *   05. Modal closed — page now renders the review summary card
 *       (.plan-stage-confirmed) at status=review_completed.
 *   06. /traveller/companions/cmp-aura — public profile shows the
 *       rating badge (.companion-rating-badge) + recent reviews section
 *       (.companion-reviews) with the just-submitted review.
 *   07. Close-up of the review card (.companion-reviews-item) showing
 *       the score + travellerLabel + comment together.
 *
 * Setup: API-only chain (create → accept → windows → select → confirm
 * → hold → session_scheduled) then the dev endpoint jumps to
 * review_pending. Browser only takes over for the visual capture
 * starting at frame 01.
 *
 * Saves to: generated/qa-screenshots/pass-h6-review-<YYYYMMDD>/
 *
 * Run:  node scripts/qa-pass-h6-review.mjs
 */

import { chromium } from "playwright";
import { mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const BASE = "http://localhost:8787";
const TODAY = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const OUT_DIR = `generated/qa-screenshots/pass-h6-review-${TODAY}`;
const VIEWPORT = { width: 390, height: 844 };
const COMPANION_ID = "cmp-aura";

const IGNORE_CONSOLE = [
  /runtime\.lastError/i,
  /FrameDoesNotExistError/i,
  /back\/forward cache/i,
  /message channel is closed/i,
  /message port closed/i,
  // Same caveat as H3/H4-stub/H5: cancelAllTravellerInquiries() loops
  // DELETE over every active inquiry, and the server returns 409 for
  // any inquiry past the cancellable window. Filter so console-error
  // reporting stays signal-only.
  /Failed to load resource.*status of 409/i,
  // The 30/min mutation rate-limit bucket can throttle the setup chain
  // when this script runs back-to-back with the curl smoke. postWithRetry
  // backs off and retries, but the first failed attempt still surfaces.
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

// Mutation rate limit is 30/min (see src/worker/rate-limit.ts). H6's
// setup chain fires ~7 mutations; co-running with the curl smoke can
// push the bucket near its cap. Helper retries once on HTTP 429 after
// pausing the suggested Retry-After window.
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
// landing on session_scheduled. The windows are 48h out — enough buffer
// that the booking stays cleanly at session_scheduled before the dev
// endpoint forces the jump to review_pending.
async function driveToSessionScheduled(page, inquiryId) {
  // 1. Companion accepts.
  await page.goto(`${BASE}/api/dev/login?role=companion`, { waitUntil: "networkidle" });
  const companionCsrf = await getCsrf(page);
  const acceptStatus = await postWithRetry(
    page,
    `/api/companion/inquiries/${inquiryId}/accept`,
    companionCsrf,
    {},
  );
  if (acceptStatus !== 200) throw new Error(`accept failed: HTTP ${acceptStatus}`);

  // 2. Traveller submits 2 windows.
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });
  const travellerCsrf2 = await getCsrf(page);
  const windowsPayload = (() => {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const isoAt = (offset) => new Date(now + offset * hour).toISOString();
    return {
      windows: [
        { start: isoAt(48), end: isoAt(50) },
        { start: isoAt(72), end: isoAt(74) },
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

  // 3. Companion selects window[0].
  await page.goto(`${BASE}/api/dev/login?role=companion`, { waitUntil: "networkidle" });
  const companionCsrf2 = await getCsrf(page);
  const selectStatus = await postWithRetry(
    page,
    `/api/plans/${inquiryId}/select-window`,
    companionCsrf2,
    { selectedWindow: windowsPayload.windows[0] },
  );
  if (selectStatus !== 200) throw new Error(`select-window failed: HTTP ${selectStatus}`);

  // 4. Traveller confirms then holds. In non-prod, the hold endpoint
  //    auto-bridges payment_held → session_scheduled.
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

// H6.Task 9 dev endpoint: jump the booking straight to review_pending
// with a backdated scheduledFor + durationMinutes so the time-gated
// state machine accepts it. Used because real time can't move forward
// inside a test run.
async function forceReviewPending(page, inquiryId) {
  const csrf = await getCsrf(page);
  const past = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const status = await postWithRetry(page, `/api/dev/advance-booking`, csrf, {
    id: inquiryId,
    to: "review_pending",
    scheduledFor: past,
    durationMinutes: 60,
  });
  if (status !== 200) {
    throw new Error(`dev/advance-booking → review_pending failed: HTTP ${status}`);
  }
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

  // ── Setup: traveller dev-login, reset any prior inquiries, create
  //   one routed inquiry, drive it through the full booking chain to
  //   session_scheduled, then force-advance to review_pending.
  console.log("→ Dev login as traveller");
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });
  const travellerCsrf = await getCsrf(page);

  console.log("→ Reset state: cancel any existing traveller inquiries");
  await cancelAllTravellerInquiries(page, travellerCsrf);

  console.log("→ Create inquiry");
  const inquiryId = await createRoutedInquiry(
    page,
    travellerCsrf,
    COMPANION_ID,
    "H6 review walkthrough — post-session review + companion rating flow.",
  );
  if (!inquiryId) throw new Error("Could not create inquiry");
  console.log(`   → inquiry id: ${inquiryId}`);

  console.log("→ Drive booking through accept → windows → select → confirm → hold");
  await driveToSessionScheduled(page, inquiryId);
  console.log("   → booking at session_scheduled");

  // Re-login as traveller — the chain ends on a companion role-switch
  // detour, and we need traveller perspective + a fresh CSRF for the
  // dev endpoint call and the page navigations below.
  console.log("→ Switch role back to traveller (for dev endpoint + visual capture)");
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });

  console.log("→ Force-advance booking → review_pending (dev endpoint)");
  await forceReviewPending(page, inquiryId);
  console.log("   → booking at review_pending (scheduledFor backdated 2h)");

  // ── 01: Traveller detail page sitting at review_pending. The
  //   .plan-stage-cta section renders the "Leave a review" prompt.
  //   We wait for the CTA button explicitly so the screenshot can't
  //   capture a half-loaded skeleton.
  console.log(`→ 01 /traveller/inbox/${inquiryId} — Leave a review CTA visible`);
  await page.goto(`${BASE}/traveller/inbox/${inquiryId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".inquiry-page", { timeout: 8000 });
  await page.waitForSelector(".plan-stage-cta button:has-text('Leave a review')", { timeout: 6000 });
  await page.waitForTimeout(400);
  await scrollTo(page, ".plan-stage-cta");
  await shoot(page, OUT_DIR, "01-traveller-review-pending-cta");

  // ── 02: Click the CTA — the ReviewFormSheet <dialog> opens. The
  //   component uses dialog.showModal() so a quick wait on the
  //   .review-form-sheet selector confirms the open state.
  console.log("→ 02 click 'Leave a review' → ReviewFormSheet modal open");
  await page.locator(".plan-stage-cta button:has-text('Leave a review')").first().click();
  await page.waitForSelector(".review-form-sheet[open]", { timeout: 6000 });
  // Give the open animation a beat so the screenshot catches the
  // fully-expanded sheet, not a transitional frame.
  await page.waitForTimeout(500);
  await shoot(page, OUT_DIR, "02-traveller-review-form-open");

  // ── 03: Pick score=4 + fill a 20+ char comment. The score options
  //   are <input type="radio" value="…"> inside .review-form-score-options;
  //   the comment is a labelled textarea inside the form.
  console.log("→ 03 pick score=4 + fill comment (≥20 chars)");
  const sheet = page.locator(".review-form-sheet");
  await sheet.locator('input[type="radio"][value="4"]').check();
  // The Textarea component uses useId-generated ids tied to <label
  // htmlFor>. The label text matches "Tell other travellers about the
  // experience" — use getByLabel for a stable lookup.
  await sheet
    .getByLabel("Tell other travellers about the experience")
    .fill("Calm pacing, considered choices, easy night out. Felt safe and unhurried.");
  await page.waitForTimeout(300);
  await shoot(page, OUT_DIR, "03-traveller-review-form-filled");

  // ── 04: Submit. The flow is:
  //     click submit → POST → ReviewFormSheet flips actionState to
  //     "submitted" + calls onSubmitted(next) → TravellerInquiryDetailPage
  //     synchronously calls setReviewModalOpen(false), which unmounts
  //     the modal (component early-returns null on !open) BEFORE the
  //     1.5s auto-close timer fires. So the "Submitted" button label
  //     in the modal is essentially never visible to a real user — what
  //     the user actually sees is the modal closing + the page swapping
  //     to the review summary card. We capture that transition: page
  //     flips to .plan-stage-confirmed, modal is gone.
  console.log("→ 04 submit review → page flips to review summary (modal closes)");
  await sheet.locator('button[type="submit"]').click();
  // Wait for the review summary card to appear — that's the proof
  // the submission succeeded AND the parent re-rendered with the
  // post-submission inquiry state.
  await page.waitForSelector(".plan-stage-confirmed", { timeout: 8000 });
  // Ensure the modal has unmounted before screenshotting so we don't
  // catch a half-faded dialog over the page.
  await page
    .waitForFunction(() => !document.querySelector(".review-form-sheet"), null, { timeout: 3000 })
    .catch(() => {});
  await page.waitForTimeout(300);
  await scrollTo(page, ".plan-stage-confirmed");
  await shoot(page, OUT_DIR, "04-traveller-review-submitted");

  // ── 05: A wider view of the page-post-submission. Reload to flush
  //   any in-flight state, then scroll to the top so the page header
  //   ("How was your time with X?" → now "REVIEW SUBMITTED") sits
  //   under the brand banner. Same review_completed status, different
  //   composition from frame 04.
  console.log("→ 05 full page view at review_completed (header + summary card)");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".plan-stage-confirmed", { timeout: 8000 });
  await page.waitForTimeout(400);
  // Scroll to the top of the inquiry-page so the header is visible
  // alongside the summary card.
  await page.evaluate(() => {
    const el = document.querySelector(".inquiry-page");
    if (el) el.scrollIntoView({ block: "start", behavior: "instant" });
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForTimeout(300);
  await shoot(page, OUT_DIR, "05-traveller-review-summary");

  // ── 06: Public companion profile picks up the new rating aggregate
  //   + the review in the recent reviews section. The badge renders
  //   when aggregate.reviewCount > 0; the reviews section renders
  //   when reviews.length > 0. Both should be present after our submission.
  console.log(`→ 06 /traveller/companions/${COMPANION_ID} — rating badge + recent review`);
  await page.goto(`${BASE}/traveller/companions/${COMPANION_ID}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".companion-rating-badge", { timeout: 8000 });
  await page.waitForSelector(".companion-reviews", { timeout: 6000 });
  await page.waitForTimeout(400);
  await scrollTo(page, ".companion-rating-badge");
  await shoot(page, OUT_DIR, "06-companion-profile-with-rating");

  // ── 07: Close-up of the most-recent review card. Scroll the first
  //   .companion-reviews-item to the top of the viewport so the score
  //   + travellerLabel + comment sit together near the top edge.
  console.log("→ 07 close-up of the review card (.companion-reviews-item)");
  await page.evaluate(() => {
    const item = document.querySelector(".companion-reviews-item");
    if (item) item.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await page.waitForTimeout(400);
  await shoot(page, OUT_DIR, "07-companion-profile-review-card-detail");

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
