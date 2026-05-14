# TP-CUST-117 Evidence: Staged Data Provider Contract

- Added `src/worker/staged-provider.ts` as the API-shaped staged data boundary.
- Worker handlers now use provider methods instead of importing staged arrays directly.
- Provider covers public, traveller, companion, safety, and account contracts.
- Anti-pattern check: staged data remains behind production-shaped rails and is not hardcoded in UI components.
