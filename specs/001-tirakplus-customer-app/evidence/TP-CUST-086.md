# TP-CUST-086 Evidence: Companion Onboarding Contract

- Implemented shared companion onboarding contract types in `src/shared/contracts.ts`.
- Added `GET /api/companion/onboarding` with profile draft, ordered steps, API-delivered city/experience options, progress, guidance, and required actions.
- UI consumes the contract through `CompanionService.getOnboarding()`; no staged onboarding data is hardcoded in React components.
- Verification required: `npm run check`, API probe for `/api/companion/onboarding`, and responsive browser smoke on `/companion/onboarding`.
- Anti-pattern check: contract separates public profile fields, private review fields, visibility controls, and review status.
