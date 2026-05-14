# TP-CUST-130 Evidence: Contract Test Harness

- Added `scripts/contract-smoke.mjs` and `npm run contract:smoke`.
- Harness verifies route registry, system contracts, public routes, role gates, traveller routes, companion routes, safety/account routes, request IDs, and payment compliance errors.
- Latest run completed 26 checks against `http://127.0.0.1:8787`.
- Anti-pattern check: harness explicitly verifies compliance and role boundaries instead of relying on visual-only review.
