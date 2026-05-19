import type { Env } from "./config";

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function createEmbeddings(
  env: Env,
  texts: string[],
  model: string,
  inputType: "passage" | "query",
): Promise<number[][] | null> {
  if (!env.NVIDIA_API_KEY) return null;

  const response = await fetch(`${NVIDIA_BASE_URL}/embeddings`, {
    method: "POST",
    headers: nvidiaHeaders(env),
    body: JSON.stringify({
      model,
      input: texts,
      input_type: inputType,
      encoding_format: "float",
      truncate: "END",
    }),
  });

  if (!response.ok) return null;

  const data = await response.json() as { data?: Array<{ embedding?: number[] }> };
  const embeddings = data.data?.map((item) => item.embedding).filter((item): item is number[] => Boolean(item)) ?? [];
  return embeddings.length === texts.length ? embeddings : null;
}

export async function createChatCompletion(
  env: Env,
  model: string,
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number },
): Promise<string | null> {
  if (!env.NVIDIA_API_KEY) return null;

  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: nvidiaHeaders(env),
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.35,
      max_tokens: options?.maxTokens ?? 320,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

function nvidiaHeaders(env: Env): HeadersInit {
  return {
    authorization: `Bearer ${env.NVIDIA_API_KEY}`,
    "content-type": "application/json",
  };
}
