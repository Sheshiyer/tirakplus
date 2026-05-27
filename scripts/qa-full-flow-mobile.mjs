#!/usr/bin/env node
/**
 * qa-full-flow-mobile.mjs — Mobile (390×844) screenshot walkthrough of
 * every meaningful screen, ordered for stitching into an MP4 sequence.
 *
 * Stops IMMEDIATELY on the first error so they can be fixed before the
 * walk continues. Error checks per step:
 *   - HTTP status of the main navigation
 *   - Console errors (filtered for browser-extension noise)
 *   - Failed network requests for app-owned URLs (skip 3rd-party)
 *   - Critical element presence on selected pages
 *
 * Saves to: generated/qa-screenshots/full-flow-mobile-<YYYYMMDD>/
 *
 * Run:  node scripts/qa-full-flow-mobile.mjs
 */

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BASE = "http://localhost:8787";
const OUT_DIR = "generated/qa-screenshots/full-flow-mobile-20260526";
const VIEWPORT = { width: 390, height: 844 };

// --- Console / network noise filter -----------------------------------
// Browser-extension chatter we saw in earlier console captures.
const IGNORE_CONSOLE_PATTERNS = [
  /runtime\.lastError/i,
  /FrameDoesNotExistError/i,
  /back\/forward cache/i,
  /message channel is closed/i,
  /message port closed/i,
];
const IGNORE_NETWORK_HOSTS = [
  "api.fontshare.com",   // font CDN, allowed by CSP but external
  "cdn.fontshare.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
];

function isIgnorableConsoleMessage(text) {
  return IGNORE_CONSOLE_PATTERNS.some((re) => re.test(text));
}
function isIgnorableNetworkUrl(url) {
  return IGNORE_NETWORK_HOSTS.some((host) => url.includes(host));
}

// --- Step plan --------------------------------------------------------
// Each step: { id, url, name, waitFor?, before?, after? }
//   id     numeric prefix for sortable filenames
//   url    path under BASE (or full URL for /api/dev/login)
//   name   suffix slug for filename
//   waitFor  optional selector to wait for before snapshot (in addition
//            to network idle + 1s settle)
//   before / after  optional async fns({page, context}) for interaction
//                   (typing, clicking chips, etc.)

