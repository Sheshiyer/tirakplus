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
  title: "Muse signal",
  tagline: "Private Thailand, tuned to your rhythm.",
  summary: "Muse is shaping your path around mood, timing, boundaries, and city fit.",
  axes: [
    { label: "Mood", value: "warm private", tone: "rose" },
    { label: "Pace", value: "slow reveal", tone: "lavender" },
    { label: "Boundary", value: "discreet", tone: "green" },
    { label: "Path", value: "city first", tone: "pearl" },
  ],
  cues: ["Choose a city window", "Name the mood", "Keep the pace comfortable"],
  nextPrompt: "Tell Muse the city, the mood, and what stays off-limits.",
};

export const companionMuseChart: MuseChartSignature = {
  title: "Muse read",
  tagline: "A calmer profile starts here.",
  summary: "Muse helps keep tone, privacy, and timing clear before your profile is shared.",
  axes: [
    { label: "Tone", value: "composed", tone: "rose" },
    { label: "Privacy", value: "your pace", tone: "green" },
    { label: "Fit", value: "hospitality", tone: "lavender" },
    { label: "Pace", value: "calm", tone: "pearl" },
  ],
  cues: ["Keep the bio practical", "Separate private notes", "Share availability only when ready"],
  nextPrompt: "Ask Muse to sharpen your profile tone before you submit.",
};

