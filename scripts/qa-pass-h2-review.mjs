#!/usr/bin/env node
/**
 * qa-pass-h2-review.mjs — Mobile (390×844) visual review of Pass H2
 * (companion accept/decline + traveller polling refresh).
 *
 * Walks the full traveller↔companion round-trip:
 *   01. Traveller submits an inquiry via InquiryFormSheet on
 *       /traveller/companions/cmp-aura — modal opens (filled).
 *   02. /traveller/inbox — new inquiry visible at top with status="routed".
 *   03. /traveller/inbox/<id> — detail view shows "routed" + nextStep.
 *   04. Switch role → companion. /companion/inbox — list view.
 *       (Synthetic-email mismatch: KV-backed routed inquiry may not appear
 *        in this list; we still capture for visual evidence.)
 *   05. /companion/inbox/<id> — companion detail with Accept/Decline buttons.
 *   06. Click Decline — inline form opens with 4 radio options + notes.
 *   07. Select "Scheduling conflict" + add a note.
 *   08. Submit decline — post-decision panel shows "Declined on..." + reason
 *       + notes.
 *   09. Switch role → traveller. /traveller/inbox — status pill flipped to
 *       "declined" (page-level refresh confirms; live poll runs every 5s).
 *   10. /traveller/inbox/<id> — detail shows "declined" + decline copy.
 *
 * Resets traveller state before the run by cancelling any pre-existing
 * inquiries via DELETE.
 *
 * Saves to: generated/qa-screenshots/pass-h2-review-<YYYYMMDD>/
 *
 * Run:  node scripts/qa-pass-h2-review.mjs
 */

