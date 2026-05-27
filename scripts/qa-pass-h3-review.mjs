#!/usr/bin/env node
/**
 * qa-pass-h3-review.mjs — Mobile (390×844) visual review of Pass H3
 * (date negotiation: traveller proposes 2-3 windows → companion picks
 * one → traveller confirms).
 *
 * Walks the full traveller↔companion date negotiation round-trip:
 *   01. /traveller/inbox — auto-routed inquiry visible at top (status
 *       "routed").
 *   02. /traveller/inbox/<id> — detail view shows "routed" + nextStep.
 *   03. Switch role → companion. /companion/inbox/<id> — companion
 *       detail with Accept/Decline buttons.
 *   04. Click Accept — post-decision "accepted on..." panel.
 *   05. Switch role → traveller. /traveller/inbox/<id> — shows the
 *       "Propose dates" CTA card.
 *   06. Click "Propose dates" — DateWindowPicker form opens.
 *   07. Fill 2 windows (tomorrow + day after, 18:00-20:00 Bangkok).
 *   08. Submit windows — status flips to date_pending; read-only list
 *       of proposed windows visible.
 *   09. Switch role → companion. /companion/inbox/<id> —
 *       WindowSelectionView visible with 2 radio options.
 *   10. Select the first window + submit — status flips to date_proposed.
 *   11. Switch role → traveller. /traveller/inbox/<id> — ConfirmPlanView
 *       visible with the picked window.
 *   12. Click "Confirm plan" — date_confirmed summary card.
 *   13. Switch role → companion. /companion/inbox/<id> — confirmed plan
 *       card visible (both sides see the confirmed plan).
 *
 * Resets traveller state before the run by cancelling any pre-existing
 * inquiries via DELETE, then creates a fresh routed inquiry via POST so
 * the walkthrough starts from a clean baseline (mirrors H2 pattern but
 * skips the InquiryFormSheet because H3 starts post-routing).
 *
 * Saves to: generated/qa-screenshots/pass-h3-review-<YYYYMMDD>/
 *
 * Run:  node scripts/qa-pass-h3-review.mjs
 */

import { chromium } from "playwright";
import { mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const BASE = "http://localhost:8787";
const TODAY = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const OUT_DIR = `generated/qa-screenshots/pass-h3-review-${TODAY}`;
const VIEWPORT = { width: 390, height: 844 };
const COMPANION_ID = "cmp-aura";

const IGNORE_CONSOLE = [
  /runtime\.lastError/i,
  /FrameDoesNotExistError/i,
  /back\/forward cache/i,
  /message channel is closed/i,
  /message port closed/i,
  // H3.T10: cancelAllTravellerInquiries() best-effort loops over every
  // active inquiry and fires DELETE. The server only honors cancel from
  // submitted/under_review/routed → anything in accepted/date_pending/
  // date_proposed/date_confirmed/declined returns 409. Browser console
  // logs the failed network request even though we deliberately ignore
  // the response. Filter to keep error reporting signal-only.
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
            "H3 review walkthrough — capturing the full date negotiation round-trip.",
          privacyAcknowledged: true,
        }),
      });
      const json = await response.json();
      return json?.data?.inquiry?.id;
    },
    { token: csrf, cid: companionId },
  );
}

