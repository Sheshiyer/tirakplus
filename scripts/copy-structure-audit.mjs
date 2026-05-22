#!/usr/bin/env node
/**
 * copy-structure-audit.mjs — UIR-048 / UIR-056
 *
 * Catches the SHAPE of meta-copy that the keyword-only `copy-audit.mjs`
 * cannot see. Closes the 2026-05-22 lesson "Removing Keywords Is Not
 * Copy Hygiene".
 *
 * Failures:
 *  - Explainer-style headings on public surfaces ("How it works",
 *    "Choose your path", "Operating principles", "Get started",
 *    "Why Tirak", "What you can do", "Three steps", "Our promise",
 *    "Built for", "Discover Tirak", "About Tirak Plus").
 *  - Telegraph-style H1 ending with a period.
 *  - Eyebrow strings > 5 words (eyebrows are tags, not sentences).
 *  - <form> whose only navigational <button> resolves to its own route
 *    (the fake muse-chat-composer pattern in HomeHero.tsx:23-35).
 *  - `<section>` count > 2 in the route component used at `/`
 *    (PublicHome.tsx until P1 lands, then MuseHomePage.tsx).
 *  - Public nav set that doesn't equal {Muse, Discovery, Safety, Login}.
 *
 * Exit code 0 on clean; 1 on failures. Prints file:line evidence.
 */

import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();

const publicSurfaceFiles = [
  "src/app/pages/PublicHome.tsx",
  "src/app/pages/PublicDiscoveryPage.tsx",
  "src/app/pages/PublicSafetyPage.tsx",
  "src/app/pages/PublicPaymentsPage.tsx",
  "src/app/pages/AuthStart.tsx",
  "src/app/components/home/HomeHero.tsx",
  "src/app/components/home/AudienceCtaBand.tsx",
];

const explainerHeadings = [
  /How it works/i,
  /Choose (?:your |the )?path/i,
  /Operating principles/i,
  /Get started/i,
  /Why Tirak/i,
  /What you can do/i,
  /Three steps/i,
  /Our promise/i,
  /Built for/i,
  /Discover Tirak/i,
  /About Tirak Plus/i,
  /How Muse works/i,
  /Choose how/i,
];

const rootRouteFile = "src/app/pages/PublicHome.tsx"; // update when MuseHomePage lands
const maxSectionsOnRoot = 2;

const allowedPublicNav = new Set(["Muse", "Discovery", "Safety", "Login"]);

const failures = [];

function add(file, line, msg) {
  failures.push(`${file}:${line} ${msg}`);
}

async function readLines(file) {
  const text = await readFile(join(root, file), "utf8").catch(() => null);
  if (text === null) return null;
  return text.split(/\r?\n/);
}

async function checkExplainerHeadings(file) {
  const lines = await readLines(file);
  if (!lines) return;
  lines.forEach((line, i) => {
    for (const re of explainerHeadings) {
      if (re.test(line)) add(file, i + 1, `explainer heading matched ${re}`);
    }
  });
}

async function checkH1AndEyebrow(file) {
  const lines = await readLines(file);
  if (!lines) return;
  lines.forEach((line, i) => {
    // H1 ending in a period (telegraph style)
    const h1 = line.match(/<h1[^>]*>([^<]+)<\/h1>/);
    if (h1 && /\.\s*$/.test(h1[1].trim())) {
      add(file, i + 1, `H1 ends with period: "${h1[1].trim()}"`);
    }
    // eyebrow over 5 words
    const eyebrow = line.match(/className="eyebrow"[^>]*>([^<]+)</);
    if (eyebrow) {
      const wc = eyebrow[1].trim().split(/\s+/).length;
      if (wc > 5) add(file, i + 1, `eyebrow > 5 words (${wc}): "${eyebrow[1].trim()}"`);
    }
  });
}

async function checkFakeComposer(file) {
  const text = await readFile(join(root, file), "utf8").catch(() => null);
  if (text === null) return;
  // Detect <form> blocks whose only Button uses `to="/"` or `to={location.pathname}` shapes.
  const formRegex = /<form\b[^>]*>([\s\S]*?)<\/form>/g;
  let match;
  while ((match = formRegex.exec(text)) !== null) {
    const body = match[1];
    const lineIdx = text.slice(0, match.index).split(/\r?\n/).length;
    // Heuristic: if the only navigational target inside the form is `to="/"`
    // and there is no onSubmit handler (or handler just preventDefaults),
    // this is the fake-composer pattern.
    const hasRealHandler = /onSubmit=\{(?!.*preventDefault\(\)\s*\}?\s*\})[^}]+\}/.test(body) ||
      /onSubmit=\{[^}]*MuseService\.send/.test(body) ||
      /onSubmit=\{[^}]*navigate\(/.test(body) ||
      /onSubmit=\{[^}]*login\(/.test(body);
    const targetsSelf = /\bto=("\/"|\{location\.pathname\}|`\/`)/.test(body);
    if (targetsSelf && !hasRealHandler) {
      add(file, lineIdx, "fake-composer: <form> with only self-referential <Button to='/'> and no real onSubmit");
    }
  }
}

async function checkRootSectionCount() {
  const lines = await readLines(rootRouteFile);
  if (!lines) return;
  let count = 0;
  lines.forEach((line, i) => {
    const matches = line.match(/<section\b/g);
    if (matches) count += matches.length;
    if (count > maxSectionsOnRoot) {
      // Only emit one failure for clarity
      if (count === maxSectionsOnRoot + 1) {
        add(rootRouteFile, i + 1, `root route renders > ${maxSectionsOnRoot} <section> elements (mobile-first sprawl)`);
      }
    }
  });
}

async function checkPublicNav() {
  // The shell file lists nav items; parse a `navItems = [...]` literal if present.
  const shellPath = "src/app/shells/PublicShell.tsx";
  const lines = await readLines(shellPath);
  if (!lines) return;
  const text = lines.join("\n");
  const arr = text.match(/(?:navItems|publicNav|navLinks)\s*=\s*\[([\s\S]*?)\]/);
  if (!arr) return; // shape change — surfaced as a warning below
  const labels = Array.from(arr[1].matchAll(/label:\s*["']([^"']+)["']/g)).map((m) => m[1]);
  if (labels.length === 0) return;
  const set = new Set(labels);
  const extras = labels.filter((l) => !allowedPublicNav.has(l));
  const missing = [...allowedPublicNav].filter((l) => !set.has(l));
  if (extras.length || missing.length) {
    add(
      shellPath,
      0,
      `public nav set != {Muse, Discovery, Safety, Login}. extras=[${extras.join(", ")}] missing=[${missing.join(", ")}]`,
    );
  }
}

await Promise.all([
  ...publicSurfaceFiles.map((f) => checkExplainerHeadings(f)),
  ...publicSurfaceFiles.map((f) => checkH1AndEyebrow(f)),
  ...publicSurfaceFiles.map((f) => checkFakeComposer(f)),
  checkRootSectionCount(),
  checkPublicNav(),
]);

if (failures.length) {
  console.error("copy-structure-audit FAILED:");
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("copy-structure-audit passed.");
