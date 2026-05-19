export type MuseConversationStage =
  | "arrival"
  | "birth_context"
  | "travel_context"
  | "desire_mapping"
  | "safety_boundaries"
  | "recommendation_ready";

export type MuseChatRequest = {
  conversationId?: string;
  message?: string;
  query?: string;
  stage?: MuseConversationStage;
  appId?: string;
  responseMode?: "fast" | "best";
  input?: {
    conversationId?: string;
    message?: string;
    stage?: MuseConversationStage;
  };
};

export type MuseChatResponse = {
  conversationId: string;
  stage: MuseConversationStage;
  reply: {
    id: string;
    role: "muse";
    content: string;
    createdAt: string;
  };
  suggestedPrompts: string[];
  profileSignals: {
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
  nextAction?: {
    label: string;
    href: string;
    kind: "route" | "auth" | "continue";
  };
  agentMode: "external";
  retrievedContext: SearchResult[];
};

export type CorpusFile = {
  generatedAt: string;
  docs: Array<{
    slug: string;
    title: string;
    category: string;
    sourcePath: string;
    content: string;
  }>;
};

export type ChunkRecord = {
  id: string;
  slug: string;
  title: string;
  category: string;
  sourcePath: string;
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
    chunkIndex: number;
  };
};
