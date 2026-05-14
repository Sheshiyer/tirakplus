# TP-CUST-123 Evidence: R2 Media Reference Contract

- Added R2 boundary in `src/worker/storage-boundaries.ts`.
- R2 owns object storage for approved media and private review file references; D1 owns metadata and visibility.
- Docs block unreviewed generated portraits from public production surfaces.
- Anti-pattern check: media publication remains review-gated and never direct from generated assets.
