import type {
  CitySummary,
  CompanionDraftProfile,
  CompanionInquirySummary,
  CompanionOptionSet,
  CompanionPreview,
  CompanionProfile,
  DiscoveryFilterModel,
  ExperienceSummary,
  HomeEntryPath,
  SafetyContent,
  TravellerInquiryDetail,
} from "../shared/contracts";

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
    safetyNote: "No public pressure cues or browse-volume mechanics.",
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
    city: "phuket",
    title: "Phuket Private Dining",
    summary: "A composed dinner route for resort-area evenings and quieter plans.",
    safetyNote: "Payment and booking states stay behind review gates.",
  },
  {
    slug: "private-dining",
    city: "koh-samui",
    title: "Koh Samui Private Dining",
    summary: "A composed route for evenings built around restaurants and resorts.",
    safetyNote: "Payment and booking states stay behind review gates.",
  },
  {
    slug: "island-explorer",
    city: "koh-samui",
    title: "Koh Samui Island Explorer",
    summary: "Wellness pacing, beach clubs, and calmer island discovery.",
    safetyNote: "Traveller and companion boundaries are shown before inquiry.",
  },
  {
    slug: "local-guidance",
    city: "koh-phangan",
    title: "Koh Phangan Local Guidance",
    summary: "Nightlife and island rhythm without party-flyer energy.",
    safetyNote: "Discovery copy avoids objectifying or explicit framing.",
  },
  {
    slug: "nightlife",
    city: "koh-phangan",
    title: "Koh Phangan Night Energy",
    summary: "After-dark plans framed through boundaries, transport, and local rhythm.",
    safetyNote: "Plans prioritize review context over public browse volume.",
  },
];

export const companionProfiles: CompanionProfile[] = [
  {
    id: "cmp-aura",
    displayName: "Aura",
    city: "bangkok",
    experienceTags: ["nightlife", "muay-thai-night"],
    verificationState: "approved",
    availabilityStatus: "available",
    availabilitySummary: "Available for reviewed evening inquiries this week.",
    profileTone: "Confident, locally fluent, and hospitality-minded.",
    visibilityState: "public",
    bio: "Aura is a Bangkok-based companion with a polished hospitality background and calm familiarity with fight nights, rooftops, private bars, and late dinner pacing.",
    verification: {
      label: "Reviewed and visible",
      reviewNote: "Identity, profile tone, and public visibility have cleared staged review.",
    },
    availabilityWindows: [
      {
        id: "av-aura-1",
        city: "bangkok",
        label: "Evening planning window",
        status: "available",
        note: "Best fit for reviewed nightlife or Muay Thai night inquiries.",
      },
      {
        id: "av-aura-2",
        city: "bangkok",
        label: "Late dinner context",
        status: "tentative",
        note: "Requires human review before any routing decision.",
      },
    ],
    experienceFit: [
      {
        slug: "nightlife",
        title: "Bangkok nightlife",
        fitNote: "Composed routes through lounges, rooftops, and after-dark plans without public pressure cues.",
      },
      {
        slug: "muay-thai-night",
        title: "Muay Thai night",
        fitNote: "Fight-night context with respectful local pacing and clear transport boundaries.",
      },
    ],
    safetyNote: "Inquiry review must complete before any routing, payment, or introduction step.",
    inquiryGuidance: [
      "Use specific city and experience context.",
      "Keep the message respectful and practical.",
      "Payment remains disabled until provider supportability is approved.",
    ],
  },
  {
    id: "cmp-mali",
    displayName: "Mali",
    city: "phuket",
    experienceTags: ["island-explorer", "private-dining"],
    verificationState: "approved",
    availabilityStatus: "available",
    availabilitySummary: "Open for resort-area plans after review.",
    profileTone: "Calm, polished, and island-aware.",
    visibilityState: "public",
    bio: "Mali is oriented around quieter island planning, resort-aware logistics, private dining, and daytime-to-evening Phuket routes.",
    verification: {
      label: "Reviewed and visible",
      reviewNote: "Profile and public discovery fields have cleared staged review.",
    },
    availabilityWindows: [
      {
        id: "av-mali-1",
        city: "phuket",
        label: "Resort-area evening",
        status: "available",
        note: "Best fit for private dining and quieter nightlife context.",
      },
      {
        id: "av-mali-2",
        city: "phuket",
        label: "Island day planning",
        status: "tentative",
        note: "Route details require review before confirmation.",
      },
    ],
    experienceFit: [
      {
        slug: "island-explorer",
        title: "Island explorer",
        fitNote: "Beach clubs, coves, and logistics framed as composed itinerary support.",
      },
      {
        slug: "private-dining",
        title: "Private dining",
        fitNote: "Dinner plans with hotel-aware timing, boundaries, and privacy context.",
      },
    ],
    safetyNote: "Availability is planning context only and must not be treated as instant booking.",
    inquiryGuidance: [
      "Mention resort area and preferred timing.",
      "Avoid explicit or objectifying requests.",
      "Expect human review before any next step.",
    ],
  },
  {
    id: "cmp-nara",
    displayName: "Nara",
    city: "koh-samui",
    experienceTags: ["private-dining", "local-guidance"],
    verificationState: "pending_verification",
    availabilityStatus: "hidden",
    availabilitySummary: "Profile is not public until verification completes.",
    profileTone: "Pending review.",
    visibilityState: "restricted",
    bio: "This profile is still in review and is not available for traveller inquiry.",
    verification: {
      label: "Pending verification",
      reviewNote: "Public profile details remain restricted until review completes.",
    },
    availabilityWindows: [
      {
        id: "av-nara-1",
        city: "koh-samui",
        label: "Hidden until review",
        status: "hidden",
        note: "Availability is not visible during verification.",
      },
    ],
    experienceFit: [
      {
        slug: "private-dining",
        title: "Private dining",
        fitNote: "Fit notes remain hidden until verification completes.",
      },
    ],
    safetyNote: "This profile cannot receive inquiries until verification clears.",
    inquiryGuidance: [
      "Return to discovery for currently visible profiles.",
    ],
  },
  {
    id: "cmp-sora",
    displayName: "Sora",
    city: "koh-phangan",
    experienceTags: ["nightlife", "local-guidance"],
    verificationState: "approved",
    availabilityStatus: "planning_only",
    availabilitySummary: "Planning-only inquiries for island nightlife context.",
    profileTone: "Grounded, practical, and locally fluent.",
    visibilityState: "public",
    bio: "Sora supports calmer Koh Phangan nightlife and local-guidance planning with emphasis on transport, boundaries, and pace.",
    verification: {
      label: "Reviewed and visible",
      reviewNote: "Profile is visible for planning-only inquiries in staged discovery.",
    },
    availabilityWindows: [
      {
        id: "av-sora-1",
        city: "koh-phangan",
        label: "Planning-only window",
        status: "tentative",
        note: "Human review is required before any next action.",
      },
    ],
    experienceFit: [
      {
        slug: "nightlife",
        title: "Koh Phangan night energy",
        fitNote: "After-dark planning with clear transport, privacy, and safety context.",
      },
      {
        slug: "local-guidance",
        title: "Local guidance",
        fitNote: "Island rhythm and quieter route planning without party-flyer energy.",
      },
    ],
    safetyNote: "Planning-only status prevents instant booking or fake urgency mechanics.",
    inquiryGuidance: [
      "Describe the intended route and group context.",
      "Keep the inquiry practical and respectful.",
      "Await review before any routing decision.",
    ],
  },
];

