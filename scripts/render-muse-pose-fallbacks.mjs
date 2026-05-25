#!/usr/bin/env node
/**
 * render-muse-pose-fallbacks.mjs — Retired Muse pose-pack scaffold
 *
 * Why this exists: this scaffold used to describe a pose-pack renderer, but
 * the resulting full-body/side-profile PNGs were demoted on 2026-05-24. They
 * are mood-board/reference material only, not product UI assets.
 *
 * Pipeline:
 *   1. Spin up a local static server pointing at generated/muse-character/3d/pose-pack/
 *   2. Open muse-pose-pack-viewer.html in headless Chrome (Playwright)
 *   3. For each pose key in muse-pose-pack-manifest.json:
 *        - Tell the viewer to show that pose
 *        - Wait for the model-viewer 'load' event
 *        - Screenshot with transparent background at 1024×1024
 *        - Save to a review folder outside public/assets
 *   4. Promote only close, mobile-first, transparent foreground assets after
 *      visual review and registry/provenance updates.
 *
 * Run: `node scripts/render-muse-pose-fallbacks.mjs`
 * Requires: `npx playwright install chromium` first.
 *
 * Status: SCAFFOLD — drafted 2026-05-22 alongside the asset migration. The
 * viewer (muse-pose-pack-viewer.html) currently does not expose a
 * single-pose-render API; implementing this script properly requires either
 * (a) extending the viewer with a ?pose=<key> query param + onLoad signal, or
 * (b) replacing the viewer with a render-only script that imports each GLB
 * directly via three.js or @google/model-viewer headless.
 *
 * Do not recreate public/assets/muse/png-poses. The active product foreground
 * is public/assets/muse/scene/muse-mobile-portrait-foreground-alpha.png.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const manifestPath = "/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/muse-character/3d/pose-pack/muse-pose-pack-manifest.json";

async function main() {
  const manifestRaw = await readFile(manifestPath, "utf8").catch(() => null);
  if (!manifestRaw) {
    console.error(`Manifest not found: ${manifestPath}`);
    process.exit(2);
  }
  const manifest = JSON.parse(manifestRaw);
  const poses = Object.entries(manifest.poses);

  console.log("render-muse-pose-fallbacks (SCAFFOLD)");
  console.log("------------------------------------");
  console.log(`Source GLBs (identity = ${manifest.identityRule}):`);
  for (const [key, def] of poses) {
    console.log(`  ${key.padEnd(28)} → ${def.file}`);
    console.log(`    intent : ${def.intent}`);
    console.log(`    screen : ${def.screen}`);
    console.log(`    motion : ${def.runtimeMotion}`);
  }
  console.log("");
  console.log("Retired target:");
  console.log("  public/assets/muse/png-poses/* is superseded and must not be recreated for product UI.");
  console.log("");
  console.log("TODO before this script can run autonomously:");
  console.log("  - Extend generated/muse-character/3d/pose-pack/muse-pose-pack-viewer.html");
  console.log("    to accept ?pose=<key> and emit a window.museRenderReady event on load");
  console.log("  - OR replace with a Node script that uses @google/model-viewer or three.js");
  console.log("    in a headless context to render each GLB to a transparent PNG.");
  console.log("  - Add 'playwright' or '@google/model-viewer' to devDependencies");
  console.log("");
  console.log("For now: use the pose pack only as generation reference material.");
  console.log("Promote reviewed mobile/tablet/desktop foregrounds under public/assets/muse/scene/.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
