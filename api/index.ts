import worker from "../src/worker/index.js";

declare const process: {
  env: Record<string, string | undefined>;
};

declare const Buffer: {
  from(value: ArrayBuffer | Buffer | string): Buffer;
  concat(chunks: Buffer[]): Buffer;
};

type Buffer = Uint8Array;

// On Cloudflare, MUSE_RAG is a service binding (a Fetcher). Vercel has no
// service bindings, so we synthesize one from MUSE_RAG_URL: the worker calls
// env.MUSE_RAG.fetch(new Request("https://muse-rag.internal/v1/chat", ...)),
// and this shim rewrites that internal request onto the real RAG worker's
// origin, preserving method/headers/body. Without MUSE_RAG_URL the binding is
// undefined and the worker falls back to staged replies (same as before).
const museRagUrl = process.env.MUSE_RAG_URL;
const MUSE_RAG = museRagUrl
  ? {
      fetch: async (input: Request | string): Promise<Response> => {
        const incoming = input instanceof Request ? input : new Request(input);
        const internal = new URL(incoming.url);
        const target = `${new URL(museRagUrl).origin}${internal.pathname}${internal.search}`;
        const method = incoming.method;
        return fetch(target, {
          method,
          headers: incoming.headers,
          body: method === "GET" || method === "HEAD" ? undefined : await incoming.text(),
        });
      },
    }
  : undefined;