export const companions: CompanionPreview[] = companionProfiles.map(
  ({
    id,
    displayName,
    city,
    experienceTags,
    verificationState,
    availabilityStatus,
    availabilitySummary,
    profileTone,
  }) => ({
    id,
    displayName,
    city,
    experienceTags,
    verificationState,
    availabilityStatus,
    availabilitySummary,
    profileTone,
  }),
);

export const discoveryFilterOptions: DiscoveryFilterModel = {
  cities: [
    { value: "all", label: "All cities", description: "Bangkok, Phuket, Koh Samui, and Koh Phangan." },
    ...cities.map((city) => ({
      value: city.slug,
      label: city.name,
      description: city.tone,
    })),
  ],
  experiences: [
    { value: "all", label: "All experiences", description: "Nightlife, island routes, fight nights, dining, and guidance." },
    { value: "nightlife", label: "Nightlife", description: "Private after-dark planning without pressure cues." },
    { value: "island-explorer", label: "Island explorer", description: "Beach clubs, coves, resorts, and calmer routes." },
    { value: "muay-thai-night", label: "Muay Thai night", description: "Fight-night context with respectful pacing." },
    { value: "private-dining", label: "Private dining", description: "Composed dinner and resort-area plans." },
    { value: "local-guidance", label: "Local guidance", description: "Locally fluent planning and route context." },
  ],
  availability: [
    { value: "any", label: "Any reviewed status", description: "Show visible planning contexts." },
    { value: "available", label: "Reviewed availability", description: "Profiles open for reviewed inquiries." },
    { value: "planning_only", label: "Planning only", description: "Profiles that require extra review before routing." },
  ],
  verified: [
    { value: "approved", label: "Reviewed only", description: "Only profiles cleared for public discovery." },
    { value: "all", label: "Include review states", description: "Includes restricted examples for unavailable-state testing." },
  ],
};

export const travellerInquiries: TravellerInquiryDetail[] = [
  {
    id: "inq-staged-aura",
    companionId: "cmp-aura",
    companionDisplayName: "Aura",
    city: "bangkok",
    experience: "muay-thai-night",
    status: "under_review",
    createdAt: "2026-05-13T09:30:00.000Z",
    updatedAt: "2026-05-13T09:35:00.000Z",
    nextStep: "Human review is checking fit, safety, and provider supportability before routing.",
    message: "A composed Muay Thai night with dinner context and clear transport boundaries.",
    timeline: [
      {
        label: "Inquiry received",
        status: "complete",
        note: "Traveller context and requested experience were captured.",
      },
      {
        label: "Private review",
        status: "active",
        note: "Tirak review checks safety, fit, and next allowed action.",
      },
      {
        label: "Routing decision",
        status: "pending",
        note: "No payment or introduction is available before review clears.",
      },
    ],
    paymentState: {
      status: "disabled_for_compliance",
      provider: "stripe",
      note: "Live payment creation remains blocked until provider supportability is approved.",
    },
    privacyNote: "Inquiry details stay private and are not shown on public profile surfaces.",
  },
];

