# Production Security And Data Boundaries

## Session Target

The current staged cookie is acceptable only for development. Production should use an opaque signed session ID with server-side state in D1 or another approved store. Cookies should remain `HttpOnly`, `Secure`, `SameSite=Lax` or stricter, and scoped to the production domain.

## Request Protection

State-changing routes need CSRF protection, payload validation, and body size limits. Auth, Muse chat, inquiries, safety reports, and account updates also need rate limits.

## Storage

D1 should hold users, sessions, profiles, inquiries, reports, and audit logs. R2 should hold reviewed media and verification uploads. KV should hold low-risk configuration, feature flags, and Muse RAG routing configuration.

## Audit Trail

Review decisions, visibility changes, payment-gate decisions, role transitions, and safety reports should produce admin-visible audit events.

## Data Rights

Launch requires account export, correction, deletion, retention, and safety-log preservation rules before collecting real traveller or companion data.
