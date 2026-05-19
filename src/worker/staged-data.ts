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
  MuseChartSignature,
  SafetyContent,
  TravellerDashboardResponse,
  TravellerInquiryDetail,
  TravellerSessionDetail,
  CompanionSessionDetail,
} from "../shared/contracts";

export const travellerMuseChart: MuseChartSignature = {
  title: "Muse chart",
  tagline: "Private Thailand, tuned to your rhythm.",
  summary: "Muse is holding the first read as mood, timing, boundary, and city fit before any profile appears.",
  axes: [
    { label: "Mood", value: "warm private", tone: "rose" },
    { label: "Pace", value: "slow reveal", tone: "lavender" },
    { label: "Boundary", value: "discreet", tone: "green" },
    { label: "Route", value: "city first", tone: "pearl" },
  ],
  cues: ["Ask for city and window", "Clarify visibility", "Route only after fit is clean"],
  nextPrompt: "Tell Muse the city, the mood, and what should stay off-limits.",
};

export const companionMuseChart: MuseChartSignature = {
  title: "Muse chart",
  tagline: "Let the right people understand you faster.",
  summary: "Muse frames public tone, privacy controls, and availability so the profile reads polished without overexposure.",
  axes: [
    { label: "Tone", value: "composed", tone: "rose" },
    { label: "Visibility", value: "review-gated", tone: "green" },
    { label: "Fit", value: "hospitality", tone: "lavender" },
    { label: "Pace", value: "controlled", tone: "pearl" },
  ],
  cues: ["Keep public copy practical", "Separate private review fields", "Open availability only after approval"],
  nextPrompt: "Ask Muse to sharpen your public tone before you submit.",
};

export const cities: CitySummary[] = [
  {
    slug: "bangkok",
    name: "Bangkok",
    tone: "Rooftops, fight nights, private bars, and late dinners work best when timing and transport are planned before introductions.",
    trustNote: "Muse shapes the city read first; verification and review happen before protected profiles become visible.",
  },
  {
    slug: "phuket",
    name: "Phuket",
    tone: "Resort-area evenings, island days, and quieter nightlife need a route that respects privacy, distance, and pace.",
    trustNote: "Availability is planning context only; no public pressure cue or instant booking promise is shown.",
  },
  {
    slug: "koh-samui",
    name: "Koh Samui",
    tone: "Wellness pacing, beach clubs, villa dinners, and composed island evenings call for a calmer discovery rhythm.",
    trustNote: "Traveller and companion privacy boundaries stay explicit before any inquiry can move forward.",
  },
  {
    slug: "koh-phangan",
    name: "Koh Phangan",
    tone: "Night energy and island discovery can sit beside quieter routes when boundaries and transport are named early.",
    trustNote: "Safety guidance is built into discovery and inquiry states instead of being left to the end.",
  },
];

export const experiences: ExperienceSummary[] = [
  {
    slug: "nightlife",
    city: "bangkok",
    title: "Bangkok Nightlife",
    summary: "A composed route through lounges, rooftops, and after-dark plans with transport and privacy named upfront.",
    safetyNote: "No public pressure cues or browse-volume mechanics.",
  },
  {
    slug: "muay-thai-night",
    city: "bangkok",
    title: "Muay Thai Night",
    summary: "Fight-night planning that keeps local context, seating, timing, and the next step practical.",
    safetyNote: "Itinerary context is separate from companion availability.",
  },
  {
    slug: "island-explorer",
    city: "phuket",
    title: "Phuket Island Explorer",
    summary: "Beach clubs, coves, and dinner plans paced around resort geography and a quieter public footprint.",
    safetyNote: "Profiles stay visibility-scoped until verification clears.",
  },
  {
    slug: "private-dining",
    city: "phuket",
    title: "Phuket Private Dining",
    summary: "Restaurant and resort-area evenings framed around timing, discretion, and review before routing.",
    safetyNote: "Payment and booking states stay behind review gates.",
  },
  {
    slug: "private-dining",
    city: "koh-samui",
    title: "Koh Samui Private Dining",
    summary: "Villa, restaurant, and resort evenings shaped around quiet luxury rather than public browse pressure.",
    safetyNote: "Payment and booking states stay behind review gates.",
  },
  {
    slug: "island-explorer",
    city: "koh-samui",
    title: "Koh Samui Island Explorer",
    summary: "Wellness pacing, beach clubs, and calmer discovery with boundaries understood before introductions.",
    safetyNote: "Traveller and companion boundaries are shown before inquiry.",
  },
  {
    slug: "local-guidance",
    city: "koh-phangan",
    title: "Koh Phangan Local Guidance",
    summary: "Local rhythm, transport awareness, and calmer planning without party-flyer energy.",
    safetyNote: "Discovery copy avoids objectifying or explicit framing.",
  },
  {
    slug: "nightlife",
    city: "koh-phangan",
    title: "Koh Phangan Night Energy",
    summary: "After-dark plans framed through boundaries, transport, and local rhythm before anything protected opens.",
    safetyNote: "Plans prioritize review context over public browse volume.",
  },
];

