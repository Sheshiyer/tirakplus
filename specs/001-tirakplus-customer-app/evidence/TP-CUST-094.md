# TP-CUST-094 Evidence: Onboarding Progress State

- Added ordered onboarding step model with complete, active, and pending states.
- `/companion/onboarding` renders a sticky progress panel and step list.
- Worker computes progress from staged API-shaped profile state.
- Verification required: inspect `/api/companion/onboarding` progress and responsive browser smoke.
- Anti-pattern check: progress explains review readiness rather than gamifying exposure or demand.
