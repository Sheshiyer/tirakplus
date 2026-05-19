export type MuseConversationStage =
  | "arrival"
  | "birth_context"
  | "travel_context"
  | "desire_mapping"
  | "safety_boundaries"
  | "recommendation_ready";

export type MuseRoleIntent = "traveller" | "companion" | "unknown";

export type MuseProfileSignals = {
  birthContext: {
    date?: string;
    time?: string;
    place?: string;
    confidence: "none" | "partial" | "complete";
  };
  travelContext: {
    city?: "bangkok" | "phuket" | "koh-samui" | "koh-phangan";
    timeframe?: string;
    experienceHints: string[];
  };
  desireVector: string[];
  boundarySignals: string[];
  routingHints: {
    nextRoute?: string;
    requiresAuth: boolean;
    suggestedRole?: "traveller" | "companion";
  };
};

export type MuseChatRequest = {
  conversationId?: string;
  message?: string;
  query?: string;
  stage?: MuseConversationStage;
  roleIntent?: MuseRoleIntent;
  appId?: string;
  responseMode?: "fast" | "best";
  input?: {
    conversationId?: string;
    message?: string;
    stage?: MuseConversationStage;
    roleIntent?: MuseRoleIntent;
  };
};

export type MuseChatResponse = {
  conversationId: string;
  stage: MuseConversationStage;
  roleIntent: MuseRoleIntent;
  contractVersion?: "muse-response-v2";
  policyVersion?: string;
  reply: {
    id: string;
    role: "muse";
    content: string;
    createdAt: string;
  };
  suggestedPrompts: string[];
  profileSignals: MuseProfileSignals;
  nextAction?: {
    label: string;
    href: string;
    kind: "route" | "auth" | "continue";
  };
  agentMode: "external";
  retrievedContext: SearchResult[];
  quality?: {
    leakagePass: boolean;
    safetyPass: boolean;
    voicePass: boolean;
    retrievalPass?: boolean;
    injectionPass?: boolean;
    safetyCategory?: string;
    notes: string[];
  };
  observability?: {
    traceId: string;
    policyVersion: string;
    stage: MuseConversationStage;
    roleIntent: MuseRoleIntent;
    retrievedCount: number;
    blockedBySafety: boolean;
    createdAt: string;
  };
};

export type MusePainPoint = {
  category:
    | "missing_context"
    | "tone_drift"
    | "leakage_risk"
    | "safety_boundary"
    | "route_confusion"
    | "companion_profile_friction"
    | "traveller_intent_friction";
  severity: "low" | "medium" | "high";
  signal: string;
  suggestedAction: "prompt_candidate" | "corpus_candidate" | "eval_candidate" | "product_review";
};

export type MuseEvalResult = {
  id: string;
  role: "traveller" | "companion" | "unknown";
  stage: MuseConversationStage;
  leakagePass: boolean;
  safetyPass: boolean;
  voicePass: boolean;
  helpfulnessPass: boolean;
  failures: string[];
};

export type CorpusFile = {
  generatedAt: string;
  docs: Array<{
    slug: string;
    title: string;
    category: string;
    sourcePath: string;
    audience?: MuseRoleIntent[];
    tags?: string[];
    sensitivity?: "public" | "guardrail" | "private-method";
    content: string;
  }>;
};

export type ChunkRecord = {
  id: string;
  slug: string;
  title: string;
  category: string;
  sourcePath: string;
  audience?: MuseRoleIntent[];
  tags?: string[];
  sensitivity?: "public" | "guardrail" | "private-method";
  chunkIndex: number;
  text: string;
  embedding?: number[];
};

export type SearchResult = {
  id: string;
  score: number;
  text: string;
  metadata: {
    slug: string;
    title: string;
    category: string;
    sourcePath: string;
    audience?: MuseRoleIntent[];
    tags?: string[];
    sensitivity?: "public" | "guardrail" | "private-method";
    chunkIndex: number;
  };
};