export const companionProfiles: CompanionProfile[] = [
  {
    id: "cmp-aura",
    displayName: "Aura",
    avatarUrl: "/assets/profiles/companion-aura.png",
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
    chart: {
      ...travellerMuseChart,
      axes: [
        { label: "City", value: "Bangkok", tone: "pearl" },
        { label: "Mood", value: "polished night", tone: "rose" },
        { label: "Pace", value: "confident", tone: "lavender" },
        { label: "Boundary", value: "review first", tone: "green" },
      ],
      summary: "Best read for travellers who want Bangkok energy with a composed, review-first path.",
    },
  },
  {
    id: "cmp-mali",
    displayName: "Mali",
    avatarUrl: "/assets/profiles/companion-mali.png",
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
    chart: {
      ...travellerMuseChart,
      axes: [
        { label: "City", value: "Phuket", tone: "pearl" },
        { label: "Mood", value: "quiet premium", tone: "rose" },
        { label: "Pace", value: "resort-aware", tone: "lavender" },
        { label: "Boundary", value: "private", tone: "green" },
      ],
      summary: "Best read for quieter island plans, private dining, and hotel-aware timing.",
    },
  },
  {
    id: "cmp-nara",
    displayName: "Nara",
    avatarUrl: "/assets/profiles/companion-nara.png",
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
    chart: {
      ...travellerMuseChart,
      axes: [
        { label: "City", value: "Samui", tone: "pearl" },
        { label: "Mood", value: "hidden", tone: "lavender" },
        { label: "Pace", value: "pending", tone: "rose" },
        { label: "Boundary", value: "not public", tone: "green" },
      ],
      summary: "Muse keeps this profile out of view until review clears.",
    },
  },
  {
    id: "cmp-sora",
    displayName: "Sora",
    avatarUrl: "/assets/profiles/companion-sora.png",
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
    chart: {
      ...travellerMuseChart,
      axes: [
        { label: "City", value: "Phangan", tone: "pearl" },
        { label: "Mood", value: "grounded night", tone: "rose" },
        { label: "Pace", value: "planning only", tone: "lavender" },
        { label: "Boundary", value: "transport clear", tone: "green" },
      ],
      summary: "Best read for island rhythm with logistics and boundaries made explicit.",
    },
  },
];

