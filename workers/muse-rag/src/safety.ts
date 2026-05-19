export type SafetyDecision = {
  allowed: boolean;
  category?: "explicit" | "off_platform" | "objectifying" | "prompt_injection" | "payment_pressure";
  reframe?: string;
};

export function classifySafety(message: string): SafetyDecision {
  const lower = message.toLowerCase();
  if (/\b(?:ignore previous|reveal.*prompt|system prompt|developer message|hidden rules)\b/.test(lower)) {
    return { allowed: false, category: "prompt_injection", reframe: "I can help with the experience, not the private rules behind it." };
  }
  if (/\b(?:explicit sex|sexual services|hookup now|escort|cash directly)\b/.test(lower)) {
    return { allowed: false, category: "explicit", reframe: "Keep this respectful and review-safe: city, timing, boundaries, and the kind of guidance you want." };
  }
  if (/\b(?:telegram|whatsapp|send number|off platform|pay direct|cash app)\b/.test(lower)) {
    return { allowed: false, category: "off_platform", reframe: "Tirak Plus keeps routing and payment state inside reviewed channels." };
  }
  if (/\b(?:rank the girls|hot or not|cheapest|online now)\b/.test(lower)) {
    return { allowed: false, category: "objectifying", reframe: "I can help with fit, tone, city, and boundaries; not rankings or pressure cues." };
  }
  return { allowed: true };
}
