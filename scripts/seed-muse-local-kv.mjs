#!/usr/bin/env node
/**
 * seed-muse-local-kv.mjs — seed the KV records both workers need locally.
 *
 * Why this exists: `wrangler dev --local` uses an empty SQLite-backed KV by
 * default. The muse-rag worker checks `apps:tirakplus-muse` (enabled) and
 * `auth:tirakplus-muse` (Bearer token) BEFORE doing any NIM call — if those
 * KV records are missing, every `/v1/chat` returns 401 and the main worker
 * silently falls back to `createStagedMuseChatResponse()` (the canned
 * templates the user saw repeating in the chat panel screenshot).
 *
 * Run AFTER both wrangler dev processes have started at least once:
 *   1. Terminal A: `cd workers/muse-rag && npx wrangler dev --local --port 8788`
 *   2. Terminal B: `npm run dev` (in tirakplus root)
 *   3. `node scripts/seed-muse-local-kv.mjs`
 *
 * The seed values use the shared bearer that lives in tirakplus/.dev.vars
 * AND workers/muse-rag/.dev.vars. Edit `SHARED_BEARER` here if you rotated
 * those files.
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const ragDir = join(root, "workers/muse-rag");

function readDevVar(file, key) {
  try {
    const text = readFileSync(file, "utf8");
    const match = text.match(new RegExp(`^${key}=(.+)$`, "m"));
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

const SHARED_BEARER =
  readDevVar(join(root, ".dev.vars"), "MUSE_AGENT_API_KEY") ??
  "dev_99ccac89fe333a300c23527a7553f6a6";

function kvPut(cwd, binding, key, value) {
  // wrangler kv key put --binding <NAME> --local "<key>" "<json string>"
  const safeValue = JSON.stringify(value);
  const cmd = `npx wrangler kv key put --binding ${binding} --local ${JSON.stringify(key)} ${JSON.stringify(safeValue)}`;
  console.log(`→ [${binding}] ${key}`);
  execSync(cmd, { cwd, stdio: ["ignore", "pipe", "inherit"] });
}

// ---- main worker KV: MUSE_AGENT_CONFIG ----------------------------------
kvPut(root, "MUSE_AGENT_CONFIG", "muse:agent-config", {
  systemPromptId: "muse-private-guide",
  chatModel: "meta/llama-3.1-8b-instruct",
  embeddingModel: "nvidia/llama-nemotron-embed-1b-v2",
  searchTopK: 6,
  temperature: 0.6,
  maxTokens: 512,
  voice: {
    tone: "private, reverent, never marketing",
    forbid: ["assistant", "language model", "concierge", "bot"],
  },
});

// ---- muse-rag worker KV: APP_CONFIG --------------------------------------
kvPut(ragDir, "APP_CONFIG", "rag:defaults", {
  defaultChatModel: "meta/llama-3.1-8b-instruct",
  defaultEmbeddingModel: "nvidia/llama-nemotron-embed-1b-v2",
  defaultSearchTopK: 6,
});

kvPut(ragDir, "APP_CONFIG", "apps:tirakplus-muse", {
  displayName: "Tirak Plus Muse",
  corpusId: "tirakplus-muse",
  chatModel: "meta/llama-3.1-8b-instruct",
  embeddingModel: "nvidia/llama-nemotron-embed-1b-v2",
  searchTopK: 6,
  promptId: "muse-private-guide",
  authMode: "bearer",
  enabled: true,
});

kvPut(ragDir, "APP_CONFIG", "auth:tirakplus-muse", {
  token: SHARED_BEARER,
});

console.log("");
console.log(`✅ Local KV seeded for both workers.`);
console.log(`   Shared bearer: ${SHARED_BEARER.slice(0, 12)}…(${SHARED_BEARER.length} chars)`);
console.log("");
console.log("Next:");
console.log("  1. Paste your NVIDIA_API_KEY into workers/muse-rag/.dev.vars");
console.log("  2. Restart both wrangler dev processes (they read .dev.vars at boot)");
console.log("  3. POST /api/muse/chat — agentMode should now report 'external'");
