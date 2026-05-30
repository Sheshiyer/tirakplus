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

// Vercel AI Gateway endpoint — used as fallback when NIM is unavailable.
// Uses the OpenAI-compatible /v1/chat/completions surface exposed by the gateway.
const GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1";
const GATEWAY_FALLBACK_MODEL = "google/gemini-2.0-flash";

export async function createChatCompletion(
  env: Env,
  model: string,
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number },
): Promise<string | null> {
  // 1. Try NIM first (primary path).
  if (env.NVIDIA_API_KEY) {
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

    if (response.ok) {
      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content?.trim() ?? null;
      if (content) return content;
    }
    // Non-OK or empty response → fall through to Gateway.
    console.warn("[nvidia] NIM non-OK or empty — falling back to AI Gateway");
  }

  // 2. Vercel AI Gateway fallback (google/gemini-2.0-flash, free tier).
  if (env.VERCEL_OIDC_TOKEN) {
    try {
      const response = await fetch(`${GATEWAY_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.VERCEL_OIDC_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GATEWAY_FALLBACK_MODEL,
          messages,
          temperature: options?.temperature ?? 0.35,
          max_tokens: options?.maxTokens ?? 320,
        }),
      });

      if (response.ok) {
        const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
        const content = data.choices?.[0]?.message?.content?.trim() ?? null;
        if (content) {
          console.log("[gateway] Fallback response from", GATEWAY_FALLBACK_MODEL);
          return content;
        }
      } else {
        console.warn("[gateway] Non-OK response:", response.status);
      }
    } catch (err) {
      console.warn("[gateway] Fetch failed:", err instanceof Error ? err.message : err);
    }
  }

  return null;
}

function nvidiaHeaders(env: Env): HeadersInit {
  return {
    authorization: `Bearer ${env.NVIDIA_API_KEY}`,
    "content-type": "application/json",
  };
}
