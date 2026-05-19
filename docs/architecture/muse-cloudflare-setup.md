# Muse Cloudflare Setup

Status: Wave 1 isolated Muse RAG deployment is live.

## Worker

- Worker name: `tirakplus`
- URL: `https://tirakplus.tirak-court.workers.dev`
- Muse route: `POST /api/muse/chat`
- Current mode: `MUSE_AGENT_MODE=external`
- Internal service binding: `MUSE_RAG -> tirakplus-muse-rag`

## Muse RAG Worker

- Worker name: `tirakplus-muse-rag`
- URL: `https://tirakplus-muse-rag.tirak-court.workers.dev`
- Internal route used by customer Worker: `/v1/chat`
- App id: `tirakplus-muse`
- Config KV namespace: `TIRAKPLUS_MUSE_RAG_CONFIG`
- Index KV namespace: `TIRAKPLUS_MUSE_RAG_INDEX`
- Auth key: `auth:tirakplus-muse`
- Corpus key: `index:tirakplus-muse`
- Corpus scope: Tirak Plus Muse/product/safety/companion/traveller context only.

This does not use the Tirak Wiki Worker, Tirak Wiki KV namespaces, Tirak Wiki auth token, or Tirak Wiki corpus.

## KV

- Binding: `MUSE_AGENT_CONFIG`
- Namespace ID: `5c914cc2d3094278bfe2b6516739a9c7`
- Config key: `muse:agent-config`
- Purpose: non-secret Muse persona, guardrails, collection order, and prompt policy.

KV must not store API keys or provider credentials. Use Wrangler secrets for credentials.

## Secrets

Muse production secrets are attached to the Worker.

Attached secrets:

- `MUSE_AGENT_API_KEY`
- `SELEMENE_ENGINE_API_KEY`

`MUSE_AGENT_ENDPOINT` is intentionally not used. The customer Worker calls the isolated Muse RAG Worker through the `MUSE_RAG` Cloudflare service binding. The bearer token remains in `MUSE_AGENT_API_KEY`.

## Verified

- `npm run deploy` passed for staged mode.
- Remote `/api/muse/chat` returned `200` in staged mode.
- Remote KV read confirmed config version `2026-05-18-wave1`.
- `MUSE_AGENT_MODE=external` deployment passed after attaching secrets.
- `tirakplus-muse-rag` deployed successfully.
- Tirak Plus Muse corpus ingested successfully with 6 source chunks.
- Remote `/api/muse/chat` returned `200` with `agentMode: external`.
- Response included retrieved Tirak Plus context titles: Muse First Flow, Premium Discretion, Private Inference Language, Routing Boundaries, Traveller Discovery, Companion Assist.

## Nvidia Generation

`tirakplus-muse-rag` has its own `NVIDIA_API_KEY` Worker secret. The customer Worker does not need this secret because it calls Muse RAG through the `MUSE_RAG` service binding.

Verification:

- Direct secret listing for `tirakplus-muse-rag` shows `NVIDIA_API_KEY`.
- Customer Worker secret listing does not show `NVIDIA_API_KEY`.
- Remote `/api/muse/chat` returned `agentMode: external` with generated Muse copy and Tirak Plus retrieved context.
