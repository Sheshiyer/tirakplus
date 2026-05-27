// Verification capture for the Muse floater placement + scope fix.
// Captures 2 frames in 390x844 mobile viewport:
//   01 — logged-in inbox: floater should appear bottom-right (above bottom nav)
//   02 — public landing  : floater should NOT appear at all
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE ?? "http://127.0.0.1:8787";
const TODAY = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const OUT_DIR = `generated/qa-screenshots/muse-floater-fix-${TODAY}`;
await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

// 1) Logged-in via dev login API (sets session cookie + redirects to dashboard),
//    then navigate to inbox.
await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.goto(`${BASE}/traveller/inbox`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT_DIR}/01-logged-in-inbox-muse-bottom-right.png`, fullPage: false });
console.log(`Wrote ${OUT_DIR}/01-logged-in-inbox-muse-bottom-right.png`);

// 2) Public landing — clear session, then visit /.
await ctx.clearCookies();
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT_DIR}/02-public-landing-no-muse-floater.png`, fullPage: false });
console.log(`Wrote ${OUT_DIR}/02-public-landing-no-muse-floater.png`);

// 3) Bonus: public discovery (also should not have floater)
await page.goto(`${BASE}/discovery`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT_DIR}/03-public-discovery-no-muse-floater.png`, fullPage: false });
console.log(`Wrote ${OUT_DIR}/03-public-discovery-no-muse-floater.png`);

await browser.close();
console.log("Done.");
