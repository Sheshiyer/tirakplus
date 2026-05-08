import type { CitySummary, CompanionPreview, ExperienceSummary } from "../shared/contracts";

export const cities: CitySummary[] = [
  {
    slug: "bangkok",
    name: "Bangkok",
    tone: "Private evenings, fight nights, rooftops, and composed introductions.",
    trustNote: "Verification and review happen before profiles become visible.",
  },
  {
    slug: "phuket",
    name: "Phuket",
    tone: "Island days, discreet nightlife, and resort-aware planning.",
    trustNote: "Availability is shown as planning context, not fake urgency.",
  },
  {
    slug: "koh-samui",
    name: "Koh Samui",
    tone: "Quiet luxury, beach clubs, wellness pacing, and private dining.",
    trustNote: "Traveller and companion privacy boundaries stay explicit.",
  },
  {
    slug: "koh-phangan",
    name: "Koh Phangan",
    tone: "Night energy, island discovery, and calmer private routes.",
    trustNote: "Safety guidance is built into discovery and inquiry states.",
  },
];

export const experiences: ExperienceSummary[] = [
  {
    slug: "nightlife",
    city: "bangkok",
    title: "Bangkok Nightlife",
    summary: "A quieter concierge path through bars, lounges, and after-dark plans.",
    safetyNote: "No public pressure, ratings, or online-now mechanics.",
  },
  {
    slug: "muay-thai-night",
    city: "bangkok",
    title: "Muay Thai Night",
    summary: "Fight-night planning with respectful local context and clear next steps.",
    safetyNote: "Itinerary context is separate from companion availability.",
  },
  {
    slug: "island-explorer",
    city: "phuket",
    title: "Phuket Island Explorer",
    summary: "Beach clubs, coves, and dinner plans with privacy-aware pacing.",
    safetyNote: "Profiles stay visibility-scoped until verification clears.",
  },
  {
    slug: "private-dining",
    city: "koh-samui",
    title: "Koh Samui Private Dining",
    summary: "A composed route for evenings built around restaurants and resorts.",
    safetyNote: "Payment and booking states stay behind review gates.",
  },
  {
    slug: "local-guidance",
    city: "koh-phangan",
    title: "Koh Phangan Local Guidance",
    summary: "Nightlife and island rhythm without party-flyer energy.",
    safetyNote: "Discovery copy avoids objectifying or explicit framing.",
  },
];

export const companions: CompanionPreview[] = [
  {
    id: "cmp-aura",
    displayName: "Aura",
    city: "bangkok",
    experienceTags: ["nightlife", "muay-thai-night"],
    verificationState: "approved",
    availabilitySummary: "Available for reviewed evening inquiries this week.",
    profileTone: "Confident, locally fluent, and hospitality-minded.",
  },
  {
    id: "cmp-mali",
    displayName: "Mali",
    city: "phuket",
    experienceTags: ["island-explorer", "private-dining"],
    verificationState: "approved",
    availabilitySummary: "Open for resort-area plans after review.",
    profileTone: "Calm, polished, and island-aware.",
  },
  {
    id: "cmp-nara",
    displayName: "Nara",
    city: "koh-samui",
    experienceTags: ["private-dining", "local-guidance"],
    verificationState: "pending_verification",
    availabilitySummary: "Profile is not public until verification completes.",
    profileTone: "Pending review.",
  },
];

export const safetyContent = {
  title: "Safety and discretion",
  principles: [
    "Profiles remain hidden until verification permits visibility.",
    "Inquiry review happens before any payment or introduction step.",
    "No star ratings, hot-or-not mechanics, or fake online urgency.",
    "Payment providers stay disabled until supportability is approved in writing.",
  ],
};