import { chromium } from "playwright";
import { mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const BASE = "http://localhost:8787";
const TODAY = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const OUT_DIR = `generated/qa-screenshots/pass-h2-review-${TODAY}`;
const VIEWPORT = { width: 390, height: 844 };
const COMPANION_ID = "cmp-aura";

const IGNORE_CONSOLE = [
  /runtime\.lastError/i,
  /FrameDoesNotExistError/i,
  /back\/forward cache/i,
  /message channel is closed/i,
  /message port closed/i,
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

  // ── Dev login as traveller; clear any pending inquiries ──────────
  console.log("→ Dev login as traveller");
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });
  const travellerCsrf = await getCsrf(page);
  console.log("→ Reset state: cancel any existing traveller inquiries");
  await cancelAllTravellerInquiries(page, travellerCsrf);

  // ── 01: Traveller submits inquiry from companion profile ─────────
  console.log(`→ 01 /traveller/companions/${COMPANION_ID} — open InquiryFormSheet (filled)`);
  await page.goto(`${BASE}/traveller/companions/${COMPANION_ID}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".profile-page", { timeout: 8000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".action-row");
  await page.locator(".action-row button:has-text('Send inquiry')").first().click();
  await page.waitForSelector("dialog.inquiry-form-sheet[open]", { timeout: 4000 });

  const dialogScope = "dialog.inquiry-form-sheet";
  const preferredWindowInput = page.locator(`${dialogScope} input.field-input`).first();
  await preferredWindowInput.fill("sunday brunch");
  const messageTextarea = page.locator(`${dialogScope} textarea`).first();
  await messageTextarea.fill(
    "H2 review smoke — capturing the full accept/decline walkthrough.",
  );
  const privacyCheckbox = page.locator(`${dialogScope} input[type=checkbox]`).first();
  await privacyCheckbox.check();
  await page.waitForTimeout(300);
  await shoot(page, OUT_DIR, "01-traveller-creates-inquiry");

  console.log("→ Submit the inquiry");
  await page.locator(`${dialogScope} button[type=submit]`).first().click();
  try {
    await page.waitForSelector(".companion-status-message", { timeout: 4000 });
  } catch {
    // continue regardless
  }
  await page.waitForTimeout(500);

  // ── 02: Traveller inbox shows routed inquiry ─────────────────────
  console.log("→ 02 /traveller/inbox — routed inquiry at top");
  await page.goto(`${BASE}/traveller/inbox`, { waitUntil: "networkidle" });
  await page.waitForSelector(".inquiry-summary-card", { timeout: 8000 });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await shoot(page, OUT_DIR, "02-traveller-inbox-routed");

  // Grab the inquiry id from its first link
  const inquiryHref = await page.locator(".inquiry-summary-card a:has-text('Open thread')").first().getAttribute("href");
  if (!inquiryHref) throw new Error("Could not extract inquiry id from inbox link");
  const inquiryId = inquiryHref.split("/").pop();
  console.log(`   → captured inquiry id: ${inquiryId}`);

  // ── 03: Traveller detail shows routed ────────────────────────────
  console.log(`→ 03 /traveller/inbox/${inquiryId} — detail with status=routed`);
  await page.goto(`${BASE}/traveller/inbox/${inquiryId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".inquiry-success-panel", { timeout: 8000 });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await shoot(page, OUT_DIR, "03-traveller-detail-routed");

  // ── Switch role to companion ─────────────────────────────────────
  console.log("→ Switch role to companion (dev login)");
  await page.goto(`${BASE}/api/dev/login?role=companion`, { waitUntil: "networkidle" });

  // ── 04: Companion inbox list ─────────────────────────────────────
  // Note: synthetic-email mismatch — the auto-routed inquiry is keyed
  // to the canonical companion email, while dev login uses a synthetic
  // address. The list still renders fixtures; we capture for visual
  // evidence, then navigate directly to the detail page by id.
  console.log("→ 04 /companion/inbox — list view (may not include routed id; expected)");
  await page.goto(`${BASE}/companion/inbox`, { waitUntil: "networkidle" });
  await page.waitForSelector(".companion-inbox-page", { timeout: 8000 });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await shoot(page, OUT_DIR, "04-companion-inbox");

  // ── 05: Companion detail (routed) with Accept/Decline ────────────
  console.log(`→ 05 /companion/inbox/${inquiryId} — detail with Accept/Decline buttons`);
  await page.goto(`${BASE}/companion/inbox/${inquiryId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".companion-inquiry-detail-page", { timeout: 8000 });
  await page.waitForTimeout(500);
  // Scroll to the decision panel so the action buttons are visible.
  await scrollTo(page, ".companion-decision-panel");
  await shoot(page, OUT_DIR, "05-companion-detail-routed");

  // ── 06: Open the decline form ────────────────────────────────────
  console.log("→ 06 click Decline — inline form opens");
  await page.locator(".companion-decision-panel button:has-text('Decline')").first().click();
  await page.waitForSelector(".companion-decline-form", { timeout: 4000 });
  await page.waitForTimeout(300);
  await scrollTo(page, ".companion-decline-form");
  await shoot(page, OUT_DIR, "06-companion-decline-form-open");

  // ── 07: Select reason + add notes ────────────────────────────────
  console.log("→ 07 select 'Scheduling conflict' + add notes");
  await page.locator(".companion-decline-form input[type=radio][value='schedule']").check();
  await page.locator(".companion-decline-form textarea").first().fill(
    "H2 review walkthrough — busy that weekend, will reach out later.",
  );
  await page.waitForTimeout(300);
  await shoot(page, OUT_DIR, "07-companion-decline-form-filled");

  // ── 08: Submit decline ───────────────────────────────────────────
  console.log("→ 08 submit decline → companion-decision-declined panel");
  await page.locator(".companion-decline-form button:has-text('Submit decline')").first().click();
  await page.waitForSelector(".companion-decision-declined", { timeout: 6000 });
  await page.waitForTimeout(500);
  await scrollTo(page, ".companion-decision-declined");
  await shoot(page, OUT_DIR, "08-companion-decline-submitted");

  // ── Switch role back to traveller ────────────────────────────────
  console.log("→ Switch role back to traveller (dev login)");
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });

  // ── 09: Traveller inbox shows declined ───────────────────────────
  // Live poll runs every 5s; reloading the inbox ensures the screenshot
  // captures the post-poll state immediately.
  console.log("→ 09 /traveller/inbox — declined pill (post-poll refresh)");
  await page.goto(`${BASE}/traveller/inbox`, { waitUntil: "networkidle" });
  await page.waitForSelector(".inquiry-summary-card", { timeout: 8000 });
  // Wait a little to let the polling cycle settle (covers the ~5s window).
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await shoot(page, OUT_DIR, "09-traveller-inbox-poll-update");

  // ── 10: Traveller detail shows declined ──────────────────────────
  console.log(`→ 10 /traveller/inbox/${inquiryId} — detail with status=declined`);
  await page.goto(`${BASE}/traveller/inbox/${inquiryId}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".inquiry-success-panel", { timeout: 8000 });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await shoot(page, OUT_DIR, "10-traveller-detail-declined");

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
