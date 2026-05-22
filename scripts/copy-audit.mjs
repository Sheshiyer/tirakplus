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

const publicSurfaceFiles = new Set([
  "src/app/pages/PublicHome.tsx",
  "src/app/pages/PublicDiscoveryPage.tsx",
  "src/app/pages/PublicSafetyPage.tsx",
  "src/app/pages/PublicPaymentsPage.tsx",
  "src/app/pages/AuthStart.tsx",
  "src/app/pages/CityOverviewPage.tsx",
  "src/app/pages/ExperiencePage.tsx",
  "src/app/pages/LegalPages.tsx",
  "src/app/components/home/HomeHero.tsx",
  "src/app/components/home/SafetyMessageBand.tsx",
]);

const publicSurfaceBanned = [
  /\bsupportability\b/i,
  /\bpayment rails?\b/i,
  /\bproduct rails?\b/i,
  /\bproduct\b/i,
  /\bproduct surface\b/i,
  /\bprovider gate\b/i,
  /\bpayment gate\b/i,
  /\bpayment-gate\b/i,
  /\bcompliance gate\b/i,
  /\bgated\b/i,
  /\bgates? (?:are|is|cleared|clear|visible|disabled|approved)\b/i,
  /\bopen catalogue\b/i,
  /\bpublic profile grid\b/i,
  /\bprotected discovery workspace\b/i,
  /\bsigned-in product\b/i,
  /\bvisibility rules\b/i,
  /\binquiry routing\b/i,
  /\brouting\b/i,
  /\bmoney movement\b/i,
  /\badapter candidate\b/i,
  /\bjurisdiction-specific\b/i,
  /\bmarketplace\b/i,
  /\breview state\b/i,
  /\bstaged payment\b/i,
  /\bprovider status\b/i,
  /\bproduction\b/i,
  /\blaunch implementation\b/i,
  /\bpublic profile surfaces\b/i,
  /\bshould\b/i,
];

const protectedSurfaceFiles = new Set([
  "src/app/pages/TravellerDashboardPage.tsx",
  "src/app/pages/TravellerDiscovery.tsx",
  "src/app/pages/CompanionProfilePage.tsx",
  "src/app/pages/InquiryCreatePage.tsx",
  "src/app/pages/TravellerInquiryDetailPage.tsx",
  "src/app/pages/TravellerInquiriesPage.tsx",
  "src/app/pages/TravellerSessionsPage.tsx",
  "src/app/pages/TravellerSessionDetailPage.tsx",
  "src/app/pages/TravellerSafetyPage.tsx",
  "src/app/pages/AccountSettings.tsx",
  "src/app/pages/CompanionDashboardPage.tsx",
  "src/app/pages/CompanionOnboardingPage.tsx",
  "src/app/pages/CompanionProfileManagerPage.tsx",
  "src/app/pages/CompanionAvailabilityPage.tsx",
  "src/app/pages/CompanionInboxPage.tsx",
  "src/app/pages/CompanionInquiryDetailPage.tsx",
  "src/app/pages/CompanionSafetyPage.tsx",
  "src/worker/staged-data.ts",
  "src/worker/staged-provider.ts",
  "src/worker/payment-provider.ts",
  "src/worker/index.ts",
]);

const protectedSurfaceBanned = [
  /\bsupportability\b/i,
  /\bAPI rail\b/i,
  /\breview-gated\b/i,
  /\bpublic surfaces\b/i,
  /\bpublic exposure\b/i,
  /\bproduct behavior\b/i,
  /\bafterthought copy\b/i,
  /\bprovider approval\b/i,
  /\bproduction step\b/i,
  /\bcompliance gates?\b/i,
  /\bpayment gates?\b/i,
  /\bpayment-gate\b/i,
  /\bgated\b/i,
  /\bapproved rails\b/i,
  /\brouting\b/i,
  /\bstaged (?:city|experience|app|payment|review)\b/i,
  /\bpublic profile surfaces\b/i,
  /\bdiscovery surfaces\b/i,
  /\bsafe preview\b/i,
  /\bpreview access\b/i,
  /\bpublic copy should\b/i,
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
  const isPublicSurfaceFile = publicSurfaceFiles.has(relativePath);
  const isProtectedSurfaceFile = protectedSurfaceFiles.has(relativePath);
  const text = await readFile(file, "utf8");
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    const isInternalRoutingSignal =
      relativePath === "src/worker/index.ts" &&
      (line.includes("routingHints") || line.includes("suggestedRole") || line.includes("nextRoute"));

    for (const pattern of banned) {
      if (pattern.test(line) && !isGuardrailFile && !allowedGuardrail.test(line)) {
        failures.push(`${relativePath}:${index + 1} matched ${pattern}`);
      }
    }

    if (isPublicSurfaceFile) {
      for (const pattern of publicSurfaceBanned) {
        if (pattern.test(line) && !allowedGuardrail.test(line)) {
          failures.push(`${relativePath}:${index + 1} matched public-surface ${pattern}`);
        }
      }
    }

    if (isProtectedSurfaceFile && !isInternalRoutingSignal) {
      for (const pattern of protectedSurfaceBanned) {
        if (pattern.test(line) && !allowedGuardrail.test(line)) {
          failures.push(`${relativePath}:${index + 1} matched protected-surface ${pattern}`);
        }
      }
    }
  });
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Copy audit passed across ${files.length} files.`);
