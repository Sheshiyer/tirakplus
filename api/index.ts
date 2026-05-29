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
