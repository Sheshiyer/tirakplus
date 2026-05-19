import type { MuseConversationStage, MuseProfileSignals, MuseRoleIntent } from "./types";

export function inferStage(
  currentStage: MuseConversationStage,
  signals: MuseProfileSignals,
  roleIntent: MuseRoleIntent,
  message: string,
): MuseConversationStage {
  const lower = message.toLowerCase();
  if (roleIntent === "companion" && /\b(?:bio|profile|services|tone|visibility)\b/.test(lower)) return "desire_mapping";
  if (signals.birthContext.confidence === "none" && roleIntent !== "companion") return "birth_context";
  if (!signals.travelContext.city && signals.travelContext.experienceHints.length === 0 && roleIntent !== "companion") return "travel_context";
  if (signals.desireVector.length === 0) return "desire_mapping";
  if (signals.boundarySignals.length === 0) return "safety_boundaries";
  return currentStage === "safety_boundaries" ? "recommendation_ready" : currentStage === "arrival" ? "birth_context" : currentStage;
}

export function suggestedPrompts(stage: MuseConversationStage, roleIntent: MuseRoleIntent): string[] {
  if (roleIntent === "companion") {
    if (stage === "desire_mapping") return ["Help me make my bio composed, not salesy", "Make my service notes clearer and safer"];
    if (stage === "safety_boundaries") return ["Set visibility and inquiry boundaries", "Shape a polite decline reply"];
    return ["Help me onboard as a companion", "Tune my profile for review"];
  }
  if (stage === "birth_context") return ["Born 14/08/1992 in London, time unknown", "I know my date and city but not time"];
  if (stage === "travel_context") return ["Bangkok this weekend, private but warm", "Phuket for a quiet premium evening"];
  if (stage === "desire_mapping") return ["Witty, calm, discreet, no chaos", "Local guidance with polished nightlife"];
  if (stage === "safety_boundaries") return ["Keep it private and slow paced", "No off-platform pressure or public visibility"];
  return ["Show me the private path", "Help me refine the fit first"];
}
