# Tirak Plus Muse RAG Worker

This Worker follows the proven Tirak Wiki RAG pattern, but it is isolated for Tirak Plus.

## Isolation Rules

- Worker name: `tirakplus-muse-rag`
- App id: `tirakplus-muse`
- Config KV: Tirak Plus Muse specific namespace only.
- Index KV: Tirak Plus Muse specific namespace only.
- Corpus: Tirak Plus product, safety, design, and Muse-agent context only.
- Auth: separate bearer token stored under `auth:tirakplus-muse`.

Do not reuse the Tirak Wiki Worker, KV namespaces, auth token, or corpus.

## Endpoints

- `GET /health`
- `GET /v1/models`
- `POST /v1/ingest`
- `POST /v1/search`
- `POST /v1/chat`

`POST /v1/chat` returns the Muse response contract expected by the customer app.

## Secrets

Optional but recommended:

```bash
npm exec wrangler secret put NVIDIA_API_KEY -- --config workers/muse-rag/wrangler.jsonc
```

If `NVIDIA_API_KEY` is not present, the Worker still answers from lexical retrieval and source-led fallback copy.
