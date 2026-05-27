#!/usr/bin/env node
/**
 * qa-pass-e-review.mjs — Mobile (390×844) visual review of Pass E.
 *
 * Walks the AccountSettings page through every interactive state:
 *   1. Initial load (fresh KV state — clear ACCOUNT_DATA before run if needed)
 *   2. Preferences card — toggle showEmailInAccount + allowRoleSwitch OFF + Save
 *   3. Header now shows "Email hidden by your preferences" + Switch button disabled
 *   4. Data export card — Request export → status: queued
 *   5. Deletion card — Delete my account → form opens → type DELETE → Submit
 *   6. Deletion card — pending state with countdown + Cancel
 *   7. Safety reports card — New safety report form + submit
 *
 * Saves to: generated/qa-screenshots/pass-e-review-<YYYYMMDD>/
 *
 * Run:  node scripts/qa-pass-e-review.mjs
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = "http://localhost:8787";
const TODAY = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const OUT_DIR = `generated/qa-screenshots/pass-e-review-${TODAY}`;
const VIEWPORT = { width: 390, height: 844 };

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

  console.log("→ Dev login as traveller");
  await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });

  console.log("→ Reset KV state to defaults (prev test runs leave state)");
  // PATCH privacy + cancel any pending deletion so the review starts fresh.
  // Grab the CSRF token from /api/session first.
  const sess = await page.evaluate(async () => {
    const r = await fetch("/api/session", { credentials: "include" });
    return (await r.json()).data;
  });
  const csrf = sess?.csrfToken;
  if (!csrf) throw new Error("Could not get CSRF token from /api/session");
  await page.evaluate(async (token) => {
    // Reset privacy to all-true defaults
    await fetch("/api/account/privacy", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-Tirak-CSRF": token },
      body: JSON.stringify({
        showEmailInAccount: true,
        allowRoleSwitch: true,
        receiveSafetyUpdates: true,
        receiveInquiryUpdates: true,
      }),
    });
    // Cancel any pending deletion
    await fetch("/api/account/deletion", {
      method: "DELETE",
      credentials: "include",
      headers: { "X-Tirak-CSRF": token },
    });
  }, csrf);

  console.log("→ /traveller/account");
  await page.goto(`${BASE}/traveller/account`, { waitUntil: "networkidle" });
  await page.waitForSelector(".account-control-card", { timeout: 8000 });
  await page.waitForTimeout(800);

  console.log("→ 01 page top");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await shoot(page, OUT_DIR, "01-account-top");

  console.log("→ 02 preferences card (default state)");
  await scrollTo(page, ".account-control-preferences");
  await shoot(page, OUT_DIR, "02-preferences-default");

  console.log("→ 03 toggle showEmailInAccount + allowRoleSwitch OFF");
  const checkboxes = await page.locator(".account-control-preferences input[type=checkbox]").all();
  // Defensive: only toggle if currently checked
  for (let i = 0; i < 2; i++) {
    const isChecked = await checkboxes[i].isChecked();
    if (isChecked) await checkboxes[i].uncheck();
  }
  await page.waitForTimeout(300);
  await shoot(page, OUT_DIR, "03-preferences-toggled-pre-save");

  console.log("→ 04 click Save preferences");
  const saveBtn = page.locator(".account-control-preferences button").first();
  await saveBtn.click();
  await page.waitForTimeout(500);
  await shoot(page, OUT_DIR, "04-preferences-saving");
  await page.waitForTimeout(1500);

  console.log("→ 05 scroll back to top to verify Email hidden + Switch disabled");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(300);
  await shoot(page, OUT_DIR, "05-top-after-toggles-saved");

  console.log("→ 06 data export card (default)");
  await scrollTo(page, ".account-control-export");
  await shoot(page, OUT_DIR, "06-data-export-default");

  console.log("→ 07 request data export");
  const exportBtn = page.locator(".account-control-export button").first();
  const isDisabled = await exportBtn.isDisabled();
  if (!isDisabled) {
    await exportBtn.click();
    await page.waitForTimeout(1200);
  }
  await shoot(page, OUT_DIR, "07-data-export-after-request");

  console.log("→ 08 deletion card (default)");
  await scrollTo(page, ".account-control-deletion");
  await shoot(page, OUT_DIR, "08-deletion-default");

  console.log("→ 09 open deletion form");
  await page.locator(".account-control-deletion button:has-text('Delete my account')").first().click();
  await page.waitForTimeout(400);
  await shoot(page, OUT_DIR, "09-deletion-form-open");

  console.log("→ 10 type wrong confirmation");
  // <Input> renders <input> without explicit type — match by tag, exclude textarea
  const confirmInput = page.locator(".account-control-deletion input.field-input").first();
  await confirmInput.fill("delete");
  await page.waitForTimeout(300);
  await shoot(page, OUT_DIR, "10-deletion-wrong-confirmation");

  console.log("→ 11 type correct DELETE confirmation");
  await confirmInput.fill("");
  await confirmInput.fill("DELETE");
  await page.waitForTimeout(300);
  await shoot(page, OUT_DIR, "11-deletion-correct-confirmation");

  console.log("→ 12 submit deletion");
  await page.locator(".account-control-deletion button:has-text('Delete account')").first().click();
  await page.waitForTimeout(1500);
  await shoot(page, OUT_DIR, "12-deletion-pending-countdown");

  console.log("→ 13 cancel deletion");
  await page.locator(".account-control-deletion button:has-text('Cancel deletion')").first().click();
  await page.waitForTimeout(1500);
  await shoot(page, OUT_DIR, "13-deletion-cancelled");

  console.log("→ 14 safety reports card");
  await scrollTo(page, ".account-control-safety");
  await shoot(page, OUT_DIR, "14-safety-reports-list");

  console.log("→ 15 new safety report form");
  await page.locator(".account-control-safety button:has-text('New safety report')").first().click();
  await page.waitForTimeout(400);
  await shoot(page, OUT_DIR, "15-safety-report-form");

  console.log("→ 16 fill + submit safety report");
  const summary = page.locator(".account-control-safety textarea").first();
  await summary.fill("Visual review test: confirming the safety report submission flow works end to end from the AccountSettings card.");
  await page.waitForTimeout(300);
  await shoot(page, OUT_DIR, "16-safety-report-filled");
  await page.locator(".account-control-safety button:has-text('Submit report')").first().click();
  await page.waitForTimeout(1500);
  await shoot(page, OUT_DIR, "17-safety-report-after-submit");

  console.log("→ 18 reset preferences (re-enable both toggles)");
  await scrollTo(page, ".account-control-preferences");
  const re = await page.locator(".account-control-preferences input[type=checkbox]").all();
  for (let i = 0; i < 2; i++) {
    const isChecked = await re[i].isChecked();
    if (!isChecked) await re[i].check();
  }
  await page.locator(".account-control-preferences button").first().click();
  await page.waitForTimeout(1500);
  await shoot(page, OUT_DIR, "18-preferences-reset");

  await browser.close();

  console.log(`\n✓ Captured 18 screenshots to ${OUT_DIR}/`);
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
