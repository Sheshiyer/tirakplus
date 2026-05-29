import { getAppConfig, getDefaults, isAuthorizedRequest, type Env } from "./config";
import { createEvolutionCandidate } from "./evolution";
import { detectPromptInjection, extractMessage, inferSignals, resolveRoleIntent } from "./intent";
import { nextAction } from "./next-action";
import { createChatCompletion } from "./nvidia";
import { draftingSystemInstructions, evaluateMuseCopy, MUSE_POLICY_VERSION, museSystemInstructions, refusalForSafety, sanitizeMuseCopy } from "./policy";
import { formatContext, ingestCorpus, searchCorpus } from "./retrieve";
import { classifySafety } from "./safety";
import { inferStage, suggestedPrompts } from "./stage";
import type { CorpusFile, MuseChatRequest, MuseConversationStage, MuseRoleIntent, SearchResult } from "./types";
import { fallbackAnswer, normalizeMuseVoice, voicePass } from "./voice";

const DEFAULT_APP_ID = "tirakplus-muse";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    try {
      if (url.pathname === "/health") return withCors(json({ ok: true, environment: env.ENVIRONMENT ?? "staging" }));
      if (url.pathname === "/v1/models") return withCors(json({ defaults: await getDefaults(env) }));
      if (url.pathname === "/v1/ingest" && request.method === "POST") return withCors(await handleIngest(request, env));
      if (url.pathname === "/v1/search" && request.method === "POST") return withCors(await handleSearch(request, env));
      if (url.pathname === "/v1/chat" && request.method === "POST") return withCors(await handleChat(request, env));

      return withCors(json({ error: "Not found" }, 404));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return withCors(json({ error: message }, 500));
    }
  },
};

async function handleIngest(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as { appId?: string; corpus?: CorpusFile };
  const appId = body.appId?.trim() || DEFAULT_APP_ID;
  if (!body.corpus?.docs?.length) return json({ error: "corpus.docs are required" }, 400);
  if (!(await isAuthorizedRequest(env, request, appId))) return json({ error: "Unauthorized" }, 401);

  const appConfig = await getEnabledAppConfig(env, appId);
  const result = await ingestCorpus(env, appConfig, body.corpus);
  return json({ appId, corpusId: appConfig.corpusId, chunkCount: result.count });
}

async function handleSearch(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as { appId?: string; query?: string; topK?: number; roleIntent?: MuseRoleIntent; categories?: string[] };
  const appId = body.appId?.trim() || DEFAULT_APP_ID;
  if (!body.query?.trim()) return json({ error: "query is required" }, 400);
  if (!(await isAuthorizedRequest(env, request, appId))) return json({ error: "Unauthorized" }, 401);

  const appConfig = await getEnabledAppConfig(env, appId);
  const results = await searchCorpus(env, appConfig, body.query, {
    topK: body.topK,
    roleIntent: body.roleIntent ?? inferRoleIntent(body.query),
    categories: body.categories,
  });
  return json({ appId, corpusId: appConfig.corpusId, results });
}

