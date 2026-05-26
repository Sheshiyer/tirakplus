import type { MuseConversationStage, MuseProfileSignals, MuseRoleIntent } from "./types";

export function fallbackAnswer(stage: MuseConversationStage, roleIntent: MuseRoleIntent, signals: MuseProfileSignals): string {
  // Role-disambiguation gate. While role is unknown, never ask about
  // birth or city — just ask which side Muse should help with.
  if (roleIntent === "unknown") {
    return "Before anything else: are you here to find a private guide for a Thailand trip, or are you joining Tirak Plus as a companion? Tap one of the suggestions below, or say it plainly.";
  }

  if (roleIntent === "companion") {
    if (stage === "arrival") {
      return "Welcome. To set up your companion profile, manage availability, or take inquiries, you will need a Tirak Plus account first. I can help you draft tone and boundaries now, but anything you want to save will need a quick sign-in.";
    }
    if (stage === "desire_mapping") {
      return "Let us make the profile feel composed rather than salesy. Give me the city you work from, the tone you want people to feel, and one boundary that should stay respected.";
    }
    if (stage === "safety_boundaries") {
      return "Now the boundaries. Tell me what you do not want to invite, how visible you want the profile to be, and the kind of inquiry you would decline politely.";
    }
    if (stage === "recommendation_ready") {
      return "Good. I have what I need to draft your profile and shape your inquiry rules. Sign in to save the draft and open your companion onboarding.";
    }
    return "I can help shape the public tone while keeping review details private. Start with the city you work from, your availability style, and what you do not want to invite.";
  }

  // Traveller path (role confirmed).
  if (stage === "arrival") {
    return "Tell me the city, the timing, and the kind of evening you want. I will keep the read private and tune the path before anything is shown.";
  }
  if (stage === "birth_context") {
    return "If you are open to it, share your own birth date, birth place, and time. I keep the method private and translate it into timing, temperament, and fit. Skip it if you would rather not.";
  }
  if (stage === "travel_context") {
    return "Place Thailand on the map for me: which city, which dates, and the kind of evening or guidance you want. I am looking for rhythm, not a checklist.";
  }
  if (stage === "safety_boundaries") {
    return "Before I route anything, give me the privacy and comfort lines. The product is designed to slow down unsafe routing, pressure, and public exposure.";
  }
  if (stage === "recommendation_ready") {
    const city = signals.travelContext.city?.replace("-", " ") ?? "your first city";
    return `I have enough to sketch a discreet path for ${city}. I will keep it private, filter for tone and safety first, then show options only when the fit is clean.`;
  }
  return "Tell me the quiet part plainly: city, mood, privacy line, and what should feel absolutely off-limits.";
}

export function normalizeMuseVoice(value: string): string {
  return value
    .replace(/\bI am reading this through\b/gi, "I am reading this as")
    .replace(/\baccording to\b/gi, "from")
    .replace(/\s+/g, " ")
    .trim();
}

export function voicePass(value: string): boolean {
  const lower = value.toLowerCase();
  return value.length <= 700 && !["according to the context", "the corpus says", "policy requires"].some((phrase) => lower.includes(phrase));
}
