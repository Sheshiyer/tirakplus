#!/usr/bin/env node
/**
 * render-muse-pose-fallbacks.mjs — Wave 1 PNG fallback renderer for A1 chat character poses
 *
 * Why this exists: per the 2026-05-18 lesson "Do Not Let 3D Assets Drive
 * Tirak Plus UI", Wave 1 ships static PNG poses, not realtime GLB. But the
 * canonical *identity* of Muse lives in the GLB pose pack (all poses derive
 * from the same Meshy rigged source). To keep identity locked across the
 * pose PNGs the UI uses, we render the PNGs FROM the GLBs at a canonical
 * camera angle on every refresh — never paint a new PNG by hand.
 *
 * Pipeline:
 *   1. Spin up a local static server pointing at generated/muse-character/3d/pose-pack/
 *   2. Open muse-pose-pack-viewer.html in headless Chrome (Playwright)
 *   3. For each pose key in muse-pose-pack-manifest.json:
 *        - Tell the viewer to show that pose
 *        - Wait for the model-viewer 'load' event
 *        - Screenshot with transparent background at 1024×1024
 *        - Save to public/assets/muse/png-poses/<key>.png
 *   4. Update src/app/registry/assets.ts only if filenames change
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
 * Until either of those lands, the canonical pose PNGs at
 * /assets/muse/png-poses/*.png are produced by manually screenshotting
 * muse-pose-pack-viewer.html and saving with the names the registry expects.
 * That manual step is documented in docs/design/asset-provenance.md.
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
  console.log("Target PNGs (Wave 1 fallbacks):");
  const slug = (s) => s.replace(/-/g, "-");
  for (const [key] of poses) {
    console.log(`  public/assets/muse/png-poses/muse-${slug(key)}.png`);
  }
  console.log("");
  console.log("TODO before this script can run autonomously:");
  console.log("  - Extend generated/muse-character/3d/pose-pack/muse-pose-pack-viewer.html");
  console.log("    to accept ?pose=<key> and emit a window.museRenderReady event on load");
  console.log("  - OR replace with a Node script that uses @google/model-viewer or three.js");
  console.log("    in a headless context to render each GLB to a transparent PNG.");
  console.log("  - Add 'playwright' or '@google/model-viewer' to devDependencies");
  console.log("");
  console.log("For now: produce PNGs manually by opening muse-pose-pack-viewer.html, ");
  console.log("clicking through each pose, and saving screenshots with the target names above.");
  console.log("Document each manual run in docs/design/asset-provenance.md 'Asset Migration Log'.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
