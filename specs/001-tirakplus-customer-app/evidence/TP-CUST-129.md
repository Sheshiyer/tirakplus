# TP-CUST-129 Evidence: Account Endpoint Handlers

- Added `GET /api/account` and `PATCH /api/account/privacy`.
- Account state includes profile, privacy settings, and safety/payment compliance gate note.
- Contract smoke verifies account detail and privacy update with a staged session cookie.
- Anti-pattern check: account endpoints do not expose private review fields or public profile data.
