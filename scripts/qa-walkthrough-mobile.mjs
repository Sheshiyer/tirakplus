#!/usr/bin/env node
/**
 * qa-walkthrough-mobile.mjs — Guided-flow MOBILE walkthrough.
 *
 * Unlike qa-full-flow-mobile.mjs (which captures one fullPage poster per
 * screen), this captures viewport-only frames (390×844) and builds a frame
 * SEQUENCE per screen:
 *   • Static page → scroll-walk: top fold, mid folds, bottom fold
 *   • Interactive page → pre-tap (cursor pulse), user-msg landed, settled
 *
 * Per-frame hold durations are emitted into frames.txt so the final
 * ffmpeg concat-demuxer step produces a tutorial-paced MP4.
 *
 * Output:
 *   generated/qa-walkthrough-mobile-<YYYYMMDD>/<NNN><letter>-<slug>.png
 *   generated/qa-walkthrough-mobile-<YYYYMMDD>/frames.txt
 *   generated/qa-walkthrough-mobile-<YYYYMMDD>/walkthrough.mp4   (after ffmpeg)
 *
 * Stops IMMEDIATELY on first error (app-only console + network). Saves a
 * _FAILED-<id>.png debug shot so we can fix and re-run.
 *
 * Run:
 *   node scripts/qa-walkthrough-mobile.mjs
 *   node scripts/qa-walkthrough-mobile.mjs --no-stitch    # skip ffmpeg step
 */

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";

// --- config -----------------------------------------------------------
const BASE = "http://localhost:8787";
const TODAY = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const OUT_DIR = `generated/qa-walkthrough-mobile-${TODAY}`;
const VIEWPORT = { width: 390, height: 844 };
const DEVICE_SCALE = 2;
const SKIP_STITCH = process.argv.includes("--no-stitch");

// Per-frame hold durations (seconds) — fed into ffmpeg concat demuxer
const HOLD = {
  hero:        1.8,   // first frame of any page (lets viewer take it in)
  scrollMid:   0.35,  // intermediate scroll folds (smooth scroll feel)
  scrollLast:  0.9,   // bottom-of-page frame
  preTap:      0.6,   // cursor pulse before click
  postUserMsg: 1.0,   // right after user message lands
  postSettled: 1.4,   // after muse response fully streams in
  pageSingle:  1.6,   // short pages that fit one viewport
};

// --- noise filters ----------------------------------------------------
const IGNORE_CONSOLE = [
  /runtime\.lastError/i,
  /FrameDoesNotExistError/i,
  /back\/forward cache/i,
  /message channel is closed/i,
  /message port closed/i,
];
const IGNORE_NETWORK = [
  "api.fontshare.com",
  "cdn.fontshare.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
];
const ignoreConsole = (t) => IGNORE_CONSOLE.some((re) => re.test(t));
const ignoreNetwork = (u) => IGNORE_NETWORK.some((h) => u.includes(h));

// --- helpers ----------------------------------------------------------

/**
 * Smooth-scroll a page top → bottom in stride-sized steps, taking a
 * viewport-only screenshot at each stop. Returns the frame manifest
 * entries so the caller can compose them into the global frames.txt.
 */
async function scrollWalk(page, { stepId, slug, outDir }) {
  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = VIEWPORT.height;
  const frames = [];

  // Always start at top
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(150);

  if (totalHeight <= vh + 80) {
    // page fits — one frame
    const file = `${stepId}a-${slug}.png`;
    await page.screenshot({ path: join(outDir, file) });
    frames.push({ file, hold: HOLD.pageSingle });
    return frames;
  }

  // Stride = 72% of viewport so there's continuity between folds
  const stride = Math.floor(vh * 0.72);
  const positions = [];
  let y = 0;
  while (y < totalHeight - vh) {
    positions.push(y);
    y += stride;
  }
  positions.push(totalHeight - vh); // ensure final position is exactly bottom

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      pos,
    );
    await page.waitForTimeout(180); // let lazy-load / sticky shadows settle
    const letter = String.fromCharCode(97 + i); // a, b, c, …
    const file = `${stepId}${letter}-${slug}.png`;
    await page.screenshot({ path: join(outDir, file) });
    const hold =
      i === 0 ? HOLD.hero
      : i === positions.length - 1 ? HOLD.scrollLast
      : HOLD.scrollMid;
    frames.push({ file, hold });
  }

  return frames;
}

/**
 * Inject a CSS pulse overlay at the locator's center, hold ~350ms,
 * then return. Used right before clicking so the resulting video shows
 * the viewer where the action is about to happen.
 */
