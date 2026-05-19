# Production Security And Data Boundaries

## Session Target

The current staged cookie is acceptable only for development. Production should use an opaque signed session ID with server-side state in D1 or another approved store. Cookies should remain `HttpOnly`, `Secure`, `SameSite=Lax` or stricter, and scoped to the production domain.

## Request Protection

The staged Worker now issues a per-session CSRF token and requires `X-Tirak-CSRF` on cookie-authenticated state-changing routes. Auth start/verify and Muse chat remain available without the token. Production should move token/session state to a server-side store and add explicit body size limits.

Auth, Muse chat, inquiries, safety reports, and account/companion mutations also have staged in-memory rate limits. Production should move these limits to Durable Objects, KV with careful consistency expectations, or another approved shared limiter.

Payload validation exists at the route boundary for current staged contracts. Production should keep those validations close to the Worker/API boundary and add schema-driven validation before persistence.

## Storage

D1 should hold users, sessions, profiles, inquiries, reports, and audit logs. R2 should hold reviewed media and verification uploads. KV should hold low-risk configuration, feature flags, and Muse RAG routing configuration.

## Audit Trail

Review decisions, visibility changes, payment-gate decisions, role transitions, and safety reports should produce admin-visible audit events.

## Data Rights

Launch requires account export, correction, deletion, retention, and safety-log preservation rules before collecting real traveller or companion data.
