# TP-CUST-091 Evidence: Visibility Settings Step

- Added visibility settings for public profile, city, availability, and reviewed inquiries.
- Implemented `PATCH /api/companion/visibility` and companion UI save flow.
- Safe preview reflects hidden states instead of implying public exposure.
- Verification required: visibility API probe and browser save smoke on onboarding/profile.
- Anti-pattern check: companion controls exposure; there is no forced discoverability or online-now mechanic.
