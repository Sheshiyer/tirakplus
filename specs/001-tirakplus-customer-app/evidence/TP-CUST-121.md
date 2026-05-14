# TP-CUST-121 Evidence: Cloudflare Worker Boundary

- Added `docs/architecture/cloudflare-boundaries.md`.
- Worker now owns route dispatch, request IDs, role gates, envelope shape, staged-provider access, and compliance gates.
- System endpoints expose registry, storage boundaries, and data model schema without requiring UI coupling.
- Anti-pattern check: review and privacy behavior are enforced at API boundary, not only by visual copy.