export const cities: CitySummary[] = [
  {
    slug: "bangkok",
    name: "Bangkok",
    tone: "Rooftops, fight nights, private bars, and late dinners work best when timing and transport are planned before introductions.",
    trustNote: "Muse reads the city first; reviewed profiles appear only after the plan is clear.",
  },
  {
    slug: "phuket",
    name: "Phuket",
    tone: "Resort-area evenings, island days, and quieter nightlife need a route that respects privacy, distance, and pace.",
    trustNote: "Availability helps set expectations without creating a rush.",
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
    safetyNote: "No pressure counters or hurry-up cues.",
  },
  {
    slug: "muay-thai-night",
    city: "bangkok",
    title: "Muay Thai Night",
    summary: "Fight-night planning that keeps local context, seating, timing, and the next step practical.",
    safetyNote: "Plan details stay separate from companion availability.",
  },
  {
    slug: "island-explorer",
    city: "phuket",
    title: "Phuket Island Explorer",
    summary: "Beach clubs, coves, and dinner plans paced around resort geography and a quieter public footprint.",
    safetyNote: "Profiles stay private until the details are checked.",
  },
  {
    slug: "private-dining",
    city: "phuket",
    title: "Phuket Private Dining",
    summary: "Restaurant and resort-area evenings framed around timing, discretion, and review before introductions.",
    safetyNote: "Payment and booking actions appear only after review.",
  },
  {
    slug: "private-dining",
    city: "koh-samui",
    title: "Koh Samui Private Dining",
    summary: "Villa, restaurant, and resort evenings shaped around quiet luxury rather than public browse pressure.",
    safetyNote: "Payment and booking actions appear only after review.",
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
    safetyNote: "Requests stay practical and respectful.",
  },
  {
    slug: "nightlife",
    city: "koh-phangan",
    title: "Koh Phangan Night Energy",
    summary: "After-dark plans framed through boundaries, transport, and local rhythm from the start.",
    safetyNote: "Plans prioritize clarity over browsing.",
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
    availabilitySummary: "Available for select evening plans this week.",
    profileTone: "Confident, locally fluent, and hospitality-minded.",
    visibilityState: "public",
    bio: "Aura is a Bangkok-based companion with a polished hospitality background and calm familiarity with fight nights, rooftops, private bars, and late dinner pacing.",
    verification: {
      label: "Reviewed and visible",
      reviewNote: "Aura's profile has been reviewed for identity, tone, and presentation.",
    },
    availabilityWindows: [
      {
        id: "av-aura-1",
        city: "bangkok",
        label: "Evening planning window",
        status: "available",
        note: "Best for composed nightlife or Muay Thai night plans.",
      },
      {
        id: "av-aura-2",
        city: "bangkok",
        label: "Late dinner",
        status: "tentative",
        note: "Works best when dinner timing and transport are named early.",
      },
    ],
    experienceFit: [
      {
        slug: "nightlife",
        title: "Bangkok nightlife",
        fitNote: "Composed routes through lounges, rooftops, and after-dark plans.",
      },
      {
        slug: "muay-thai-night",
        title: "Muay Thai night",
        fitNote: "Fight-night context with respectful local pacing and clear transport boundaries.",
      },
    ],
    safetyNote: "Start with a respectful plan, not a rushed request.",
    inquiryGuidance: [
      "Use specific city and experience details.",
      "Keep the message respectful and practical.",
      "Keep payment and contact details out of the first message.",
    ],
    chart: {
      ...travellerMuseChart,
      axes: [
        { label: "City", value: "Bangkok", tone: "pearl" },
        { label: "Mood", value: "polished night", tone: "rose" },
        { label: "Pace", value: "confident", tone: "lavender" },
        { label: "Boundary", value: "private", tone: "green" },
      ],
      summary: "Best read for travellers who want Bangkok energy with a composed path.",
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
    availabilitySummary: "Open for resort-area plans with clear timing.",
    profileTone: "Calm, polished, and island-aware.",
    visibilityState: "public",
    bio: "Mali is oriented around quieter island planning, resort-aware logistics, private dining, and daytime-to-evening Phuket routes.",
    verification: {
      label: "Reviewed and visible",
      reviewNote: "Mali's public profile has been reviewed for clarity and tone.",
    },
    availabilityWindows: [
      {
        id: "av-mali-1",
        city: "phuket",
        label: "Resort-area evening",
        status: "available",
        note: "Best fit for private dining and quieter nightlife.",
      },
      {
        id: "av-mali-2",
        city: "phuket",
        label: "Island day planning",
        status: "tentative",
        note: "Works best once resort area and transport timing are clear.",
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
        fitNote: "Dinner plans with hotel-aware timing and a clear route.",
      },
    ],
    safetyNote: "Good first details",
    inquiryGuidance: [
      "Resort area",
      "Preferred dinner time",
      "Route or transport needs",
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
    availabilitySummary: "Not available yet.",
    profileTone: "Coming soon.",
    visibilityState: "restricted",
    bio: "Nara is not available for traveller inquiries yet.",
    verification: {
      label: "Pending verification",
      reviewNote: "This profile is not ready for introductions.",
    },
    availabilityWindows: [
      {
        id: "av-nara-1",
        city: "koh-samui",
        label: "Not available",
        status: "hidden",
        note: "Check back after the profile opens.",
      },
    ],
    experienceFit: [
      {
        slug: "private-dining",
        title: "Private dining",
        fitNote: "Fit details will appear when the profile opens.",
      },
    ],
    safetyNote: "Choose another visible profile for now.",
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
      summary: "Muse will show this profile when it is ready.",
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
      reviewNote: "Sora is visible for planning conversations.",
    },
    availabilityWindows: [
      {
        id: "av-sora-1",
        city: "koh-phangan",
        label: "Planning-only window",
        status: "tentative",
        note: "Best once the route and transport plan are clear.",
      },
    ],
    experienceFit: [
      {
        slug: "nightlife",
        title: "Koh Phangan night energy",
        fitNote: "After-dark planning with clear transport and pace.",
      },
      {
        slug: "local-guidance",
        title: "Local guidance",
        fitNote: "Island rhythm and quieter route planning without party-flyer energy.",
      },
    ],
    safetyNote: "Use this for planning first, then refine the route.",
    inquiryGuidance: [
      "Describe the intended route and group context.",
      "Keep the inquiry practical and respectful.",
      "Keep contact and payment details out of the first message.",
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
    { value: "local-guidance", label: "Local guidance", description: "Locally fluent planning and calm orientation." },
  ],
  availability: [
    { value: "any", label: "Any timing", description: "Show all visible options." },
    { value: "available", label: "Open this week", description: "Profiles with current planning windows." },
    { value: "planning_only", label: "Needs more detail", description: "Best when your route is still taking shape." },
  ],
  verified: [
    { value: "approved", label: "Available profiles", description: "People you can open now." },
    { value: "all", label: "Show unavailable too", description: "Includes profiles that are not open yet." },
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
    nextStep: "Fit and timing are being checked.",
    message: "A composed Muay Thai night with dinner timing and clear transport.",
    timeline: [
      {
        label: "Inquiry received",
        status: "complete",
        note: "Your city, timing, and plan were received.",
      },
      {
      label: "Tirak check",
      status: "active",
      note: "Tirak is checking tone, timing, and route fit.",
      },
      {
        label: "Introduction decision",
        status: "pending",
        note: "Next steps appear here when the plan is ready.",
      },
    ],
    paymentState: {
      status: "disabled_for_compliance",
      provider: "stripe",
      note: "Card checkout waits here until this plan is cleared.",
    },
    privacyNote: "Only you and the Tirak team can see this inquiry thread.",
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
    nextStep: "Choose the dinner handoff point so the evening has one calm anchor.",
    museRead: {
      ...travellerMuseChart,
      tagline: "A high-energy night that still needs a quiet control point.",
      summary: "Muse reads this as a confident Bangkok plan with transport as the key detail.",
      axes: [
        { label: "Energy", value: "bright night", tone: "rose" },
        { label: "Pace", value: "structured", tone: "lavender" },
        { label: "Privacy", value: "discreet", tone: "green" },
        { label: "Route", value: "fight + dinner", tone: "pearl" },
      ],
      nextPrompt: "Ask Muse to tighten the dinner stop or adjust the pickup boundary.",
    },
    itinerary: [
      {
        label: "Inquiry context captured",
        status: "complete",
        note: "City, timing, experience, and first preferences are saved.",
      },
      {
        label: "Tirak check",
        status: "active",
        note: "Tirak is checking whether the plan feels practical and respectful.",
      },
      {
        label: "Payment",
        status: "blocked",
        note: "Not needed yet.",
      },
      {
        label: "Route details",
        status: "pending",
        note: "Exact details stay private until the plan is ready.",
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
        content: "Make it polished and private. No rushed handoff.",
        createdAt: "2026-05-19T07:41:00.000Z",
      },
      {
        id: "msg-muse-session-2",
        role: "muse",
        content: "Then I will keep it calm: fight night, dinner context, transport named, no pressure.",
        createdAt: "2026-05-19T07:42:00.000Z",
      },
    ],
    safetyNotes: [
      "Exact meeting and contact details stay hidden until Tirak clears the plan.",
      "Transport boundaries stay attached to the plan.",
      "Report off-platform payment requests here.",
    ],
    paymentState: travellerInquiries[0].paymentState,
    privacyNote: "This plan stays private inside your traveller area.",
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
    nextStep: "Confirm the resort area and preferred dinner time.",
    museRead: {
      ...travellerMuseChart,
      tagline: "A quieter island plan with privacy doing most of the work.",
      summary: "Muse is shaping a softer Phuket evening around resort timing and privacy.",
      axes: [
        { label: "Energy", value: "quiet premium", tone: "rose" },
        { label: "Pace", value: "slow evening", tone: "lavender" },
        { label: "Privacy", value: "hotel-aware", tone: "green" },
        { label: "Route", value: "dinner", tone: "pearl" },
      ],
      nextPrompt: "Tell Muse whether the route stays near the resort or opens toward a beach-club dinner.",
    },
    itinerary: [
      { label: "Draft plan", status: "complete", note: "Private dining area and timing are saved." },
      { label: "Traveller confirmation", status: "active", note: "Confirm pickup area and timing." },
      { label: "Companion fit", status: "pending", note: "Mali receives the plan once the context is clear." },
      { label: "Payment", status: "blocked", note: "Not needed yet." },
    ],
    messageThread: [
      {
        id: "msg-muse-session-3",
        role: "muse",
        content: "Keep this one soft. Pick a resort corridor first, then the evening can breathe.",
        createdAt: "2026-05-19T08:10:00.000Z",
      },
    ],
    safetyNotes: [
      "Do not reveal hotel room or personal contact details in chat.",
      "Keep itinerary changes inside Tirak Plus.",
    ],
    paymentState: {
      status: "disabled_for_compliance",
      provider: "manual_review",
      note: "Payment is not available for this plan yet.",
    },
    privacyNote: "The Phuket plan is saved as a private plan.",
  },
];

export const travellerDashboard: TravellerDashboardResponse = {
  chart: {
    ...travellerMuseChart,
    tagline: "Muse is already reading your Thailand rhythm.",
    summary: "Your current plans, saved profiles, and Muse notes live here.",
    nextPrompt: "Ask Muse to compare Bangkok energy with a quieter island route.",
  },
  greeting: "Welcome back.",
  summary: "You have two active plans and a few saved profiles. Muse is keeping the next step simple.",
  metrics: [
    { label: "Active plans", value: "2", note: "One needs a clearer handoff point." },
    { label: "Saved profiles", value: "3", note: "People you may want to revisit." },
    { label: "Next step", value: "Today", note: "Confirm timing for Phuket." },
  ],
  activeInquiry: travellerInquiries[0],
  upcomingSession: travellerSessions[0],
  savedProfiles: companions.filter((profile) => profile.verificationState === "approved").slice(0, 3),
  sessionPreview: travellerSessions.map(({ museRead, itinerary, messageThread, safetyNotes, paymentState, privacyNote, ...summary }) => summary),
  guidance: [
    "Start with the plan you want, then choose who fits it.",
    "Keep your first message specific and calm.",
    "Open Safety when something feels unclear.",
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
  privateReviewNote: "Prefers reviewed evening plans, hotel-aware logistics, and no rushed presentation.",
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
      label: "Evening window",
      status: "tentative",
    note: "Private until the profile is cleared.",
    },
    {
      id: "av-draft-maya-2",
      city: "bangkok",
      label: "Private dining",
      status: "hidden",
      note: "Hidden until the profile is approved.",
    },
  ],
  reviewStatus: "draft",
  reviewNote: "Finish the remaining detail, then send it for review.",
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
    { value: "local-guidance", label: "Local guidance", description: "Locally fluent planning and calm orientation." },
  ],
};

