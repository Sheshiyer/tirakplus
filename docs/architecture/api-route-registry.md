# API Route Registry

Phase 6 introduces a typed route registry in `src/worker/route-registry.ts`.

The registry is exposed at `GET /api/system/routes` and records:

- HTTP method and path pattern.
- Audience boundary: public, auth, traveller, companion, payment, safety, account, or system.
- Handler ownership name.
- Request and response contract names.
- Required auth posture.
- Staged provider source.
- Production target: Worker, D1, R2, KV, or payment provider.

This makes API coverage auditable before production persistence is enabled. UI components still call feature services, not staged arrays.

## Request ID Rule

Every API response returns:

- JSON `requestId`.
- `X-Request-Id` response header.
- Incoming `X-Request-Id` is propagated when it is safe; otherwise the Worker generates a UUID.

## Contract Test

Run the smoke harness against a local Worker:

```sh
npm run contract:smoke
```

The harness verifies representative public, traveller, companion, payment, safety, account, and system routes.
