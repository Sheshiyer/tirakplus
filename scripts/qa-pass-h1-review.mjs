#!/usr/bin/env node
/**
 * qa-pass-h1-review.mjs — Mobile (390×844) visual review of Pass H1 (inquiry creation).
 *
 * Walks the discovery → profile detail → send inquiry → inbox flow:
 *   1. /traveller/discovery — first companion card visible
 *   2. /traveller/companions/cmp-aura — profile detail
 *   3. Scroll to "Send inquiry" CTA in the action row
 *   4. Modal open — empty form
 *   5. Modal filled — preferredWindow + message + privacy checked
 *   6. Modal submitted — success status visible
 *   7. /traveller/inbox — new inquiry at top of list
 *   8. /traveller/inbox/<id> — detail view with timeline
 *
 * Resets state before the run by cancelling any pending inquiries via DELETE.
 *
 * Saves to: generated/qa-screenshots/pass-h1-review-<YYYYMMDD>/
 *
 * Run:  node scripts/qa-pass-h1-review.mjs
 */

import { chromium } from "playwright";
import { mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const BASE = "http://localhost:8787";
const TODAY = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const OUT_DIR = `generated/qa-screenshots/pass-h1-review-${TODAY}`;
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

  console.log("→ Reset state: cancel any existing inquiries");
  const sess = await page.evaluate(async () => {
    const r = await fetch("/api/session", { credentials: "include" });
    return (await r.json()).data;
  });
  const csrf = sess?.csrfToken;
  if (!csrf) throw new Error("Could not get CSRF token from /api/session");

  await page.evaluate(async (token) => {
    const listResponse = await fetch("/api/traveller/inquiries", { credentials: "include" });
    const listJson = await listResponse.json();
    const inquiries = listJson?.data?.results ?? [];
    for (const inquiry of inquiries) {
      // Only cancel ones that aren't already cancelled or completed
      if (inquiry.status === "cancelled" || inquiry.status === "completed") continue;
      await fetch(`/api/traveller/inquiries/${inquiry.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "X-Tirak-CSRF": token },
      });
    }
  }, csrf);

  // ── 01: discovery page ───────────────────────────────────────────
  console.log("→ 01 /traveller/discovery");
  await page.goto(`${BASE}/traveller/discovery`, { waitUntil: "networkidle" });
  await page.waitForSelector(".discovery-card-link", { timeout: 8000 });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await shoot(page, OUT_DIR, "01-discovery");

  // ── 02: companion profile detail ─────────────────────────────────
  console.log(`→ 02 /traveller/companions/${COMPANION_ID}`);
  await page.goto(`${BASE}/traveller/companions/${COMPANION_ID}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".profile-page", { timeout: 8000 });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await shoot(page, OUT_DIR, "02-profile-detail");

  // ── 03: scroll to Send inquiry CTA ───────────────────────────────
  console.log("→ 03 scroll to action row with Send inquiry CTA");
  await scrollTo(page, ".action-row");
  await shoot(page, OUT_DIR, "03-send-inquiry-cta");

  // ── 04: open inquiry modal ───────────────────────────────────────
  console.log("→ 04 click Send inquiry → modal opens");
  await page.locator(".action-row button:has-text('Send inquiry')").first().click();
  await page.waitForSelector("dialog.inquiry-form-sheet[open]", { timeout: 4000 });
  await page.waitForTimeout(500);
  await shoot(page, OUT_DIR, "04-modal-open");

  // ── 05: fill modal fields ────────────────────────────────────────
  console.log("→ 05 fill modal: preferredWindow + message + privacy");
  // The Input renders <input> without explicit type; first matching .field-input
  // inside the dialog is preferredWindow.
  const dialogScope = "dialog.inquiry-form-sheet";
  const preferredWindowInput = page.locator(`${dialogScope} input.field-input`).first();
  await preferredWindowInput.fill("weekend evening");

  const messageTextarea = page.locator(`${dialogScope} textarea`).first();
  await messageTextarea.fill(
    "Looking for a calm evening with thoughtful pacing — H1 review run.",
  );

  const privacyCheckbox = page.locator(`${dialogScope} input[type=checkbox]`).first();
  await privacyCheckbox.check();

  await page.waitForTimeout(300);
  await shoot(page, OUT_DIR, "05-modal-filled");

  // ── 06: submit + capture success status ──────────────────────────
  console.log("→ 06 click Send inquiry button → wait for success status");
  await page.locator(`${dialogScope} button[type=submit]`).first().click();
  // Submission triggers onSubmitted which closes the modal and sets a
  // status message on the profile page. Wait for either the modal to
  // close + status line, or capture the inflight submitted state.
  try {
    await page.waitForSelector(".companion-status-message", { timeout: 4000 });
  } catch {
    // Fall through; we'll still capture whatever is visible.
  }
  await page.waitForTimeout(500);
  await shoot(page, OUT_DIR, "06-modal-submitted");

  // ── 07: traveller inbox shows new inquiry ────────────────────────
  console.log("→ 07 /traveller/inbox — list with new inquiry at top");
  await page.goto(`${BASE}/traveller/inbox`, { waitUntil: "networkidle" });
  await page.waitForSelector(".inquiry-summary-card", { timeout: 8000 });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await shoot(page, OUT_DIR, "07-inbox-with-inquiry");

  // ── 08: inquiry detail with timeline ─────────────────────────────
  console.log("→ 08 open inquiry detail");
  await page.locator(".inquiry-summary-card a:has-text('Open thread')").first().click();
  await page.waitForLoadState("networkidle");
  // Detail page renders the inquiry; wait for any heading to settle.
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await shoot(page, OUT_DIR, "08-inquiry-detail");

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
