import type { MuseConversationStage, MuseProfileSignals, MuseRoleIntent } from "./types";

/**
 * Stage progression with EXPLICIT role gate:
 *
 *  - role=unknown  → stay at `arrival` forever (Muse must disambiguate
 *                    role before asking anything else)
 *  - role=companion → arrival → desire_mapping (skip birth_context AND
 *                    travel_context — these belong to the traveller flow)
 *  - role=traveller → arrival → birth_context → travel_context →
 *                    desire_mapping → safety_boundaries → recommendation_ready
 *
 * This kills the "Muse asks about birth date before role is known" failure
 * surfaced in the 2026-05-26 UI test.
 */
export function inferStage(
  currentStage: MuseConversationStage,
  signals: MuseProfileSignals,
  roleIntent: MuseRoleIntent,
  message: string,
): MuseConversationStage {
  // Role gate: unknown stays in arrival until disambiguated.
  if (roleIntent === "unknown") return "arrival";

  const lower = message.toLowerCase();

  if (roleIntent === "companion") {
    // Companion path: NO birth/travel context questions. Move to
    // profile/tone work, then boundaries, then handoff.
    if (signals.desireVector.length === 0 && currentStage === "arrival") return "desire_mapping";
    if (signals.boundarySignals.length === 0 && currentStage === "desire_mapping") return "safety_boundaries";
    if (currentStage === "safety_boundaries") return "recommendation_ready";
    // If they explicitly mention profile/bio/tone/visibility while still in arrival.
    if (/\b(?:bio|profile|services|tone|visibility|availability)\b/.test(lower)) return "desire_mapping";
    return currentStage === "arrival" ? "desire_mapping" : currentStage;
  }

  // Traveller path (role confirmed).
  if (signals.birthContext.confidence === "none") return "birth_context";
  if (!signals.travelContext.city && signals.travelContext.experienceHints.length === 0) return "travel_context";
  if (signals.desireVector.length === 0) return "desire_mapping";
  if (signals.boundarySignals.length === 0) return "safety_boundaries";
  return currentStage === "safety_boundaries" ? "recommendation_ready" : currentStage === "arrival" ? "birth_context" : currentStage;
}

export function suggestedPrompts(stage: MuseConversationStage, roleIntent: MuseRoleIntent): string[] {
  // Arrival with unknown role: surface the disambiguation choices as
  // tappable chips so the user doesn't have to phrase it themselves.
  if (stage === "arrival" && roleIntent === "unknown") {
    return [
      "I'm planning a Thailand trip and want a private guide",
      "I want to join as a companion",
    ];
  }

  if (roleIntent === "companion") {
    if (stage === "arrival") return ["Help me set up my companion profile", "Show me how booking and availability work"];
    if (stage === "desire_mapping") return ["Help me make my bio composed, not salesy", "Make my service notes clearer and safer"];
    if (stage === "safety_boundaries") return ["Set visibility and inquiry boundaries", "Shape a polite decline reply"];
    if (stage === "recommendation_ready") return ["Open my companion onboarding", "Show my booking availability"];
    return ["Help me onboard as a companion", "Tune my profile for review"];
  }

  // Traveller path.
  if (stage === "arrival") return ["Bangkok this weekend, private but warm", "I know my date and city but not time"];
  if (stage === "birth_context") return ["Born 14/08/1992 in London, time unknown", "I know my date and city but not time"];
  if (stage === "travel_context") return ["Bangkok this weekend, private but warm", "Phuket for a quiet premium evening"];
  if (stage === "desire_mapping") return ["Witty, calm, discreet, no chaos", "Local guidance with polished nightlife"];
  if (stage === "safety_boundaries") return ["Keep it private and slow paced", "No off-platform pressure or public visibility"];
  return ["Show me the private path", "Help me refine the fit first"];
}