export const companionDraftProfile: CompanionDraftProfile = {
  id: "cmp-draft-maya",
  displayName: "Maya",
  legalName: "Maya S.",
  city: "bangkok",
  experienceTags: ["nightlife", "private-dining"],
  bio: "Bangkok-based companion focused on composed evenings, private dining, and calm local planning.",
  profileTone: "Warm, composed, hospitality-minded, and clear about boundaries.",
  privateReviewNote: "Prefers reviewed evening plans, hotel-aware logistics, and no public-pressure presentation.",
  verificationReferences: ["Government ID pending secure review", "Profile media pending review"],
  visibilitySettings: {
    publicProfile: false,
    showCity: true,
    showAvailability: false,
    acceptInquiries: false,
  },
  availabilityWindows: [
    {
      id: "av-draft-maya-1",
      city: "bangkok",
      label: "Evening review window",
      status: "tentative",
      note: "Visible only to review until verification clears.",
    },
    {
      id: "av-draft-maya-2",
      city: "bangkok",
      label: "Private dining context",
      status: "hidden",
      note: "Hidden from discovery until public visibility is approved.",
    },
  ],
  reviewStatus: "draft",
  reviewNote: "Complete profile basics, visibility settings, and verification acknowledgements before review.",
  updatedAt: "2026-05-13T10:10:00.000Z",
};

export const companionOptions: CompanionOptionSet = {
  cities: cities.map((city) => ({
    value: city.slug,
    label: city.name,
    description: city.tone,
  })),
  experiences: [
    { value: "nightlife", label: "Nightlife", description: "Private after-dark planning without pressure cues." },
    { value: "island-explorer", label: "Island explorer", description: "Beach clubs, coves, resorts, and calmer routes." },
    { value: "muay-thai-night", label: "Muay Thai night", description: "Fight-night context with respectful pacing." },
    { value: "private-dining", label: "Private dining", description: "Composed dinner and resort-area plans." },
    { value: "local-guidance", label: "Local guidance", description: "Locally fluent planning and route context." },
  ],
};

export const companionReviewStates = [
  {
    status: "draft",
    label: "Draft",
    description: "Profile details are private and editable before submission.",
    action: "Complete basics, visibility, availability, and verification acknowledgements.",
  },
  {
    status: "pending_verification",
    label: "Pending verification",
    description: "Public visibility and inquiries stay paused while review is active.",
    action: "Wait for review or respond if the team asks for more detail.",
  },
  {
    status: "changes_requested",
    label: "Changes requested",
    description: "Specific public fields or private review fields need revision.",
    action: "Edit only the requested sections and resubmit for review.",
  },
  {
    status: "approved",
    label: "Approved",
    description: "The reviewed profile can appear through visibility-controlled discovery.",
    action: "Keep availability current and pause inquiries whenever needed.",
  },
  {
    status: "rejected",
    label: "Not approved",
    description: "The profile remains hidden and cannot receive traveller inquiries.",
    action: "Review the safety guidance and contact support before resubmission.",
  },
] as const;

export const companionInquiries: CompanionInquirySummary[] = [
  {
    id: "cinq-staged-001",
    travellerLabel: "Reviewed traveller inquiry",
    city: "bangkok",
    experience: "private-dining",
    status: "under_review",
    preferredWindow: "Evening review window",
    receivedAt: "2026-05-13T11:00:00.000Z",
    nextStep: "Tirak review checks safety, fit, and allowed routing before sharing direct details.",
    privacyNote: "Traveller identity and contact details stay private until review clears.",
  },
  {
    id: "cinq-staged-002",
    travellerLabel: "Planning inquiry",
    city: "phuket",
    experience: "island-explorer",
    status: "payment_review",
    preferredWindow: "Resort-area evening",
    receivedAt: "2026-05-12T15:20:00.000Z",
    nextStep: "Payment remains disabled while provider supportability is checked.",
    privacyNote: "No off-platform payment or pressure cue is shown to the companion.",
  },
];

export const entryPaths: HomeEntryPath[] = [
  {
    role: "traveller",
    label: "Traveller path",
    heading: "Plan a discreet Thailand introduction.",
    description: "Start with city and experience context, then send a private inquiry after reviewing safety guidance.",
    href: "/traveller",
  },
  {
    role: "companion",
    label: "Companion path",
    heading: "Register with visibility control.",
    description: "Create a reviewed profile, set boundaries and availability, and stay hidden until verification clears.",
    href: "/companion",
  },
];

export const safetyContent: SafetyContent = {
  title: "Safety and discretion",
  principles: [
    "Profiles remain hidden until verification permits visibility.",
    "Inquiry review happens before any payment or introduction step.",
    "No person-ranking mechanics, pressure cues, or browse-volume loops.",
    "Payment providers stay disabled until supportability is approved in writing.",
  ],
};