const steps = [
  // ===== 00x — Public brand intro =====
  { id: "001", url: "/", name: "public-muse-landing",
    waitFor: "h1" },
  { id: "003", url: "/discovery", name: "public-discovery-hero",
    waitFor: "h1" },
  { id: "004", url: "/safety", name: "public-safety-hero",
    waitFor: "h1" },

  // ===== 01x — Muse chat guided flow (interactive) =====
  // The muse-entry page tracks state per-tab — same page hit multiple times.
  // We use one page session and interact, capturing each turn.
  { id: "010", url: "/", name: "muse-chat-arrival-anonymous",
    waitFor: "h1" },
  { id: "011", url: null, name: "muse-chat-turn-1-after-chip",
    waitFor: ".muse-message-user",
    async before({ page }) {
      // Tap the first visible suggestion chip — whatever it says.
      // Server then returns role-aware response + new chips.
      const chip = page.locator(".muse-suggestion").first();
      await chip.waitFor({ state: "visible", timeout: 5000 });
      await chip.click();
      // Wait for the user message to appear in the transcript
      await page.locator(".muse-message-user").first().waitFor({ state: "visible", timeout: 8000 });
      // Then wait for the Muse response (could be slow due to NIM)
      await page.locator(".muse-message-muse").last().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(800);
    } },
  { id: "012", url: null, name: "muse-chat-turn-2-after-chip",
    waitFor: ".muse-message-user",
    async before({ page }) {
      // After turn 1, new chips are visible. Tap the first one.
      const chip = page.locator(".muse-suggestion").first();
      if (await chip.isVisible({ timeout: 3000 }).catch(() => false)) {
        const beforeCount = await page.locator(".muse-message-user").count();
        await chip.click();
        // Wait for one more user message to appear
        await page.waitForFunction(
          (n) => document.querySelectorAll(".muse-message-user").length > n,
          beforeCount,
          { timeout: 15000 },
        );
        await page.waitForTimeout(800);
      }
    } },
  { id: "013", url: null, name: "muse-chat-turn-3-final-before-auth",
    waitFor: ".muse-message-user",
    async before({ page }) {
      const chip = page.locator(".muse-suggestion").first();
      if (await chip.isVisible({ timeout: 3000 }).catch(() => false)) {
        const beforeCount = await page.locator(".muse-message-user").count();
        await chip.click();
        await page.waitForFunction(
          (n) => document.querySelectorAll(".muse-message-user").length > n,
          beforeCount,
          { timeout: 15000 },
        );
        await page.waitForTimeout(800);
      }
    } },
  { id: "014", url: null, name: "muse-inline-auth-mounts",
    // After 3 chip turns, MuseInlineAuth widget should be visible
    waitFor: ".muse-inline-auth, [aria-label*='Sign in inside Muse']" },

  // ===== 02x — Standalone Auth pages (for documentation) =====
  { id: "020", url: "/auth/start", name: "auth-start-role-step",
    waitFor: ".auth-role-grid, h1",
    async before({ context }) {
      // Clear any session cookie so we always land on the role step
      await context.clearCookies();
    } },
  { id: "021", url: "/auth/start?role=traveller", name: "auth-start-email-step-traveller",
    waitFor: ".field-input, h1" },
  { id: "022", url: "/auth/verify", name: "auth-verify-otp-grid",
    waitFor: ".code-input, h1" },

  // ===== 030 — Dev login shortcut =====
  { id: "030", url: "/dev/login", name: "dev-login-role-cards",
    waitFor: ".auth-role-grid, h1" },

  // ===== 04x — Traveller logged-in walk =====
  { id: "040", url: "/api/dev/login?role=traveller", name: "dev-login-redirect-traveller",
    // The dev/login endpoint 302-redirects to /traveller; Playwright follows it.
    // After this, all subsequent /traveller/* routes work without re-auth.
    waitFor: "main, .member-page",
    skipScreenshot: true },
  { id: "040", url: "/traveller/dashboard", name: "traveller-dashboard",
    waitFor: ".member-hero, h1" },
  { id: "042", url: "/traveller/discovery", name: "traveller-discovery",
    waitFor: ".discovery-results-grid, .filter-panel, h1" },
  { id: "045", url: "/traveller/inbox", name: "traveller-inbox",
    waitFor: ".inquiry-heading, h1" },
  { id: "047", url: "/traveller/plans", name: "traveller-plans",
    waitFor: "main, h1" },
  { id: "049", url: "/traveller/safety", name: "traveller-safety",
    waitFor: "main, h1" },
  { id: "050", url: "/traveller/account", name: "traveller-account",
    waitFor: ".account-page, h1" },

  // ===== 06x — Companion logged-in walk =====
  { id: "059", url: "/api/dev/login?role=companion", name: "dev-login-redirect-companion",
    waitFor: "main, .companion-page",
    skipScreenshot: true },
  { id: "060", url: "/companion/dashboard", name: "companion-dashboard",
    waitFor: ".companion-hero, h1" },
  { id: "061", url: "/companion/onboarding", name: "companion-onboarding",
    waitFor: ".companion-workflow-grid, h1" },
  { id: "062", url: "/companion/profile", name: "companion-profile-manager",
    waitFor: ".companion-editor-grid, h1" },
  { id: "063", url: "/companion/plans", name: "companion-availability",
    waitFor: "main, h1" },
  { id: "064", url: "/companion/inbox", name: "companion-inbox",
    waitFor: ".companion-hero, h1" },
  { id: "066", url: "/companion/safety", name: "companion-safety",
    waitFor: ".companion-hero, h1" },
  { id: "067", url: "/companion/account", name: "companion-account",
    waitFor: ".account-page, h1" },
];

