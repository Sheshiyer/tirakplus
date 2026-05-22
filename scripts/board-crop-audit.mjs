#!/usr/bin/env node
/**
 * board-crop-audit.mjs — UIR-058 (partial fulfil of UIR-043)
 *
 * Closes the 2026-05-18 lessons:
 *  - "Do Not Crop UI Boards Into Production Characters"
 *  - "Do Not Let Concept Labels Leak Into The Product Frame"
 * and the 2026-05-21 lesson:
 *  - "Do Not Stack Or Glow The App Icon Over Muse 3D"
 *
 * Failures:
 *  1. Any TS/TSX/HTML/CSS file under src/ or index.html references a
 *     path containing `generated/`, `web-reference-boards/`,
 *     `screen-concepts/`, `_quarantine/`, or `_superseded/`. Generated
 *     content is provenance reference only.
 *  2. Any file under public/assets has dimensions matching a known
 *     board-contact-sheet size (1920×1080, 1440×900, 2880×1620) and
 *     does NOT have a sibling `<filename>.crop.ok` sentinel marking it
 *     as a reviewed close-crop.
 *  3. The same image path appears under both the brand-icon family
 *     keys and the floating-Muse keys of the registry (stacking).
 *
 * Image dimension check uses Node's built-in zlib for PNG IHDR parse.
 * No external image-dimension dependency required.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, extname, basename, dirname } from "node:path";

const root = process.cwd();

const BANNED_PATH_FRAGMENTS = [
  "generated/",
  "web-reference-boards/",
  "screen-concepts/",
  "_quarantine/",
  "_superseded/",
];

const BOARD_SIZES = [
  [1920, 1080],
  [1440, 900],
  [2880, 1620],
  [3000, 2000], // common contact sheet
];

const failures = [];

async function walk(dir, exts) {
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
      if (e.name === "node_modules" || e.name === "dist" || e.name === ".git") continue;
      out.push(...(await walk(rel, exts)));
    } else if (!exts || exts.includes(extname(e.name))) {
      out.push(rel);
    }
  }
  return out;
}

// Rule 1 — banned generated-path references in source
const sourceFiles = [
  ...(await walk("src", [".ts", ".tsx", ".js", ".jsx", ".css", ".html"])),
  "index.html",
];
for (const f of sourceFiles) {
  const text = await readFile(join(root, f), "utf8").catch(() => null);
  if (text === null) continue;
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    // ignore single-line comments — generated/ may legitimately appear in JSDoc
    if (/^\s*(?:\/\/|\*|#)/.test(line)) return;
    for (const frag of BANNED_PATH_FRAGMENTS) {
      if (line.includes(frag)) {
        // allow appearance inside a string that is itself documenting forbidden paths (e.g. this audit script wouldn't run on itself)
        if (/banned|forbid|do not|must not|reject/i.test(line)) return;
        failures.push(`${f}:${i + 1} references banned source path fragment "${frag}"`);
      }
    }
  });
}

// Rule 2 — board-dimension PNGs in public/assets without sibling .crop.ok
async function pngDimensions(pathRel) {
  const buf = await readFile(join(root, pathRel)).catch(() => null);
  if (!buf || buf.length < 24) return null;
  // PNG IHDR is at offset 16 (4 bytes width, 4 bytes height) — big-endian
  if (buf[0] !== 0x89 || buf[1] !== 0x50) return null;
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return [width, height];
}

const publicPngs = (await walk("public/assets", [".png"]));
for (const f of publicPngs) {
  const dims = await pngDimensions(f);
  if (!dims) continue;
  const [w, h] = dims;
  const isBoardSize = BOARD_SIZES.some(([bw, bh]) => Math.abs(bw - w) < 4 && Math.abs(bh - h) < 4);
  if (!isBoardSize) continue;
  const sentinel = f + ".crop.ok";
  const ok = await stat(join(root, sentinel)).then(() => true, () => false);
  if (!ok) {
    failures.push(
      `${f} has board-contact-sheet dimensions ${w}x${h} and no sibling ${basename(sentinel)} sentinel. ` +
        `If this is intentionally a board-shaped asset, create an empty file named ${sentinel} to acknowledge it; ` +
        `otherwise re-crop or replace with a focused asset.`,
    );
  }
}

// Rule 3 — same path used in both brand-icon family and floating-Muse keys
const registry = await readFile(join(root, "src/app/registry/assets.ts"), "utf8").catch(() => "");
const brandKeys = Array.from(registry.matchAll(/brand:\s*\{([\s\S]*?)\}/g)).map((m) => m[1]).join("\n");
const floatingKeys = Array.from(registry.matchAll(/floating:\s*\{([\s\S]*?)\}/g)).map((m) => m[1]).join("\n");
const brandPaths = new Set(Array.from(brandKeys.matchAll(/['"](\/assets\/[^'"]+)['"]/g)).map((m) => m[1]));
const floatingPaths = Array.from(floatingKeys.matchAll(/['"](\/assets\/[^'"]+)['"]/g)).map((m) => m[1]);
for (const p of floatingPaths) {
  if (brandPaths.has(p)) {
    failures.push(`STACKING: ${p} appears under both brand.* and muse.floating.* keys (double-mark risk)`);
  }
}

if (failures.length) {
  console.error("board-crop-audit FAILED:");
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`board-crop-audit passed (${sourceFiles.length} source files, ${publicPngs.length} PNGs).`);
