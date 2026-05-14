# TP-CUST-122 Evidence: D1 Persistence Decision Record

- Added D1 ownership in `src/worker/storage-boundaries.ts` and `docs/architecture/cloudflare-boundaries.md`.
- D1 is planned for users, profiles, availability, inquiries, payment records, webhooks, safety reports, and audit events.
- `GET /api/system/storage-boundaries` exposes the D1 boundary contract.
- Anti-pattern check: sensitive state is not assigned to KV or UI-local storage.