export const companionReviewStates = [
  {
    status: "draft",
    label: "Draft",
    description: "Profile details are private and editable before submission.",
    action: "Finish basics, availability, and safety acknowledgements.",
  },
  {
    status: "pending_verification",
    label: "Pending verification",
    description: "Your profile stays hidden while Tirak checks the details.",
    action: "Wait for Tirak or respond if the team asks for more detail.",
  },
  {
    status: "changes_requested",
    label: "Changes requested",
    description: "A few public or private fields need revision.",
    action: "Edit only the requested sections and resubmit.",
  },
  {
    status: "approved",
    label: "Approved",
    description: "Your profile can appear when your visibility settings allow it.",
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
    preferredWindow: "Evening window",
    receivedAt: "2026-05-13T11:00:00.000Z",
    nextStep: "Tirak checks safety and fit before sharing direct details.",
    privacyNote: "Traveller identity and contact details stay private until Tirak clears the plan.",
  },
  {
    id: "cinq-staged-002",
    travellerLabel: "Planning inquiry",
    city: "phuket",
    experience: "island-explorer",
    status: "payment_held",
    preferredWindow: "Resort-area evening",
    receivedAt: "2026-05-12T15:20:00.000Z",
    nextStep: "Tirak is checking whether this plan can move forward.",
    privacyNote: "No off-platform payment or pressure cue is shown to the companion.",
  },
];

