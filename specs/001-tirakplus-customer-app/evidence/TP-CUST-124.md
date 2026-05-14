# TP-CUST-124 Evidence: KV Config Boundary

- Added KV boundary in `src/worker/storage-boundaries.ts`.
- KV is limited to non-sensitive lookup/config data such as city labels, feature flags, provider mode, and safety content version.
- Docs explicitly prohibit sessions, identity files, inquiry messages, and payment records in KV.
- Anti-pattern check: privacy-sensitive companion/traveller state stays out of cache/config storage.
