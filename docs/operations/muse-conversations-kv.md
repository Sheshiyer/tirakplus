# MUSE_CONVERSATIONS KV — Production Setup

The `MUSE_CONVERSATIONS` KV namespace stores adopted Muse transcripts under
`user:{userId}:conv:{conversationId}`.

**Status (2026-05-26):** namespace created in production
(account `2c0c96c68f0ee73b6d980054557bca5b`, ID `442973720cba46129bc0118f96b0f4eb`).
`wrangler.jsonc` is already updated. No further action needed unless rotating.

## One-time production setup

```bash
# 1. Authenticate against the right Cloudflare account
wrangler whoami

# 2. Create the namespace
wrangler kv namespace create MUSE_CONVERSATIONS

# Output looks like:
#   ✨ Success! Created namespace MUSE_CONVERSATIONS with ID: abcdef0123456789...
#
# Add the following to your configuration file in kv_namespaces:
# { binding = "MUSE_CONVERSATIONS", id = "abcdef0123456789..." }
```

## After creation

Edit `wrangler.jsonc` and replace the placeholder ID:

```jsonc
"kv_namespaces": [
  { "binding": "MUSE_AGENT_CONFIG", "id": "5c914cc2d3094278bfe2b6516739a9c7" },
  {
    "binding": "MUSE_CONVERSATIONS",
    "id": "REPLACE_WITH_REAL_ID_FROM_WRANGLER_OUTPUT"
  }
]
```

Then deploy:

```bash
npm run deploy
```

## Verifying the binding is live

After deploy, hit any authed surface and check the worker log for:

```
env.MUSE_CONVERSATIONS (real-id-hex)  KV Namespace  remote
```

## Data model

| Key shape | Value shape | TTL |
|---|---|---|
| `user:{userId}:conv:{conversationId}` | `MuseTranscriptSnapshot & { adoptedAt, ownerUserId }` | 90 days |

## Endpoints touched by this binding

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/muse/conversations/adopt` | Session + CSRF | Writes record on auth-flip from local transcript |
| GET | `/api/muse/conversations` | Session | Lists this user's adopted threads (newest first, limit 50) |
| GET | `/api/muse/conversations/:id` | Session | Returns the full transcript |

## Operational notes

- 90-day TTL is set per-key on write. To extend, re-PUT with a new TTL.
- KV `list({ prefix })` is eventually consistent; new adoptions may take seconds to appear in the dashboard list.
- The placeholder ID `a1b2c3d4e5f60718293a4b5c6d7e8f00` in wrangler.jsonc is a sentinel — wrangler dev --local works against any ID, but `wrangler deploy` will fail against a non-existent ID.
