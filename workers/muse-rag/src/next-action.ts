import type { MuseChatResponse, MuseConversationStage, MuseProfileSignals, MuseRoleIntent } from "./types";

/**
 * Next-action selection.
 *
 * For COMPANIONS we surface the auth handoff EARLY (right after role is
 * confirmed and the first tone/profile question lands) because nothing
 * they do can be saved without an account. For travellers we wait until
 * recommendation_ready so the conversation does the work first.
 */
export function nextAction(
  stage: MuseConversationStage,
  signals: MuseProfileSignals,
  roleIntent: MuseRoleIntent,
): MuseChatResponse["nextAction"] {
  // Unknown role → keep them in the chat to disambiguate; no jumping yet.
  if (roleIntent === "unknown") {
    return { label: "Continue with Muse", href: "/", kind: "continue" };
  }

  // Companion: push to sign-in / onboarding as soon as the first
  // tone/profile turn lands so they know an account is required.
  if (roleIntent === "companion") {
    if (stage === "arrival") {
      return { label: "Continue with Muse", href: "/", kind: "continue" };
    }
    if (stage === "recommendation_ready") {
      return { label: "Open companion onboarding", href: "/companion/onboarding", kind: "route" };
    }
    // desire_mapping or safety_boundaries — they have draft material to save.
    return { label: "Sign in to save your draft", href: "/auth/start?role=companion", kind: "auth" };
  }

  // Traveller: hold the auth handoff until we actually have a recommendation.
  if (stage !== "recommendation_ready") {
    return { label: "Continue with Muse", href: "/", kind: "continue" };
  }
  return { label: "Open private discovery", href: "/auth/start?role=traveller", kind: "auth" };
}
