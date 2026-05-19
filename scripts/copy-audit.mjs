import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const scannedRoots = ["src", "workers/muse-rag/src", "workers/muse-rag/data", "public/site.webmanifest", "index.html"];
const banned = [
  /\bAI concierge\b/i,
  /\bMuse concierge\b/i,
  /\bprivate AI\b/i,
  /\blotus\b/i,
  /\bzodiac\b/i,
  /\bvimshottari\b/i,
  /\bdasha\b/i,
  /\bnakshatra\b/i,
  /\bbirth chart\b/i,
];

const allowedGuardrail = /\b(?:never mention|must not expose|do not mention|replace|avoid in brand surfaces)\b/i;

async function listFiles(path) {
  const absolute = join(root, path);
  if (path.includes(".")) return [absolute];
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const child = join(path, entry.name);
    if (entry.isDirectory()) return listFiles(child);
    return [join(root, child)];
  }));
  return files.flat();
}

const files = (await Promise.all(scannedRoots.map(listFiles)))
  .flat()
  .filter((file) => /\.(tsx?|jsx?|json|html|md|txt|webmanifest)$/.test(file));

const failures = [];
for (const file of files) {
  const relativePath = relative(root, file);
  const isGuardrailFile =
    relativePath === "workers/muse-rag/src/policy.ts" ||
    relativePath === "scripts/copy-audit.mjs";
  const text = await readFile(file, "utf8");
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const pattern of banned) {
      if (pattern.test(line) && !isGuardrailFile && !allowedGuardrail.test(line)) {
        failures.push(`${relativePath}:${index + 1} matched ${pattern}`);
      }
    }
  });
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Copy audit passed across ${files.length} files.`);