// --- Runner -----------------------------------------------------------
async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,            // retina-quality screenshots
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (isIgnorableConsoleMessage(text)) return;
    consoleErrors.push({ text, location: msg.location?.()?.url });
  });

  const networkFailures = [];
  page.on("requestfailed", (req) => {
    const url = req.url();
    if (isIgnorableNetworkUrl(url)) return;
    networkFailures.push({ url, failure: req.failure()?.errorText });
  });
  page.on("response", (resp) => {
    const url = resp.url();
    const status = resp.status();
    if (status >= 400 && !isIgnorableNetworkUrl(url)) {
      networkFailures.push({ url, status });
    }
  });

  const results = [];
  for (const step of steps) {
    const stepId = `${step.id}-${step.name}`;
    process.stdout.write(`→ ${stepId} ... `);

    consoleErrors.length = 0;
    networkFailures.length = 0;

    try {
      if (step.url) {
        const target = step.url.startsWith("http") || step.url.startsWith("/api/")
          ? new URL(step.url, BASE).toString()
          : new URL(step.url, BASE).toString();
        const resp = await page.goto(target, { waitUntil: "networkidle", timeout: 15000 });
        const status = resp?.status() ?? 0;
        if (status >= 400) {
          throw new Error(`Page load HTTP ${status} at ${target}`);
        }
      }

      if (step.before) await step.before({ page, context });

      if (step.waitFor) {
        // Wait for at least one of the selectors (comma-separated list)
        const selectors = step.waitFor.split(",").map((s) => s.trim());
        const racing = selectors.map((sel) =>
          page.locator(sel).first().waitFor({ state: "visible", timeout: 5000 }),
        );
        await Promise.any(racing).catch(() => {
          throw new Error(`waitFor selector did not appear: ${step.waitFor}`);
        });
      }

      await page.waitForTimeout(800); // settle

      // Check for app-relevant errors
      if (networkFailures.length > 0) {
        const appFailures = networkFailures.filter((f) => f.url.startsWith(BASE));
        if (appFailures.length > 0) {
          throw new Error(`Network failures: ${appFailures.map((f) => `${f.status ?? f.failure} ${f.url}`).join(", ")}`);
        }
      }
      if (consoleErrors.length > 0) {
        throw new Error(`Console errors: ${consoleErrors.map((e) => e.text).join(" | ")}`);
      }

      if (!step.skipScreenshot) {
        const filename = join(OUT_DIR, `${stepId}.png`);
        await page.screenshot({ path: filename, fullPage: true });
        results.push({ id: stepId, status: "ok", file: filename });
        process.stdout.write(`✓ saved\n`);
      } else {
        results.push({ id: stepId, status: "ok-no-shot" });
        process.stdout.write(`✓ (no screenshot)\n`);
      }
    } catch (error) {
      results.push({ id: stepId, status: "fail", error: String(error?.message || error) });
      process.stdout.write(`✗ FAILED\n`);
      console.error(`\nFAILED at ${stepId}:`);
      console.error(`  Error: ${error?.message || error}`);
      if (consoleErrors.length) console.error(`  Console: ${JSON.stringify(consoleErrors)}`);
      if (networkFailures.length) console.error(`  Network: ${JSON.stringify(networkFailures)}`);
      // Save a debug screenshot of the failure state if possible
      try {
        const failShot = join(OUT_DIR, `_FAILED-${stepId}.png`);
        await page.screenshot({ path: failShot, fullPage: true });
        console.error(`  Debug screenshot: ${failShot}`);
      } catch {}
      break;
    }
  }

  await browser.close();

  // Write a JSON report alongside
  const report = {
    runAt: new Date().toISOString(),
    base: BASE,
    viewport: VIEWPORT,
    totalSteps: steps.length,
    completedSteps: results.filter((r) => r.status === "ok" || r.status === "ok-no-shot").length,
    failed: results.filter((r) => r.status === "fail"),
    steps: results,
  };
  await writeFile(join(OUT_DIR, "_report.json"), JSON.stringify(report, null, 2));

  const failed = report.failed.length;
  if (failed > 0) {
    console.error(`\n✗ STOPPED with ${failed} failure(s) — see ${OUT_DIR}/_report.json`);
    process.exit(1);
  }
  console.log(`\n✓ All ${results.length} steps OK. Saved to ${OUT_DIR}/`);
}

run().catch((err) => {
  console.error("Runner crashed:", err);
  process.exit(2);
});