async function cursorPulse(page, locator) {
  const box = await locator.boundingBox();
  if (!box) return;
  const x = Math.round(box.x + box.width / 2);
  const y = Math.round(box.y + box.height / 2);

  await page.evaluate(({ x, y }) => {
    // Idempotent style injection
    if (!document.querySelector("style[data-qa-cursor]")) {
      const style = document.createElement("style");
      style.setAttribute("data-qa-cursor", "");
      style.textContent = `
        @keyframes qaPulse {
          0%   { transform: scale(0.4); opacity: 0; }
          35%  { transform: scale(1);   opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .qa-cursor-pulse {
          position: fixed; width: 56px; height: 56px;
          border-radius: 50%;
          background: rgba(185, 111, 125, 0.30);
          border: 2px solid rgba(185, 111, 125, 0.95);
          pointer-events: none; z-index: 2147483647;
          animation: qaPulse 650ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `;
      document.head.appendChild(style);
    }
    const dot = document.createElement("div");
    dot.className = "qa-cursor-pulse";
    dot.style.left = `${x - 28}px`;
    dot.style.top = `${y - 28}px`;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 800);
  }, { x, y });

  await page.waitForTimeout(350); // hold so the pulse is captured
}

// --- step plan --------------------------------------------------------
// Each step:
//   { id, name, url?, waitFor?, kind, before?, sequence? }
//
//   kind === "scroll"      → scrollWalk after navigate + waitFor
//   kind === "interaction" → sequence({ page, capture }) drives captures
//   kind === "navigate"    → no screenshot (e.g. dev/login redirect)

const steps = [
  // ===== 00x — Public marketing intro =====
  { id: "001", name: "public-muse-landing", url: "/",
    waitFor: "h1", kind: "scroll" },
  { id: "003", name: "public-discovery-hero", url: "/discovery",
    waitFor: "h1", kind: "scroll" },
  { id: "004", name: "public-safety-hero", url: "/safety",
    waitFor: "h1", kind: "scroll" },

  // ===== 01x — Muse chat guided flow =====
  // Stays on one page; each step adds chat turns or auth widget mount.
  { id: "010", name: "muse-chat-arrival", url: "/",
    waitFor: ".muse-suggestion", kind: "scroll" },
  { id: "011", name: "muse-chat-turn-1", url: null, kind: "interaction",
    async sequence({ page, capture }) {
      const chip = page.locator(".muse-suggestion").first();
      await chip.waitFor({ state: "visible", timeout: 5000 });
      await cursorPulse(page, chip);
      await capture("a", "pre-tap", HOLD.preTap);
      await chip.click();
      await page.locator(".muse-message-user").first()
        .waitFor({ state: "visible", timeout: 8000 });
      await capture("b", "user-msg", HOLD.postUserMsg);
      await page.locator(".muse-message-muse").last()
        .waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(700);
      await capture("c", "muse-reply", HOLD.postSettled);
    } },
  { id: "012", name: "muse-chat-turn-2", url: null, kind: "interaction",
    async sequence({ page, capture }) {
      const chip = page.locator(".muse-suggestion").first();
      if (!(await chip.isVisible({ timeout: 3000 }).catch(() => false))) return;
      const before = await page.locator(".muse-message-user").count();
      await cursorPulse(page, chip);
      await capture("a", "pre-tap", HOLD.preTap);
      await chip.click();
      await page.waitForFunction(
        (n) => document.querySelectorAll(".muse-message-user").length > n,
        before, { timeout: 15000 },
      );
      await capture("b", "user-msg", HOLD.postUserMsg);
      await page.waitForTimeout(900);
      await capture("c", "muse-reply", HOLD.postSettled);
    } },
  { id: "013", name: "muse-chat-turn-3", url: null, kind: "interaction",
    async sequence({ page, capture }) {
      const chip = page.locator(".muse-suggestion").first();
      if (!(await chip.isVisible({ timeout: 3000 }).catch(() => false))) return;
      const before = await page.locator(".muse-message-user").count();
      await cursorPulse(page, chip);
      await capture("a", "pre-tap", HOLD.preTap);
      await chip.click();
      await page.waitForFunction(
        (n) => document.querySelectorAll(".muse-message-user").length > n,
        before, { timeout: 15000 },
      );
      await capture("b", "user-msg", HOLD.postUserMsg);
      await page.waitForTimeout(900);
      await capture("c", "muse-reply-final", HOLD.postSettled);
    } },
  { id: "014", name: "muse-inline-auth", url: null, kind: "interaction",
    async sequence({ page, capture }) {
      // The MuseInlineAuth widget mounts after 3 chip turns. Just capture it.
      const auth = page.locator(".muse-inline-auth, [aria-label*='Sign in inside Muse']").first();
      await auth.waitFor({ state: "visible", timeout: 5000 });
      await page.waitForTimeout(500);
      await capture("a", "auth-mounts", HOLD.hero);
      // Scroll to bottom so the Send-code button is visible too
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" }));
      await page.waitForTimeout(800);
      await capture("b", "send-code-visible", HOLD.postSettled);
    } },

  // ===== 02x — Standalone auth pages (referenced for users that bypass chat) =====
  { id: "020", name: "auth-start-role", url: "/auth/start",
    waitFor: ".auth-role-grid, h1", kind: "scroll",
    async before({ context }) { await context.clearCookies(); } },
  { id: "021", name: "auth-email-traveller", url: "/auth/start?role=traveller",
    waitFor: ".field-input, h1", kind: "scroll" },
  { id: "022", name: "auth-verify-otp", url: "/auth/verify",
    waitFor: ".code-input, h1", kind: "scroll" },

  // ===== 030 — Dev login cards =====
  { id: "030", name: "dev-login-cards", url: "/dev/login",
    waitFor: ".auth-role-grid, h1", kind: "scroll" },

  // ===== 04x — Traveller logged-in =====
  { id: "039", name: "dev-login-as-traveller", url: "/api/dev/login?role=traveller",
    waitFor: "main, .member-page", kind: "navigate" },
  { id: "040", name: "traveller-dashboard", url: "/traveller/dashboard",
    waitFor: ".member-hero, h1", kind: "scroll" },
  { id: "042", name: "traveller-discovery", url: "/traveller/discovery",
    waitFor: ".discovery-results-grid, .filter-panel, h1", kind: "scroll" },
  { id: "045", name: "traveller-inbox", url: "/traveller/inbox",
    waitFor: ".inquiry-heading, h1", kind: "scroll" },
  { id: "047", name: "traveller-plans", url: "/traveller/plans",
    waitFor: "main, h1", kind: "scroll" },
  { id: "049", name: "traveller-safety", url: "/traveller/safety",
    waitFor: "main, h1", kind: "scroll" },
  { id: "050", name: "traveller-account", url: "/traveller/account",
    waitFor: ".account-page, h1", kind: "scroll" },

  // ===== 06x — Companion logged-in =====
  { id: "059", name: "dev-login-as-companion", url: "/api/dev/login?role=companion",
    waitFor: "main, .companion-page", kind: "navigate" },
  { id: "060", name: "companion-dashboard", url: "/companion/dashboard",
    waitFor: ".companion-hero, h1", kind: "scroll" },
  { id: "061", name: "companion-onboarding", url: "/companion/onboarding",
    waitFor: ".companion-workflow-grid, h1", kind: "scroll" },
  { id: "062", name: "companion-profile", url: "/companion/profile",
    waitFor: ".companion-editor-grid, h1", kind: "scroll" },
  { id: "063", name: "companion-availability", url: "/companion/plans",
    waitFor: "main, h1", kind: "scroll" },
  { id: "064", name: "companion-inbox", url: "/companion/inbox",
    waitFor: ".companion-hero, h1", kind: "scroll" },
  { id: "066", name: "companion-safety", url: "/companion/safety",
    waitFor: ".companion-hero, h1", kind: "scroll" },
  { id: "067", name: "companion-account", url: "/companion/account",
    waitFor: ".account-page, h1", kind: "scroll" },
];

