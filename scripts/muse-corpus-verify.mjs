import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const corpusPath = path.join(repoRoot, "workers/muse-rag/data/tirakplus-muse-corpus.json");
const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8"));

const requiredCategories = new Set(["product", "brand", "policy", "safety", "traveller", "companion", "eval", "ops"]);
const allowedAudience = new Set(["traveller", "companion", "unknown"]);
const allowedSensitivity = new Set(["public", "guardrail", "private-method"]);
const blockedTerms = [
  "AI concierge",
  "Muse concierge",
  "as an AI",
  "language model",
  "system prompt",
  "retrieved context",
  "RAG",
  "vector",
  "embedding",
  "zodiac",
  "astrology",
  "vimshottari",
  "dasha",
  "nakshatra",
  "birth chart",
  "matching engine",
  "lotus",
];
const guardrailMarkers = ["must not expose", "never mention", "do not mention", "replace", "avoid"];

const failures = [];
if (!corpus.generatedAt) failures.push("missing generatedAt");
if (!Array.isArray(corpus.docs) || corpus.docs.length < 15) failures.push("expected at least 15 docs");

const slugs = new Set();
const categories = new Set();
let travellerDocs = 0;
let companionDocs = 0;
let guardrailDocs = 0;

for (const [index, doc] of (corpus.docs ?? []).entries()) {
  const label = doc.slug ?? `doc:${index}`;
  if (!doc.slug || !/^[a-z]+\/[a-z0-9-]+$/.test(doc.slug)) failures.push(`${label}: invalid slug`);
  if (slugs.has(doc.slug)) failures.push(`${label}: duplicate slug`);
  slugs.add(doc.slug);
  if (!doc.title) failures.push(`${label}: missing title`);
  if (!doc.category) failures.push(`${label}: missing category`);
  categories.add(doc.category);
  if (!doc.sourcePath) failures.push(`${label}: missing sourcePath`);
  if (!doc.content || doc.content.length < 120) failures.push(`${label}: content too short`);
  if (!Array.isArray(doc.audience) || doc.audience.length === 0) failures.push(`${label}: audience required`);
  for (const audience of doc.audience ?? []) {
    if (!allowedAudience.has(audience)) failures.push(`${label}: invalid audience ${audience}`);
  }
  if (!Array.isArray(doc.tags) || doc.tags.length < 2) failures.push(`${label}: expected at least two tags`);
  if (!allowedSensitivity.has(doc.sensitivity)) failures.push(`${label}: invalid sensitivity ${doc.sensitivity}`);
  if (doc.audience?.includes("traveller")) travellerDocs += 1;
  if (doc.audience?.includes("companion")) companionDocs += 1;
  if (doc.sensitivity === "guardrail") guardrailDocs += 1;

  const lower = String(doc.content).toLowerCase();
  const isGuardrailContext = doc.sensitivity === "guardrail" && guardrailMarkers.some((marker) => lower.includes(marker));
  const leaks = blockedTerms.filter((term) => lower.includes(term.toLowerCase()));
  if (leaks.length && !isGuardrailContext) failures.push(`${label}: blocked term outside guardrail context: ${leaks.join(", ")}`);
}

for (const category of requiredCategories) {
  if (!categories.has(category)) failures.push(`missing category ${category}`);
}
if (travellerDocs < 4) failures.push("expected at least 4 traveller-audience docs");
if (companionDocs < 4) failures.push("expected at least 4 companion-audience docs");
if (guardrailDocs < 1) failures.push("expected at least 1 guardrail doc");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Muse corpus verified ${corpus.docs.length} docs across ${categories.size} categories.`);
