# TP-CUST-126 Evidence: Traveller Endpoint Handlers

- Traveller endpoints now use provider methods and staged role-gated API checks.
- Discovery, profile, inquiry list/detail, and inquiry validation remain API-shaped.
- Contract smoke verifies unauthorized traveller access, valid traveller discovery/profile, restricted profile, and inquiry validation.
- Anti-pattern check: traveller routes still block ratings, fake urgency, and direct payment bypass.
