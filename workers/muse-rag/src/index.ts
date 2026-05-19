import { getAppConfig, getDefaults, isAuthorizedRequest, type Env } from "./config";
import { createChatCompletion } from "./nvidia";
import { formatContext, ingestCorpus, searchCorpus } from "./retrieve";
import type { CorpusFile, MuseChatRequest, MuseConversationStage, SearchResult } from "./types";

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
  const body = await request.json() as { appId?: string; query?: string; topK?: number };
  const appId = body.appId?.trim() || DEFAULT_APP_ID;
  if (!body.query?.trim()) return json({ error: "query is required" }, 400);
  if (!(await isAuthorizedRequest(env, request, appId))) return json({ error: "Unauthorized" }, 401);

  const appConfig = await getEnabledAppConfig(env, appId);
  const results = await searchCorpus(env, appConfig, body.query, body.topK);
  return json({ appId, corpusId: appConfig.corpusId, results });
}

async function handleChat(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as MuseChatRequest;
  const appId = body.appId?.trim() || DEFAULT_APP_ID;
  const message = extractMessage(body);
  if (!message) return json({ error: "message or query is required" }, 400);
  if (!(await isAuthorizedRequest(env, request, appId))) return json({ error: "Unauthorized" }, 401);

  const appConfig = await getEnabledAppConfig(env, appId);
  const context = await searchCorpus(env, appConfig, message, body.responseMode === "fast" ? 4 : appConfig.searchTopK);
  const signals = inferSignals(message);
  const stage = inferStage(body.stage ?? body.input?.stage ?? "arrival", signals);
  const answer = await buildMuseAnswer(env, appConfig.chatModel, message, stage, context);
  const conversationId = body.conversationId ?? body.input?.conversationId ?? `muse_${crypto.randomUUID()}`;

  return json({
    conversationId,
    stage,
    reply: {
      id: `msg_${crypto.randomUUID()}`,
      role: "muse",
      content: sanitizeMuseCopy(answer),
      createdAt: new Date().toISOString(),
    },
    suggestedPrompts: suggestedPrompts(stage),
    profileSignals: signals,
    nextAction: nextAction(stage, signals),
    agentMode: "external",
    retrievedContext: context,
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
  context: SearchResult[],
): Promise<string> {
  const contextText = formatContext(context);
  const generated = await createChatCompletion(env, model, [
    {
      role: "system",
      content: [
        "You are Muse, Tirak Plus's private AI concierge.",
        "Use only the provided Tirak Plus context for product facts.",
        "You may infer tone, timing, privacy, boundaries, and attraction patterns.",
        "Never mention zodiac, astrology, vimshottari, dasha, houses, nakshatra, birth chart, or matching-engine internals.",
        "Avoid explicit sexual copy, red-light framing, fake urgency, off-platform contact/payment pressure, and objectifying companion language.",
      ].join(" "),
    },
    {
      role: "user",
      content: [`Current stage: ${stage}`, `User message:\n${message}`, `Tirak Plus context:\n${contextText}`].join("\n\n"),
    },
  ], { maxTokens: 260, temperature: 0.35 });

  if (generated) return generated;
  return fallbackAnswer(message, stage, context);
}

function extractMessage(body: MuseChatRequest): string {
  return (body.message ?? body.query ?? body.input?.message ?? "").trim();
}

function fallbackAnswer(message: string, stage: MuseConversationStage, context: SearchResult[]): string {
  if (stage === "birth_context") {
    return "Give me your birth date, birth place, and time if you know it. I will keep the engine private and translate it into timing, temperament, and fit.";
  }
  if (stage === "travel_context") {
    return "Now place Thailand on the map for me: city, dates, and the kind of evening or guidance you want. I am looking for rhythm, not a checklist.";
  }
  if (stage === "safety_boundaries") {
    return "Before I route anything, give me the privacy and comfort lines. The product is designed to slow down unsafe routing, pressure, and public exposure.";
  }
  const source = context[0];
  return source
    ? `I am reading this through Tirak Plus's ${source.metadata.title} context. Tell me one more thing: should this feel warm, witty, calm, private, or more locally guided?`
    : `I can start with that. Tell me the date/place context and what kind of private Thailand experience you want.`;
}

function inferSignals(message: string) {
  const lower = message.toLowerCase();
  const city = ["bangkok", "phuket", "koh-samui", "koh-phangan"].find((item) =>
    lower.includes(item) || lower.includes(item.replace("-", " ")),
  ) as "bangkok" | "phuket" | "koh-samui" | "koh-phangan" | undefined;
  const date = message.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/)?.[0];
  const time = message.match(/\b(?:[01]?\d|2[0-3])(?::[0-5]\d)?\s?(?:am|pm)?\b/i)?.[0];
  const place = message.match(/\b(?:born in|birth place is|from)\s+([a-zA-Z\s-]{3,40})/i)?.[1]?.trim();

  const desireVector = [
    lower.includes("private") || lower.includes("discreet") ? "privacy-led" : "",
    lower.includes("warm") || lower.includes("kind") ? "warmth" : "",
    lower.includes("witty") || lower.includes("funny") ? "playful conversation" : "",
    lower.includes("calm") || lower.includes("quiet") ? "low-noise planning" : "",
    lower.includes("nightlife") ? "polished nightlife" : "",
  ].filter(Boolean);
  const boundarySignals = [
    lower.includes("safe") || lower.includes("safety") ? "safety explicit" : "",
    lower.includes("slow") || lower.includes("no pressure") ? "low-pressure pace" : "",
    lower.includes("private") || lower.includes("discreet") ? "discretion required" : "",
  ].filter(Boolean);

  return {
    birthContext: {
      ...(date ? { date } : {}),
      ...(time ? { time } : {}),
      ...(place ? { place } : {}),
      confidence: date && time && place ? "complete" : date || time || place ? "partial" : "none",
    },
    travelContext: {
      ...(city ? { city } : {}),
      timeframe: lower.includes("weekend") ? "weekend" : lower.includes("tonight") ? "tonight" : undefined,
      experienceHints: lower.includes("nightlife") ? ["nightlife"] : lower.includes("dining") ? ["private-dining"] : [],
    },
    desireVector,
    boundarySignals,
    routingHints: {
      nextRoute: city ? `/cities/${city}` : undefined,
      requiresAuth: false,
      suggestedRole: lower.includes("profile") || lower.includes("bio") || lower.includes("services") ? "companion" : "traveller",
    },
  };
}

function inferStage(currentStage: MuseConversationStage, signals: ReturnType<typeof inferSignals>): MuseConversationStage {
  if (signals.birthContext.confidence === "none") return "birth_context";
  if (!signals.travelContext.city) return "travel_context";
  if (signals.desireVector.length === 0) return "desire_mapping";
  if (signals.boundarySignals.length === 0) return "safety_boundaries";
  return currentStage === "safety_boundaries" ? "recommendation_ready" : currentStage;
}

function suggestedPrompts(stage: MuseConversationStage): string[] {
  if (stage === "birth_context") return ["Born 14/08/1992 in London, time unknown", "I know my date and city but not time"];
  if (stage === "travel_context") return ["Bangkok this weekend, private but warm", "Phuket for a quiet premium evening"];
  if (stage === "desire_mapping") return ["Witty, calm, discreet, no chaos", "Local guidance with polished nightlife"];
  if (stage === "safety_boundaries") return ["Keep it private and slow paced", "No off-platform pressure or public visibility"];
  return ["Show me the private path", "Help me refine the fit first"];
}

function nextAction(stage: MuseConversationStage, signals: ReturnType<typeof inferSignals>) {
  if (stage !== "recommendation_ready") return { label: "Continue with Muse", href: "/", kind: "continue" as const };
  if (signals.routingHints.suggestedRole === "companion") return { label: "Open companion assist", href: "/auth/login", kind: "auth" as const };
  return { label: "Review private discovery", href: "/auth/login", kind: "auth" as const };
}

function sanitizeMuseCopy(value: string): string {
  return value
    .replace(/\b(?:zodiac|astrology|vimshottari|dasha|houses?|nakshatra|birth chart|matching engine)\b/gi, "pattern")
    .slice(0, 1400);
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
