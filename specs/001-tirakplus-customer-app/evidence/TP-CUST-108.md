# TP-CUST-108 Evidence: Verification Pending State

- Submit verification response returns `pending_verification` and pauses public profile plus inquiries.
- Dashboard review-state map includes pending verification behavior.
- Onboarding success message explains review before traveller-facing visibility.
- Verification required: `POST /api/companion/submit-verification` valid probe.
- Anti-pattern check: pending state blocks public exposure and payment/routing shortcuts.
