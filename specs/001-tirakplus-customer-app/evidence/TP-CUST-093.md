# TP-CUST-093 Evidence: Verification Submit Step

- Implemented `POST /api/companion/submit-verification` with three acknowledgement gates.
- Submit response moves profile to `pending_verification` and pauses public profile and inquiries.
- Onboarding UI shows field-level acknowledgement errors and success next-step copy.
- Verification required: valid and invalid submit API probes plus browser submit smoke.
- Anti-pattern check: no public visibility, routing, or payment is unlocked by submission alone.