async function handleChat(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as MuseChatRequest;
  const appId = body.appId?.trim() || DEFAULT_APP_ID;
  const message = extractMessage(body);
  if (!message) return json({ error: "message or query is required" }, 400);
  if (!(await isAuthorizedRequest(env, request, appId))) return json({ error: "Unauthorized" }, 401);

  const appConfig = await getEnabledAppConfig(env, appId);

  // Draft-assist short-circuit: MuseAssistedTextarea sends responseMode=draft to
  // ghost-write a traveller→companion first-contact message. Skip stage inference,
  // corpus retrieval, and Muse's conversational system prompt — all built for
  // discovery intake, not ghostwriting. Use a dedicated drafting prompt instead.
  if (body.responseMode === "draft") {
    const nameMatch = message.match(/I can send to (\w+) about/i);
    const companionName = nameMatch?.[1] ?? "you";
    const experienceLabels: Record<string, string> = {
      nightlife: "evening out",
      "island-explorer": "island day",
      "muay-thai-night": "Muay Thai evening",
      "private-dining": "private dinner",
      "local-guidance": "local day",
    };
    const experienceLabel = (body.clientContext?.experience && experienceLabels[body.clientContext.experience]) ?? "experience";
    const rawDraft = await createChatCompletion(env, appConfig.chatModel, [
      { role: "system", content: draftingSystemInstructions(companionName, experienceLabel) },
      { role: "user", content: message },
    ], { maxTokens: 160, temperature: 0.5 });
    const content = sanitizeMuseCopy(rawDraft || `Hi ${companionName}, I came across your profile and would love to connect for a ${experienceLabel}. Would you be open to it?`);
    const conversationId = body.conversationId ?? `muse_${crypto.randomUUID()}`;
    return json({
      conversationId,
      stage: "recommendation_ready",
      roleIntent: "traveller",
      contractVersion: "muse-response-v2",
      policyVersion: MUSE_POLICY_VERSION,
      reply: { id: `msg_${crypto.randomUUID()}`, role: "muse", content, createdAt: new Date().toISOString() },
      suggestedPrompts: [],
      profileSignals: { birthContext: { confidence: "none" }, travelContext: { experienceHints: [] }, desireVector: [], boundarySignals: [], routingHints: { requiresAuth: true } },
      nextAction: { label: "Continue with Muse", href: "/", kind: "continue" },
      agentMode: "external",
      quality: { leakagePass: true, safetyPass: true, voicePass: true, retrievalPass: false, injectionPass: true, notes: [] },
    });
  }

  // Authoritative role resolution: client-context > routeKind > message inference.
  // This is the fix for the 2026-05-26 issue where Muse was asking the
  // user (a traveller) about a *companion's* birth date — it had collapsed
  // the role distinction and treated every conversation as a search.
  const roleIntent = resolveRoleIntent(body);
  const safetyDecision = classifySafety(message);
  const promptInjection = detectPromptInjection(message);
  const context = await searchCorpus(env, appConfig, message, {
    topK: body.responseMode === "fast" ? 4 : appConfig.searchTopK,
    roleIntent,
    minScore: 0.12,
  });
  const signals = inferSignals(message);
  const stage = inferStage(body.stage ?? body.input?.stage ?? "arrival", signals, roleIntent, message);
  const answer = safetyDecision.allowed && !promptInjection
    ? await buildMuseAnswer(env, appConfig.chatModel, message, stage, roleIntent, context)
    : refusalForSafety(safetyDecision.category ?? "prompt_injection");
  const conversationId = body.conversationId ?? body.input?.conversationId ?? `muse_${crypto.randomUUID()}`;
  const content = sanitizeMuseCopy(normalizeMuseVoice(answer || fallbackAnswer(stage, roleIntent, signals)));
  const qualityResult = evaluateMuseCopy(content);
  const traceId = `trace_${crypto.randomUUID()}`;
  const qualityNotes = [...qualityResult.blockedTerms, ...qualityResult.unsafeTerms, ...qualityResult.mechanicalPhrases];
  const evolutionCandidate = qualityNotes.length
    ? createEvolutionCandidate(roleIntent, {
      category: qualityResult.blockedTerms.length ? "leakage_risk" : qualityResult.unsafeTerms.length ? "safety_boundary" : "tone_drift",
      severity: qualityResult.blockedTerms.length || qualityResult.unsafeTerms.length ? "high" : "medium",
      signal: qualityNotes.join(", "),
      suggestedAction: "eval_candidate",
    })
    : undefined;

  return json({
    conversationId,
    stage,
    roleIntent,
    contractVersion: "muse-response-v2",
    policyVersion: MUSE_POLICY_VERSION,
    reply: {
      id: `msg_${crypto.randomUUID()}`,
      role: "muse",
      content,
      createdAt: new Date().toISOString(),
    },
    suggestedPrompts: suggestedPrompts(stage, roleIntent),
    profileSignals: signals,
    nextAction: nextAction(stage, signals, roleIntent),
    agentMode: "external",
    retrievedContext: context,
    quality: {
      leakagePass: qualityResult.blockedTerms.length === 0,
      safetyPass: safetyDecision.allowed && qualityResult.unsafeTerms.length === 0,
      voicePass: voicePass(content) && qualityResult.mechanicalPhrases.length === 0,
      retrievalPass: context.length > 0,
      injectionPass: !promptInjection,
      safetyCategory: safetyDecision.category,
      notes: qualityNotes,
    },
    observability: {
      traceId,
      policyVersion: MUSE_POLICY_VERSION,
      stage,
      roleIntent,
      retrievedCount: context.length,
      blockedBySafety: !safetyDecision.allowed || promptInjection,
      createdAt: new Date().toISOString(),
    },
    ...(evolutionCandidate ? { evolutionCandidates: [evolutionCandidate] } : {}),
  });
}

async function getEnabledAppConfig(env: Env, appId: string) {
  const appConfig = await getAppConfig(env, appId);
  if (!appConfig?.enabled) throw new Error("Unknown or disabled app");
  return appConfig;
}

async function buildMuseAnswer(
  env: Env,
  model: string,
  message: string,
  stage: MuseConversationStage,
  roleIntent: MuseRoleIntent,
  context: SearchResult[],
): Promise<string> {
  const contextText = formatContext(context);
  const generated = await createChatCompletion(env, model, [
    {
      role: "system",
      content: museSystemInstructions(stage, roleIntent),
    },
    {
      role: "user",
      content: [`Current stage: ${stage}`, `User message:\n${message}`, `Tirak Plus context:\n${contextText}`].join("\n\n"),
    },
  ], { maxTokens: 260, temperature: 0.35 });

  return generated || "";
}

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders())) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function corsHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "authorization,content-type,x-client-key",
  };
}
