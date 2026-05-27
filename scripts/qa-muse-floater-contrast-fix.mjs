import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = "http://localhost:8787";
const TODAY = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const OUT_DIR = `generated/qa-screenshots/muse-floater-fix-${TODAY}`;
await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

await page.goto(`${BASE}/api/dev/login?role=traveller`, { waitUntil: "networkidle" });
await page.goto(`${BASE}/traveller/inbox`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT_DIR}/04-muse-floater-contrast-fix.png` });

await browser.close();
console.log("Captured 04-muse-floater-contrast-fix.png");