export const companionSessionDetails: CompanionSessionDetail[] = [
  {
    ...companionInquiries[0],
    travellerContext:
      "Traveller is asking for a composed Bangkok private-dining evening with hotel-aware transport and no rushed handoff.",
    museFit: {
      ...companionMuseChart,
      tagline: "A composed request that needs one more boundary check.",
      summary: "Muse reads the request as practical and hospitality-led, with the introduction paused until Tirak clears the plan.",
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
        label: "Ask Tirak to clarify",
        value: "request_review",
        description: "Keep the request active while asking Tirak for clearer plan details or boundaries.",
      },
      {
        label: "Accept after review",
        value: "accept_after_review",
        description: "Mark willingness to proceed only if Tirak clears the plan.",
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
      { label: "Payment", status: "blocked", note: "Payment is not available for this request yet." },
      { label: "Introduction", status: "pending", note: "Tirak clears the plan before any introduction." },
    ],
    messageThread: [
      {
        id: "msg-companion-1",
        role: "muse",
        content: "This reads respectful. Keep your answer warm, but let Tirak carry the specifics.",
        createdAt: "2026-05-19T08:25:00.000Z",
      },
    ],
    paymentState: {
      status: "disabled_for_compliance",
      provider: "manual_review",
      note: "The companion cannot request payment or move money outside Tirak Plus.",
    },
  },
  {
    ...companionInquiries[1],
    travellerContext:
      "Traveller is exploring a Phuket island route. The area is broad, so the plan is paused until timing and transport are more precise.",
    museFit: companionMuseChart,
    decisionOptions: [
      {
        label: "Request clearer route",
        value: "request_review",
        description: "Ask Tirak to narrow city area, timing, and transport before you decide.",
      },
      {
        label: "Decline safely",
        value: "decline_safely",
        description: "Close the request while keeping your private details hidden.",
      },
    ],
    checklist: [
      { label: "Route clarity", status: "active", note: "The request needs a clearer resort corridor." },
      { label: "Privacy control", status: "complete", note: "Your profile stays private until you open it." },
      { label: "Payment", status: "blocked", note: "No payment request can be sent." },
    ],
    messageThread: [
      {
        id: "msg-companion-2",
        role: "muse",
        content: "Keep this paused until the island plan stops feeling too wide.",
        createdAt: "2026-05-19T08:32:00.000Z",
      },
    ],
    paymentState: {
      status: "disabled_for_compliance",
      provider: "manual_review",
      note: "Payment is not available for this request yet.",
    },
  },
];

export const entryPaths: HomeEntryPath[] = [
  {
    role: "traveller",
    label: "Traveller path",
    heading: "Plan a discreet Thailand introduction.",
    description: "Start with city, style, and timing, then send a private inquiry after you review safety guidance.",
    href: "/auth/login?role=traveller",
  },
  {
    role: "companion",
    label: "Companion path",
    heading: "Create your private profile.",
    description: "Set boundaries, availability, and profile tone before you submit.",
    href: "/auth/login?role=companion",
  },
];

export const safetyContent: SafetyContent = {
  title: "Safety and discretion",
  principles: [
    "Keep first messages respectful, practical, and tied to a real plan.",
    "Do not move payment, contact details, or pressure outside the app.",
    "Use reports when a request feels rushed, unclear, or unsafe.",
    "Pause the plan when boundaries, timing, or expectations are not clear.",
  ],
};
