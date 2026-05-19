import type { MuseChatResponse, MuseConversationStage, MuseProfileSignals, MuseRoleIntent } from "./types";

export function nextAction(
  stage: MuseConversationStage,
  signals: MuseProfileSignals,
  roleIntent: MuseRoleIntent,
): MuseChatResponse["nextAction"] {
  if (stage !== "recommendation_ready") return { label: "Continue with Muse", href: "/", kind: "continue" };
  if (roleIntent === "companion" || signals.routingHints.suggestedRole === "companion") {
    return { label: "Open companion assist", href: "/auth/login", kind: "auth" };
  }
  return { label: "Review private discovery", href: "/auth/login", kind: "auth" };
}