export const companions: CompanionPreview[] = companionProfiles.map(
  ({
    id,
    displayName,
    avatarUrl,
    city,
    experienceTags,
    verificationState,
    availabilityStatus,
    availabilitySummary,
    profileTone,
  }) => ({
    id,
    displayName,
    avatarUrl,
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

export const travellerSessions: TravellerSessionDetail[] = [
  {
    id: "sess-bkk-aura-001",
    inquiryId: "inq-staged-aura",
    companionId: "cmp-aura",
    companionDisplayName: "Aura",
    companionAvatarUrl: "/assets/profiles/companion-aura.png",
    city: "bangkok",
    experience: "muay-thai-night",
    status: "reviewing",
    scheduledFor: "2026-05-22T14:30:00.000Z",
    venueArea: "Ratchadamnoen / riverside dinner route",
    routeLabel: "Fight night with calm dinner pacing",
    nextStep: "Muse is holding the route while review confirms timing, transport, and fit.",
    museRead: {
      ...travellerMuseChart,
      tagline: "A high-energy night that still needs a quiet control point.",
      summary: "Muse reads this as a confident Bangkok plan, but keeps transport and privacy checkpoints visible before routing.",
      axes: [
        { label: "Energy", value: "bright night", tone: "rose" },
        { label: "Pace", value: "structured", tone: "lavender" },
        { label: "Privacy", value: "review held", tone: "green" },
        { label: "Route", value: "fight + dinner", tone: "pearl" },
      ],
      nextPrompt: "Ask Muse to tighten the dinner stop or adjust the pickup boundary.",
    },
    itinerary: [
      {
        label: "Inquiry context captured",
        status: "complete",
        note: "City, timing, experience, and first boundary notes are attached.",
      },
      {
        label: "Fit and safety review",
        status: "active",
        note: "Review checks traveller intent, companion visibility, and route practicality.",
      },
      {
        label: "Payment provider gate",
        status: "blocked",
        note: "Live payment remains disabled until provider supportability is approved.",
      },
      {
        label: "Final routing",
        status: "pending",
        note: "Contact and exact route stay private until review clears.",
      },
    ],
    messageThread: [
      {
        id: "msg-muse-session-1",
        role: "muse",
        content: "I like the Bangkok rhythm here. Keep the fight-night energy, but give the evening one calm handoff point.",
        createdAt: "2026-05-19T07:40:00.000Z",
      },
      {
        id: "msg-user-session-1",
        role: "user",
        content: "Make it polished and private. No rushed routing.",
        createdAt: "2026-05-19T07:41:00.000Z",
      },
      {
        id: "msg-muse-session-2",
        role: "muse",
        content: "Then I will keep it review-first: fight night, dinner context, transport named, no pressure cue.",
        createdAt: "2026-05-19T07:42:00.000Z",
      },
    ],
    safetyNotes: [
      "Exact meeting and contact details stay hidden until review clears.",
      "Transport boundaries stay attached to the route.",
      "Off-platform payment requests should be reported from the session detail.",
    ],
    paymentState: travellerInquiries[0].paymentState,
    privacyNote: "Session details are visible only in the protected traveller workspace and companion review tools.",
  },
  {
    id: "sess-phuket-mali-002",
    inquiryId: "inq-staged-mali",
    companionId: "cmp-mali",
    companionDisplayName: "Mali",
    companionAvatarUrl: "/assets/profiles/companion-mali.png",
    city: "phuket",
    experience: "private-dining",
    status: "awaiting_confirmation",
    scheduledFor: "2026-05-24T13:00:00.000Z",
    venueArea: "Kata / Nai Harn resort corridor",
    routeLabel: "Quiet resort dinner with island pacing",
    nextStep: "Confirm resort area and timing before the route can move into review.",
    museRead: {
      ...travellerMuseChart,
      tagline: "A quieter island plan with privacy doing most of the work.",
      summary: "Muse is weighting hotel-aware timing, soft pacing, and clear boundaries above nightlife energy.",
      axes: [
        { label: "Energy", value: "quiet premium", tone: "rose" },
        { label: "Pace", value: "slow evening", tone: "lavender" },
        { label: "Privacy", value: "hotel-aware", tone: "green" },
        { label: "Route", value: "dinner", tone: "pearl" },
      ],
      nextPrompt: "Tell Muse if the route should stay near the resort or open toward a beach-club dinner.",
    },
    itinerary: [
      { label: "Draft route", status: "complete", note: "Private dining context and area are saved." },
      { label: "Traveller confirmation", status: "active", note: "A clearer pickup boundary is needed before review." },
      { label: "Companion review", status: "pending", note: "Mali sees only review-safe context until routing." },
      { label: "Payment provider gate", status: "blocked", note: "Payment remains disabled in staged mode." },
    ],
    messageThread: [
      {
        id: "msg-muse-session-3",
        role: "muse",
        content: "This one should stay soft. Pick a resort corridor first, then the evening can breathe.",
        createdAt: "2026-05-19T08:10:00.000Z",
      },
    ],
    safetyNotes: [
      "Do not reveal hotel room or personal contact details in chat.",
      "Keep itinerary changes inside the review thread.",
    ],
    paymentState: {
      status: "disabled_for_compliance",
      provider: "manual_review",
      note: "Manual review is the only staged payment path until provider approval exists.",
    },
    privacyNote: "The Phuket plan is saved as a private route preview, not a confirmed booking.",
  },
];

export const travellerDashboard: TravellerDashboardResponse = {
  chart: {
    ...travellerMuseChart,
    tagline: "Muse is already reading your Thailand rhythm.",
    summary: "The protected workspace starts with active context, reviewed profiles, and session states instead of a blank dashboard.",
    nextPrompt: "Ask Muse to compare Bangkok energy with a quieter island route.",
  },
  greeting: "Welcome back to your private route board.",
  summary: "Your current plans are review-first: one Bangkok route is being checked, one Phuket dinner needs a tighter boundary, and Muse is keeping both calm.",
  metrics: [
    { label: "Active plans", value: "2", note: "Review-held, not instant bookings." },
    { label: "Saved profiles", value: "3", note: "Only reviewed public profiles are shown." },
    { label: "Next review", value: "Today", note: "Fit, safety, and provider checks stay visible." },
  ],
  activeInquiry: travellerInquiries[0],
  upcomingSession: travellerSessions[0],
  savedProfiles: companions.filter((profile) => profile.verificationState === "approved").slice(0, 3),
  sessionPreview: travellerSessions.map(({ museRead, itinerary, messageThread, safetyNotes, paymentState, privacyNote, ...summary }) => summary),
  guidance: [
    "Muse can shape the route before you open profile detail.",
    "Every plan keeps review, payment, and privacy states visible.",
    "No public ranking, urgency, or online-now loops are used inside the workspace.",
  ],
};

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

export const companionSessionDetails: CompanionSessionDetail[] = [
  {
    ...companionInquiries[0],
    travellerContext:
      "Traveller is asking for a composed Bangkok private-dining evening with hotel-aware transport and no rushed routing.",
    museFit: {
      ...companionMuseChart,
      tagline: "A composed request that needs one more boundary check.",
      summary: "Muse reads the request as practical and hospitality-led, with final routing paused until Tirak review clears.",
      axes: [
        { label: "Tone", value: "polite", tone: "rose" },
        { label: "Route", value: "dinner", tone: "pearl" },
        { label: "Boundary", value: "needs review", tone: "green" },
        { label: "Pace", value: "calm", tone: "lavender" },
      ],
      nextPrompt: "Use Muse to make your reply clear without revealing private details.",
    },
    decisionOptions: [
      {
        label: "Ask review to clarify",
        value: "request_review",
        description: "Keep the request active while asking Tirak for more route or boundary context.",
      },
      {
        label: "Accept after review",
        value: "accept_after_review",
        description: "Mark willingness to proceed only if Tirak review and compliance gates clear.",
      },
      {
        label: "Decline safely",
        value: "decline_safely",
        description: "Close the request without sharing private contact or availability details.",
      },
    ],
    checklist: [
      { label: "Traveller context", status: "complete", note: "The request includes city, timing, and tone." },
      { label: "Companion boundary", status: "active", note: "A response can name limits without exposing contact details." },
      { label: "Payment gate", status: "blocked", note: "Provider supportability is not approved yet." },
      { label: "Routing", status: "pending", note: "Tirak review must clear before any introduction." },
    ],
    messageThread: [
      {
        id: "msg-companion-1",
        role: "muse",
        content: "This reads respectful. Keep your answer warm, but let review carry the specifics.",
        createdAt: "2026-05-19T08:25:00.000Z",
      },
    ],
    paymentState: {
      status: "disabled_for_compliance",
      provider: "manual_review",
      note: "The companion cannot request payment or move money outside approved rails.",
    },
  },
  {
    ...companionInquiries[1],
    travellerContext:
      "Traveller is exploring a Phuket island route. The area is broad, so review is holding the plan until timing and transport are more precise.",
    museFit: companionMuseChart,
    decisionOptions: [
      {
        label: "Request clearer route",
        value: "request_review",
        description: "Ask review to narrow city area, timing, and transport before you decide.",
      },
      {
        label: "Decline safely",
        value: "decline_safely",
        description: "Close the request while keeping your private details hidden.",
      },
    ],
    checklist: [
      { label: "Route clarity", status: "active", note: "The request needs a clearer resort corridor." },
      { label: "Visibility control", status: "complete", note: "Your profile stays visibility-scoped." },
      { label: "Payment gate", status: "blocked", note: "No payment request can be sent." },
    ],
    messageThread: [
      {
        id: "msg-companion-2",
        role: "muse",
        content: "Keep this one in review until the island route stops feeling too wide.",
        createdAt: "2026-05-19T08:32:00.000Z",
      },
    ],
    paymentState: {
      status: "disabled_for_compliance",
      provider: "manual_review",
      note: "Payment stays disabled while supportability is unresolved.",
    },
  },
];

export const entryPaths: HomeEntryPath[] = [
  {
    role: "traveller",
    label: "Traveller path",
    heading: "Plan a discreet Thailand introduction.",
    description: "Start with city and experience context, then send a private inquiry after reviewing safety guidance.",
    href: "/auth/login?role=traveller",
  },
  {
    role: "companion",
    label: "Companion path",
    heading: "Register with visibility control.",
    description: "Create a reviewed profile, set boundaries and availability, and stay hidden until verification clears.",
    href: "/auth/login?role=companion",
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
