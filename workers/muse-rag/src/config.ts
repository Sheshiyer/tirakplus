export type AppConfig = {
  appId: string;
  displayName: string;
  corpusId: string;
  chatModel: string;
  embeddingModel: string;
  searchTopK: number;
  promptId: string;
  authMode: "bearer" | "client-key";
  enabled: boolean;
};

export type Env = {
  APP_CONFIG: KVNamespace;
  APP_INDEX: KVNamespace;
  NVIDIA_API_KEY?: string;
  ENVIRONMENT?: string;
};

type AuthRecord = {
  token?: string;
  clientKey?: string;
};

type DefaultsRecord = {
  defaultChatModel?: string;
  defaultEmbeddingModel?: string;
  defaultSearchTopK?: number;
};

type AppConfigRecord = Partial<Omit<AppConfig, "appId">>;

export async function getDefaults(env: Env) {
  const raw = await env.APP_CONFIG.get<DefaultsRecord>("rag:defaults", "json");
  return {
    defaultChatModel: raw?.defaultChatModel ?? "meta/llama-3.1-8b-instruct",
    defaultEmbeddingModel: raw?.defaultEmbeddingModel ?? "nvidia/llama-nemotron-embed-1b-v2",
    defaultSearchTopK: raw?.defaultSearchTopK ?? 6,
  };
}

export async function getAppConfig(env: Env, appId: string): Promise<AppConfig | null> {
  const defaults = await getDefaults(env);
  const raw = await env.APP_CONFIG.get<AppConfigRecord>(`apps:${appId}`, "json");
  if (!raw) return null;

  return {
    appId,
    displayName: raw.displayName ?? appId,
    corpusId: raw.corpusId ?? appId,
    chatModel: raw.chatModel ?? defaults.defaultChatModel,
    embeddingModel: raw.embeddingModel ?? defaults.defaultEmbeddingModel,
    searchTopK: raw.searchTopK ?? defaults.defaultSearchTopK,
    promptId: raw.promptId ?? "muse-private-guide",
    authMode: raw.authMode ?? "bearer",
    enabled: raw.enabled ?? true,
  };
}

export async function isAuthorizedRequest(env: Env, request: Request, appId: string): Promise<boolean> {
  const config = await getAppConfig(env, appId);
  if (!config?.enabled) return false;

  const stored = await env.APP_CONFIG.get<AuthRecord>(`auth:${appId}`, "json");
  if (!stored) return false;

  if (config.authMode === "bearer") {
    return request.headers.get("authorization") === `Bearer ${stored.token}`;
  }

  return request.headers.get("x-client-key") === stored.clientKey;
}
