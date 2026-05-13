# TP-CUST-095 Evidence: Onboarding Resume State

- Onboarding loads saved staged profile state from `GET /api/companion/onboarding`.
- Step list and form values resume from API state instead of component-local mock arrays.
- Save responses return updated onboarding state so the UI can continue without route reset.
- Verification required: save draft, observe status message, and confirm fields remain in local resumed state.
- Anti-pattern check: resume state is neutral and review-focused, with no fake urgency.
