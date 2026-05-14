# TP-CUST-116 Evidence: API Route Registry

- Added typed route registry in `src/worker/route-registry.ts`.
- Exposed `GET /api/system/routes` with method, path, audience, handler, contract names, auth posture, staged provider, and production target.
- Contract smoke verifies the route registry and confirms account coverage.
- Anti-pattern check: registry preserves safety, role, and compliance boundaries instead of ad hoc endpoint growth.
