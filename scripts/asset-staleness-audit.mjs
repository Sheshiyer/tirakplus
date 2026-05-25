#!/usr/bin/env node
/**
 * asset-staleness-audit.mjs — UIR-057
 *
 * Catches the "still using same old assets even though we have new
 * ones generated" failure. Closes the gap between approved generated
 * assets and what the registry actually points at.
 *
 * Failures:
 *  - A file in `generated/muse-assets/`, `generated/muse-character/`,
 *    `generated/screen-concepts/<approved-pass>/`, or
 *    `generated/web-reference-boards/<approved-pass>/` has a newer
 *    mtime than its corresponding `public/assets/<resolved>` file
 *    referenced from `src/app/registry/assets.ts`, AND the generated
 *    file is NOT under `_quarantine/` or `_superseded/`.
 *  - A file under `public/assets/` is not declared in the registry
 *    (drift in the other direction).
 *  - The asset-provenance.md "Approved Active Assets" list disagrees
 *    with `src/app/registry/assets.ts`.
 *
 * NOTE on configuration: edit `GENERATED_TO_REGISTRY_MAP` below to add
 * promotion rules. Out of the box it ships the Muse mappings derived
 * from `docs/design/asset-provenance.md` and is intended to be
 * extended as new approved-asset families land.
 */

import { stat, readdir, readFile } from "node:fs/promises";
import { join, relative, basename } from "node:path";

const root = process.cwd();

// Promotion rules. Each entry: { generatedGlob, registryKeyPath, isApproved }
// `isApproved` filters out _quarantine / _superseded paths automatically.
const GENERATED_TO_REGISTRY_MAP = [
  {
    label: "Muse Thailand night backdrop",
    generatedDirs: ["generated/muse-assets/gpt-image-2", "generated/muse-character/scenes"],
    generatedMatch: /thailand-night|night-backdrop|scene-backdrop/i,
    registryPath: "public/assets/muse/scene/muse-thailand-night-backdrop.png",
  },
  {
    label: "Muse mobile portrait foreground",
    generatedDirs: ["generated/muse-assets/gpt-image-2", "generated/muse-character/png-poses"],
    generatedMatch: /muse-mobile|mobile-portrait|portrait-foreground/i,
    registryPath: "public/assets/muse/scene/muse-mobile-portrait-foreground-alpha.png",
  },
  {
    label: "Tirak Plus Muse app icon",
    generatedDirs: ["generated/muse-assets/gpt-image-2"],
    generatedMatch: /tirakplus-muse-app-icon|muse-ai-app-icon/i,
    registryPath: "public/assets/brand/tirakplus-muse-app-icon.png",
  },
];

const QUARANTINED = /(^|\/)(_quarantine|_superseded)(\/|$)/;

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(join(root, dir), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const rel = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(rel)));
    } else {
      out.push(rel);
    }
  }
  return out;
}

async function mtime(rel) {
  try {
    const s = await stat(join(root, rel));
    return s.mtimeMs;
  } catch {
    return null;
  }
}

const failures = [];

// Rule 1: generated → registry staleness
for (const rule of GENERATED_TO_REGISTRY_MAP) {
  const registryMtime = await mtime(rule.registryPath);
  let newestGenerated = null;
  let newestGeneratedPath = null;
  for (const dir of rule.generatedDirs) {
    const files = await walk(dir);
    for (const f of files) {
      if (QUARANTINED.test(f)) continue;
      if (!rule.generatedMatch.test(basename(f))) continue;
      const m = await mtime(f);
      if (m !== null && (newestGenerated === null || m > newestGenerated)) {
        newestGenerated = m;
        newestGeneratedPath = f;
      }
    }
  }
  if (newestGenerated !== null && (registryMtime === null || newestGenerated > registryMtime + 1000)) {
    failures.push(
      `STALE: ${rule.label} → registry expects ${rule.registryPath} (mtime ${
        registryMtime ? new Date(registryMtime).toISOString() : "MISSING"
      }) but newer approved asset exists at ${newestGeneratedPath} (mtime ${new Date(newestGenerated).toISOString()}). Promote to public/assets and update registry.`,
    );
  }
}

// Rule 2: orphan check — every public/assets/ file declared in registry?
const publicAssets = await walk("public/assets");
const registryText = await readFile(join(root, "src/app/registry/assets.ts"), "utf8").catch(() => "");
for (const f of publicAssets) {
  // Files under _superseded/ or _quarantine/ are intentionally not registered.
  if (QUARANTINED.test(f)) continue;
  const webPath = "/" + f.replace(/^public\//, "");
  if (!registryText.includes(webPath)) {
    // Allow icon-set sub-files (e.g. favicon variants) that the registry never had to enumerate.
    if (/\/favicon|\/apple-touch|\/og-/.test(webPath)) continue;
    failures.push(`ORPHAN: ${f} is in public/assets but not referenced from src/app/registry/assets.ts`);
  }
}

// Rule 3: provenance ↔ registry agreement
const provenance = await readFile(join(root, "docs/design/asset-provenance.md"), "utf8").catch(() => "");
const provenancePaths = Array.from(provenance.matchAll(/`(public\/assets\/[^`]+)`/g)).map((m) => m[1]);
for (const p of provenancePaths) {
  const webPath = "/" + p.replace(/^public\//, "");
  // ignore glob-style entries (`*` wildcards or `{a,b,c}` brace expansion)
  if (webPath.includes("*") || webPath.includes("{")) continue;
  // ignore directory entries (trailing slash)
  if (webPath.endsWith("/")) continue;
  if (!registryText.includes(webPath)) {
    failures.push(`PROVENANCE-DRIFT: ${p} listed in asset-provenance.md but not in registry`);
  }
}

if (failures.length) {
  console.error("asset-staleness-audit FAILED:");
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`asset-staleness-audit passed across ${GENERATED_TO_REGISTRY_MAP.length} promotion rules and ${publicAssets.length} public assets.`);
