# TP-CUST-088 Evidence: Profile Basics Step

- Added display-name and legal-name fields to companion onboarding and profile manager.
- Legal name is described as private review material and is never rendered in safe public preview.
- Worker validates names through `PATCH /api/companion/profile`.
- Verification required: submit invalid short basics and confirm `COMPANION_PROFILE_VALIDATION_FAILED` field errors.
- Anti-pattern check: separates identity review from public persona and avoids public exposure of sensitive fields.
