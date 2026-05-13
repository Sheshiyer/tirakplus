# TP-CUST-102 Evidence: Visibility Control Panel

- Visibility controls appear in both onboarding and profile manager.
- `PATCH /api/companion/visibility` sanitizes booleans and returns an updated profile/onboarding contract.
- UI copy makes review approval a separate gate from local preference.
- Verification required: save visibility smoke and API response inspection.
- Anti-pattern check: no forced public listing, fake online state, or browse-pressure surface.
