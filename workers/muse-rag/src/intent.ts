import type { MuseChatRequest, MuseProfileSignals, MuseRoleIntent } from "./types";

export function extractMessage(body: MuseChatRequest): string {
  return (body.message ?? body.query ?? body.input?.message ?? "").trim();
}

/**
 * Detection of "I AM a companion" vs "I want a companion" — the former is
 * the COMPANION role; the latter is a TRAVELLER. Checked BEFORE the
 * generic "companion" keyword in inferRoleIntent so the words don't collide.
 */
const COMPANION_SELF_DECLARATION = /\b(?:i am (?:a )?(?:new )?companion|i'?m (?:a )?(?:new )?companion|join(?:ing)? as (?:a )?companion|sign up as (?:a )?companion|companion (?:onboarding|signup|profile|account)|host my profile|list myself|provide companionship)\b/i;
const COMPANION_TASK_KEYWORDS = /\b(?:bio|profile|my services|my availability|visibility|verification|onboard(?:ing)?|client boundaries|set my (?:rate|hours|availability)|booking calendar|inquiry inbox|public tone)\b/i;
const TRAVELLER_KEYWORDS = /\b(?:trip|travel(?:ling|ing|er|ler)?|holiday|vacation|land(?:ing)? in|fly(?:ing)? to|visit(?:ing)?|bangkok|phuket|samui|phangan|nightlife|dining|find (?:a |me a )?(?:companion|guide)|private evening|book(?:ing)? an? (?:experience|companion|guide)|looking for (?:a |the )?(?:companion|guide))\b/i;

export function inferRoleIntent(message: string): MuseRoleIntent {
  if (COMPANION_SELF_DECLARATION.test(message)) return "companion";
  if (COMPANION_TASK_KEYWORDS.test(message)) return "companion";
  if (TRAVELLER_KEYWORDS.test(message)) return "traveller";
  return "unknown";
}

/**
 * Authoritative role resolution for a Muse turn. Priority order:
 *   1. Explicit client-context roleIntent (set by the UI shell, never inferred)
 *   2. routeKind (companion-* → companion, traveller-* → traveller)
 *   3. Inference from the message text (last resort)
 *
 * The UI tells us the role MOST of the time via routeKind/roleIntent —
 * trusting those before guessing keeps Muse from misreading "I want a
 * companion" as "I AM a companion" or vice-versa.
 */
export function resolveRoleIntent(body: MuseChatRequest): MuseRoleIntent {
  const explicit =
    asKnownRole(body.clientContext?.roleIntent) ??
    asKnownRole(body.input?.clientContext?.roleIntent) ??
    asKnownRole(body.roleIntent) ??
    asKnownRole(body.input?.roleIntent);
  if (explicit) return explicit;

  const routeKind = body.clientContext?.routeKind ?? body.input?.clientContext?.routeKind;
  if (typeof routeKind === "string") {
    if (routeKind.startsWith("companion")) return "companion";
    if (routeKind.startsWith("traveller")) return "traveller";
  }

  return inferRoleIntent(extractMessage(body));
}

function asKnownRole(value: unknown): "traveller" | "companion" | null {
  if (value === "traveller" || value === "companion") return value;
  return null;
}

export function inferSignals(message: string): MuseProfileSignals {
  const lower = message.toLowerCase();
  const city = ["bangkok", "phuket", "koh-samui", "koh-phangan"].find((item) =>
    lower.includes(item) || lower.includes(item.replace("-", " ")),
  ) as MuseProfileSignals["travelContext"]["city"] | undefined;
  const date = message.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/)?.[0];
  const time = message.match(/\b(?:birth time is|time is|at)\s+((?:[01]?\d|2[0-3])(?::[0-5]\d)\s?(?:am|pm)?|(?:[1-9]|1[0-2])\s?(?:am|pm))\b/i)?.[1]
    ?? message.match(/\b(?:[01]?\d|2[0-3]):[0-5]\d\s?(?:am|pm)?\b/i)?.[0]
    ?? message.match(/\b(?:[1-9]|1[0-2])\s?(?:am|pm)\b/i)?.[0];
  const place = message.match(/\b(?:born in|birth place is|from)\s+([a-zA-Z\s-]{3,40})/i)?.[1]?.trim();

  const desireVector = [
    lower.includes("private") || lower.includes("discreet") ? "privacy-led" : "",
    lower.includes("warm") || lower.includes("kind") ? "warmth" : "",
    lower.includes("witty") || lower.includes("funny") ? "playful conversation" : "",
    lower.includes("calm") || lower.includes("quiet") ? "low-noise planning" : "",
    lower.includes("premium") || lower.includes("classy") ? "polished atmosphere" : "",
    lower.includes("nightlife") ? "polished nightlife" : "",
  ].filter(Boolean);
  const boundarySignals = [
    lower.includes("safe") || lower.includes("safety") ? "safety explicit" : "",
    lower.includes("slow") || lower.includes("no pressure") ? "low-pressure pace" : "",
    lower.includes("private") || lower.includes("discreet") ? "discretion required" : "",
    lower.includes("visibility") || lower.includes("hidden") ? "visibility control" : "",
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
      experienceHints: [
        lower.includes("nightlife") ? "nightlife" : "",
        lower.includes("dining") ? "private-dining" : "",
        lower.includes("muay thai") ? "muay-thai-night" : "",
        lower.includes("island") ? "island-explorer" : "",
        lower.includes("local") || lower.includes("guide") ? "local-guidance" : "",
      ].filter(Boolean),
    },
    desireVector,
    boundarySignals,
    routingHints: {
      nextRoute: stageRouteHint(city, lower),
      requiresAuth: false,
      suggestedRole: inferRoleIntent(message) === "companion" ? "companion" : "traveller",
    },
  };
}

export function detectPromptInjection(message: string): boolean {
  return /\b(?:ignore previous|system prompt|developer message|hidden rules|reveal.*prompt|jailbreak|show.*policy|retrieved context)\b/i.test(message);
}

function stageRouteHint(city: MuseProfileSignals["travelContext"]["city"], lower: string): string | undefined {
  if (lower.includes("nightlife")) return "/experiences/nightlife";
  if (lower.includes("dining")) return "/experiences/private-dining";
  if (lower.includes("muay thai")) return "/experiences/muay-thai-night";
  if (lower.includes("island")) return "/experiences/island-explorer";
  if (city) return `/cities/${city}`;
  return undefined;
}
