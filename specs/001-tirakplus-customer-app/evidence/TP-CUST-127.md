# TP-CUST-127 Evidence: Companion Endpoint Handlers

- Companion endpoints now use provider methods and staged role-gated API checks.
- Onboarding, dashboard, inquiries, profile update, visibility, availability, and verification submit remain contract-backed.
- Contract smoke verifies wrong-role blocking, companion onboarding/dashboard/inquiries, profile validation, and availability save.
- Anti-pattern check: companion agency, visibility, and review status are enforced at API level.
