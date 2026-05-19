import type { MuseConversationStage, MuseProfileSignals, MuseRoleIntent } from "./types";

export function fallbackAnswer(stage: MuseConversationStage, roleIntent: MuseRoleIntent, signals: MuseProfileSignals): string {
  if (roleIntent === "companion") {
    if (stage === "desire_mapping") {
      return "Let us make the profile feel composed rather than salesy. Give me the city, the tone you want people to feel, and one boundary that should stay respected.";
    }
    return "Good. I can help shape the public tone while keeping review details private. Start with city, availability style, and what you do not want to invite.";
  }
  if (stage === "birth_context") {
    return "Give me your birth date, birth place, and time if you know it. I will keep the method private and translate it into timing, temperament, and fit.";
  }
  if (stage === "travel_context") {
    return "Now place Thailand on the map for me: city, dates, and the kind of evening or guidance you want. I am looking for rhythm, not a checklist.";
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