// Helpers for the DateWindowPicker form. Native HTML date/time inputs
// expect YYYY-MM-DD and HH:MM in the user's local interpretation; the
// component then re-anchors to Bangkok local time at submit. The fixed
// 18:00/20:00 pair sits inside the 1-6h duration band the server
// requires (see booking-store.ts validation).
function isoDateOffset(daysFromNow) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
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

  // ── Dev login as traveller; clear pre-existing inquiries; create
  //    a fresh routed inquiry to anchor the rest of the walkthrough.
  //    Skipping the InquiryFormSheet (H2 territory) keeps this script
  //    focused on the H3 plan UI surfaces.
  console.log("→ Dev login as traveller");
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });
  const travellerCsrf = await getCsrf(page);
  console.log("→ Reset state: cancel any existing traveller inquiries");
  await cancelAllTravellerInquiries(page, travellerCsrf);

  console.log("→ Create a fresh routed inquiry via API");
  const inquiryId = await createRoutedInquiry(page, travellerCsrf, COMPANION_ID);
  if (!inquiryId) throw new Error("Could not create routed inquiry");
  console.log(`   → captured inquiry id: ${inquiryId}`);

  // ── 01: Traveller inbox shows routed inquiry ─────────────────────
  console.log("→ 01 /traveller/inbox — routed inquiry at top");
  await page.goto(`${BASE}/traveller/inbox`, { waitUntil: "networkidle" });
  await page.waitForSelector(".inquiry-summary-card", { timeout: 8000 });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await shoot(page, OUT_DIR, "01-traveller-routed-inquiry");

  // ── 02: Traveller detail (routed) ─────────────────────────────────
  console.log(`→ 02 /traveller/inbox/${inquiryId} — detail with status=routed`);
  await page.goto(`${BASE}/traveller/inbox/${inquiryId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".inquiry-success-panel", { timeout: 8000 });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await shoot(page, OUT_DIR, "02-traveller-detail-routed");

  // ── Switch role to companion ──────────────────────────────────────
  console.log("→ Switch role to companion (dev login)");
  await page.goto(`${BASE}/api/dev/login?role=companion`, { waitUntil: "networkidle" });

  // ── 03: Companion detail (routed) with Accept/Decline ────────────
  // Skip the inbox list (synthetic-email mismatch means routed inquiry
  // doesn't appear there — same caveat as H2.T9). Navigate direct.
  console.log(`→ 03 /companion/inbox/${inquiryId} — detail with Accept/Decline`);
  await page.goto(`${BASE}/companion/inbox/${inquiryId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".companion-inquiry-detail-page", { timeout: 8000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".companion-decision-panel");
  await shoot(page, OUT_DIR, "03-companion-detail-routed");

  // ── 04: Companion accepts ─────────────────────────────────────────
  console.log("→ 04 click Accept — companion-decision-accepted panel");
  await page.locator(".companion-decision-panel button:has-text('Accept')").first().click();
  await page.waitForSelector(".companion-decision-accepted", { timeout: 6000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".companion-decision-accepted");
  await shoot(page, OUT_DIR, "04-companion-accepted");

  // ── Switch role back to traveller ─────────────────────────────────
  console.log("→ Switch role back to traveller (dev login)");
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });

  // ── 05: Traveller detail (accepted) shows "Propose dates" CTA ────
  console.log(`→ 05 /traveller/inbox/${inquiryId} — accepted + Propose dates CTA`);
  await page.goto(`${BASE}/traveller/inbox/${inquiryId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".inquiry-success-panel", { timeout: 8000 });
  await page.waitForSelector(".plan-stage-cta", { timeout: 6000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".plan-stage-cta");
  await shoot(page, OUT_DIR, "05-traveller-detail-accepted");

  // ── 06: Click "Propose dates" — DateWindowPicker opens ───────────
  console.log("→ 06 click Propose dates — DateWindowPicker visible");
  await page.locator(".plan-stage-cta button:has-text('Propose dates')").first().click();
  await page.waitForSelector(".date-window-picker", { timeout: 4000 });
  await page.waitForTimeout(300);
  await scrollTo(page, ".date-window-picker");
  await shoot(page, OUT_DIR, "06-traveller-windows-form-open");

  // ── 07: Fill 2 windows (tomorrow + day after, 18:00-20:00) ───────
  console.log("→ 07 fill 2 windows (tomorrow + day after, 18:00-20:00)");
  const date1 = isoDateOffset(1);
  const date2 = isoDateOffset(2);
  // Each card has its own .field-input set; we target by row index via
  // the .date-window-card list. The label-less type=date/time inputs
  // are children of .field — first 3 inputs per card are date, start,
  // end; the 4th is the optional note.
  const cards = page.locator(".date-window-card");
  // Card 1
  const card1 = cards.nth(0);
  await card1.locator("input[type=date]").fill(date1);
  await card1.locator("input[type=time]").nth(0).fill("18:00");
  await card1.locator("input[type=time]").nth(1).fill("20:00");
  // Card 2
  const card2 = cards.nth(1);
  await card2.locator("input[type=date]").fill(date2);
  await card2.locator("input[type=time]").nth(0).fill("18:00");
  await card2.locator("input[type=time]").nth(1).fill("20:00");
  await page.waitForTimeout(300);
  await scrollTo(page, ".date-window-picker");
  await shoot(page, OUT_DIR, "07-traveller-windows-filled");

  // ── 08: Submit windows — status flips to date_pending ────────────
  console.log("→ 08 submit windows → status=date_pending + read-only list");
  await page.locator(".date-window-picker-actions button:has-text('Submit windows')").first().click();
  // After submit, TravellerInquiryDetailPage rerenders with the
  // "Waiting on companion" panel + .plan-window-readonly-list.
  await page.waitForSelector(".plan-window-readonly-list", { timeout: 6000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".plan-stage-cta");
  await shoot(page, OUT_DIR, "08-traveller-windows-submitted");

  // ── Switch role to companion ──────────────────────────────────────
  console.log("→ Switch role to companion (dev login)");
  await page.goto(`${BASE}/api/dev/login?role=companion`, { waitUntil: "networkidle" });

  // ── 09: Companion sees WindowSelectionView (2 radio options) ─────
  console.log(`→ 09 /companion/inbox/${inquiryId} — WindowSelectionView (2 radios)`);
  await page.goto(`${BASE}/companion/inbox/${inquiryId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".companion-inquiry-detail-page", { timeout: 8000 });
  await page.waitForSelector(".window-selection-view", { timeout: 6000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".window-selection-view");
  await shoot(page, OUT_DIR, "09-companion-window-selection");

  // ── 10: Pick first window + submit ───────────────────────────────
  console.log("→ 10 pick first window + submit → status=date_proposed");
  await page.locator(".window-selection-view input[type=radio]").first().check();
  await page.waitForTimeout(200);
  await page.locator(".window-selection-actions button:has-text('Pick this window')").first().click();
  // Post-submit, the page shows "Waiting for traveller to confirm" with
  // the picked window in a read-only list.
  await page.waitForSelector(".plan-window-readonly-list", { timeout: 6000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".plan-stage-cta");
  await shoot(page, OUT_DIR, "10-companion-selected");

  // ── Switch role back to traveller ─────────────────────────────────
  console.log("→ Switch role back to traveller (dev login)");
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });

  // ── 11: Traveller sees ConfirmPlanView ───────────────────────────
  console.log(`→ 11 /traveller/inbox/${inquiryId} — ConfirmPlanView visible`);
  await page.goto(`${BASE}/traveller/inbox/${inquiryId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".inquiry-success-panel", { timeout: 8000 });
  await page.waitForSelector(".confirm-plan-view", { timeout: 6000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".confirm-plan-view");
  await shoot(page, OUT_DIR, "11-traveller-confirm-form");

  // ── 12: Click "Confirm plan" — status=date_confirmed ─────────────
  console.log("→ 12 click Confirm plan → date_confirmed summary card");
  await page.locator(".confirm-plan-view-actions button:has-text('Confirm plan')").first().click();
  await page.waitForSelector(".plan-stage-confirmed", { timeout: 6000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".plan-stage-confirmed");
  await shoot(page, OUT_DIR, "12-traveller-confirmed");

  // ── Switch role to companion ──────────────────────────────────────
  console.log("→ Switch role to companion (dev login)");
  await page.goto(`${BASE}/api/dev/login?role=companion`, { waitUntil: "networkidle" });

  // ── 13: Companion sees confirmed plan card ────────────────────────
  console.log(`→ 13 /companion/inbox/${inquiryId} — confirmed plan card`);
  await page.goto(`${BASE}/companion/inbox/${inquiryId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".companion-inquiry-detail-page", { timeout: 8000 });
  await page.waitForSelector(".plan-stage-confirmed", { timeout: 6000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".plan-stage-confirmed");
  await shoot(page, OUT_DIR, "13-companion-confirmed");

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