// Cloudflare KV REST API shim — bridges the Vercel Node.js runtime to the
// same KV namespaces that the Workers runtime accesses natively via bindings.
// Requires CF_KV_API_TOKEN to be set; when absent the binding resolves to
// undefined and every store gracefully no-ops (same as a missing Workers
// binding). CF_ACCOUNT_ID defaults to the tirak.court@gmail.com account.
//
// Env vars to set in Vercel:
//   CF_ACCOUNT_ID            — Cloudflare account ID (default: 2c0c96c68f0ee73b6d980054557bca5b)
//   CF_KV_API_TOKEN          — CF API token with KV write access
//   AUTH_OTPS_NAMESPACE_ID   — already created; ID: 2c16677830fb424aadd690f3e87106c6
//   MUSE_AGENT_CONFIG_NAMESPACE_ID — already created; ID: 5c914cc2d3094278bfe2b6516739a9c7
//   MUSE_CONVERSATIONS_NAMESPACE_ID — already created; ID: 442973720cba46129bc0118f96b0f4eb
//   BOOKING_DATA_NAMESPACE_ID  — run: wrangler kv:namespace create BOOKING_DATA
//   ACCOUNT_DATA_NAMESPACE_ID  — run: wrangler kv:namespace create ACCOUNT_DATA
function makeKvHttpShim(accountId: string, namespaceId: string, apiToken: string) {
  const base = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`;
  const authHeader = { Authorization: `Bearer ${apiToken}` };

  async function kvGet(key: string, options?: string | object): Promise<any> {
    const type = typeof options === "string" ? options : (options as any)?.type;
    const res = await fetch(`${base}/values/${encodeURIComponent(key)}`, { headers: authHeader });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    if (type === "json") {
      try { return await res.json(); } catch { return null; }
    }
    if (type === "arrayBuffer") return res.arrayBuffer();
    if (type === "stream") return res.body;
    return res.text();
  }

  return {
    get: kvGet,
    async put(key: string, value: string | ArrayBuffer | ReadableStream, options?: { expiration?: number; expirationTtl?: number }): Promise<void> {
      const url = new URL(`${base}/values/${encodeURIComponent(key)}`);
      if (options?.expiration) url.searchParams.set("expiration", String(options.expiration));
      if (options?.expirationTtl) url.searchParams.set("expiration_ttl", String(options.expirationTtl));
      await fetch(url.toString(), { method: "PUT", headers: authHeader, body: value as string });
    },
    async delete(key: string): Promise<void> {
      await fetch(`${base}/values/${encodeURIComponent(key)}`, { method: "DELETE", headers: authHeader });
    },
    async list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<any> {
      const url = new URL(`${base}/keys`);
      if (options?.prefix) url.searchParams.set("prefix", options.prefix);
      if (options?.limit) url.searchParams.set("limit", String(options.limit));
      if (options?.cursor) url.searchParams.set("cursor", options.cursor);
      const res = await fetch(url.toString(), { headers: authHeader });
      if (!res.ok) return { keys: [], list_complete: true };
      const data: any = await res.json();
      return data.result ?? { keys: [], list_complete: true };
    },
    async getWithMetadata(key: string, type?: string): Promise<any> {
      return { value: await kvGet(key, type), metadata: null };
    },
  };
}

const cfAccountId = process.env.CF_ACCOUNT_ID ?? "2c0c96c68f0ee73b6d980054557bca5b";
const cfKvToken = process.env.CF_KV_API_TOKEN;

function makeKv(namespaceId: string | undefined) {
  if (!cfKvToken || !namespaceId) return undefined;
  return makeKvHttpShim(cfAccountId, namespaceId, cfKvToken);
}

// Three already-provisioned namespaces — IDs are stable; override via env if needed.
// Use || (not ??) so an empty-string env var falls back to the hardcoded default
// rather than passing "" to makeKv and getting undefined back.
const AUTH_OTPS = makeKv(process.env.AUTH_OTPS_NAMESPACE_ID || "2c16677830fb424aadd690f3e87106c6");
const MUSE_AGENT_CONFIG = makeKv(process.env.MUSE_AGENT_CONFIG_NAMESPACE_ID || "5c914cc2d3094278bfe2b6516739a9c7");
const MUSE_CONVERSATIONS = makeKv(process.env.MUSE_CONVERSATIONS_NAMESPACE_ID || "442973720cba46129bc0118f96b0f4eb");
// Two provisioned namespaces — IDs set via Vercel env vars (BOOKING_DATA_NAMESPACE_ID,
// ACCOUNT_DATA_NAMESPACE_ID). When absent the binding resolves to undefined and the
// store gracefully no-ops (fixture fallback serves demo content).
const ACCOUNT_DATA = makeKv(process.env.ACCOUNT_DATA_NAMESPACE_ID);
const BOOKING_DATA = makeKv(process.env.BOOKING_DATA_NAMESPACE_ID);

const env = {
  ENVIRONMENT: process.env.ENVIRONMENT ?? "staging",
  PAYMENT_PROVIDER_MODE: process.env.PAYMENT_PROVIDER_MODE ?? "compliance_hold",
  MUSE_AGENT_MODE: process.env.MUSE_AGENT_MODE ?? "staged",
  MUSE_AGENT_CONFIG_KEY: process.env.MUSE_AGENT_CONFIG_KEY ?? "muse:agent-config",
  MUSE_AGENT_API_KEY: process.env.MUSE_AGENT_API_KEY,
  SELEMENE_ENGINE_API_KEY: process.env.SELEMENE_ENGINE_API_KEY,
  MUSE_RAG,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM: process.env.RESEND_FROM,
  STRIPE_CHECKOUT_CURRENCY: process.env.STRIPE_CHECKOUT_CURRENCY,
  STRIPE_CHECKOUT_UNIT_AMOUNT: process.env.STRIPE_CHECKOUT_UNIT_AMOUNT,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  AUTH_OTPS,
  MUSE_AGENT_CONFIG,
  MUSE_CONVERSATIONS,
  ACCOUNT_DATA,
  BOOKING_DATA,
};

export default async function handler(req: any, res: any) {
  const request = await toFetchRequest(req);
  const workerResponse = await (worker.fetch as any)(request, env);
  res.statusCode = workerResponse.status;
  res.statusMessage = workerResponse.statusText;

  workerResponse.headers.forEach((value: string, key: string) => {
    res.setHeader(key, value);
  });

  const body = Buffer.from(await workerResponse.arrayBuffer());
  res.end(body);
}

async function toFetchRequest(req: any): Promise<Request> {
  const protocol = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `${protocol}://${host}`);
  const routedPath = url.searchParams.get("path");
  if (url.pathname === "/api" && routedPath) {
    url.pathname = `/api/${routedPath.replace(/^\/+/, "")}`;
    url.searchParams.delete("path");
  }

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    headers.set(key, Array.isArray(value) ? value.join(", ") : String(value));
  }

  const method = req.method ?? "GET";
  const body = method === "GET" || method === "HEAD" ? undefined : await readBody(req);
  return new Request(url, { method, headers, body });
}

function readBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer | string) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