// --- runner -----------------------------------------------------------
async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (ignoreConsole(text)) return;
    consoleErrors.push({ text, location: msg.location?.()?.url });
  });

  const networkFailures = [];
  page.on("requestfailed", (req) => {
    const url = req.url();
    if (ignoreNetwork(url)) return;
    networkFailures.push({ url, failure: req.failure()?.errorText });
  });
  page.on("response", (resp) => {
    const url = resp.url();
    const status = resp.status();
    if (status >= 400 && !ignoreNetwork(url)) {
      networkFailures.push({ url, status });
    }
  });

  const allFrames = [];   // [{ file, hold }] flattened in walkthrough order
  const results = [];     // [{ id, status, frames?, error? }]

  for (const step of steps) {
    const id = `${step.id}-${step.name}`;
    process.stdout.write(`→ ${id} ... `);
    consoleErrors.length = 0;
    networkFailures.length = 0;

    try {
      if (step.url) {
        const target = new URL(step.url, BASE).toString();
        const resp = await page.goto(target, { waitUntil: "networkidle", timeout: 20000 });
        const status = resp?.status() ?? 0;
        if (status >= 400) throw new Error(`HTTP ${status} at ${target}`);
      }

      if (step.before) await step.before({ page, context });

      if (step.waitFor) {
        const selectors = step.waitFor.split(",").map((s) => s.trim());
        const racing = selectors.map((sel) =>
          page.locator(sel).first().waitFor({ state: "visible", timeout: 5000 }),
        );
        await Promise.any(racing).catch(() => {
          throw new Error(`waitFor selector did not appear: ${step.waitFor}`);
        });
      }

      await page.waitForTimeout(500); // settle

      // Error gate (before capture so failed page never makes it to MP4)
      if (networkFailures.length > 0) {
        const app = networkFailures.filter((f) => f.url.startsWith(BASE));
        if (app.length > 0) {
          throw new Error(`Network: ${app.map((f) => `${f.status ?? f.failure} ${f.url}`).join(", ")}`);
        }
      }
      if (consoleErrors.length > 0) {
        throw new Error(`Console: ${consoleErrors.map((e) => e.text).join(" | ")}`);
      }

      let stepFrames = [];
      if (step.kind === "navigate") {
        // no capture
      } else if (step.kind === "scroll") {
        stepFrames = await scrollWalk(page, {
          stepId: step.id, slug: step.name, outDir: OUT_DIR,
        });
      } else if (step.kind === "interaction") {
        const capture = async (letter, suffix, hold) => {
          const file = `${step.id}${letter}-${step.name}-${suffix}.png`;
          await page.screenshot({ path: join(OUT_DIR, file) });
          stepFrames.push({ file, hold });
        };
        await step.sequence({ page, capture });
      }

      allFrames.push(...stepFrames);
      results.push({ id, status: "ok", frames: stepFrames.length });
      process.stdout.write(`✓ ${stepFrames.length} frame(s)\n`);
    } catch (error) {
      results.push({ id, status: "fail", error: String(error?.message || error) });
      process.stdout.write(`✗ FAILED\n`);
      console.error(`\nFAILED at ${id}:`);
      console.error(`  ${error?.message || error}`);
      if (consoleErrors.length) console.error(`  Console: ${JSON.stringify(consoleErrors)}`);
      if (networkFailures.length) console.error(`  Network: ${JSON.stringify(networkFailures)}`);
      try {
        await page.screenshot({ path: join(OUT_DIR, `_FAILED-${id}.png`) });
      } catch {}
      break;
    }
  }

  await browser.close();

  // Write JSON report
  const report = {
    runAt: new Date().toISOString(),
    base: BASE,
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE,
    totalSteps: steps.length,
    completedSteps: results.filter((r) => r.status === "ok").length,
    totalFrames: allFrames.length,
    failed: results.filter((r) => r.status === "fail"),
    steps: results,
  };
  await writeFile(join(OUT_DIR, "_report.json"), JSON.stringify(report, null, 2));

  // Write frames.txt for ffmpeg concat demuxer
  // Format requires every frame except the last to have a duration; the
  // final file must be repeated for the demuxer to flush properly.
  const lines = [];
  lines.push("# Generated by qa-walkthrough-mobile.mjs");
  lines.push("# ffmpeg -f concat -safe 0 -i frames.txt -vsync vfr -pix_fmt yuv420p walkthrough.mp4");
  lines.push("");
  for (const frame of allFrames) {
    lines.push(`file '${frame.file}'`);
    lines.push(`duration ${frame.hold.toFixed(2)}`);
  }
  if (allFrames.length > 0) {
    // Repeat the last frame so the demuxer flushes the final duration
    lines.push(`file '${allFrames[allFrames.length - 1].file}'`);
  }
  await writeFile(join(OUT_DIR, "frames.txt"), lines.join("\n") + "\n");

  if (report.failed.length > 0) {
    console.error(`\n✗ STOPPED at first failure — see ${OUT_DIR}/_report.json`);
    process.exit(1);
  }
  console.log(`\n✓ Captured ${allFrames.length} frame(s) across ${results.length} steps → ${OUT_DIR}/`);

  if (SKIP_STITCH) {
    console.log("(--no-stitch set, skipping ffmpeg)");
    return;
  }

  // --- ffmpeg stitch -----------------------------------------------
  console.log("→ Stitching MP4 with ffmpeg...");
  const mp4Path = join(OUT_DIR, "walkthrough.mp4");
  await new Promise((resolve, reject) => {
    // -vsync vfr keeps variable per-frame durations from the concat demuxer
    // libx264 + yuv420p for broad mp4 player compatibility
    // scale=trunc(iw/2)*2:trunc(ih/2)*2 ensures even dims for h264
    const args = [
      "-y",
      "-f", "concat", "-safe", "0",
      "-i", join(OUT_DIR, "frames.txt"),
      "-vsync", "vfr",
      "-pix_fmt", "yuv420p",
      "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30",
      "-c:v", "libx264", "-preset", "medium", "-crf", "20",
      "-movflags", "+faststart",
      mp4Path,
    ];
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else {
        console.error(stderr.split("\n").slice(-12).join("\n"));
        reject(new Error(`ffmpeg exited ${code}`));
      }
    });
  });
  console.log(`✓ MP4: ${mp4Path}`);
}

run().catch((err) => {
  console.error("Runner crashed:", err);
  process.exit(2);
});
