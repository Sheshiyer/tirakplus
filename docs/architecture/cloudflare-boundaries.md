# Cloudflare Monolith Boundaries

The customer app remains a Cloudflare monolith: static assets plus Worker API routes.

## Worker

- Owns request routing, request ID propagation, response envelopes, session-cookie interpretation, role checks, and compliance gates.
- Must not expose public companion data unless review and visibility state allow it.
- Must keep payment creation behind provider approval.

## D1

Planned source of truth for user, profile, availability, inquiry, payment, webhook, safety, and audit state.

Rules:

- User, inquiry, review, payment, and safety state belongs in D1, not KV.
- Public profile fields must store review and visibility state.
- Payment records must store compliance state and idempotency keys before live provider calls are enabled.

## R2

Planned object store for approved media and private review file references.

Rules:

- D1 stores media metadata, ownership, review state, and visibility.
- R2 stores objects only.
- Generated lifestyle portraits are not production public media without review approval.

## KV

Allowed only for non-sensitive configuration and lookup data:

- City and experience labels.
- Feature flags.
- Payment provider mode.
- Safety content version.

KV must not store sessions, identity documents, inquiry messages, or payment records.
