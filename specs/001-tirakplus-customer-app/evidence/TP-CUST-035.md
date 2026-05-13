# Evidence for TP-CUST-035: Session Smoke Tests

## Contract Proof
- `npm run check` passed after auth API conversion.
- HTTP probes passed for:
  - `POST /api/auth/start`
  - `POST /api/auth/verify`
  - `GET /api/session`
  - `POST /api/session/role`
  - `POST /api/auth/logout`
- Playwright smoke verified:
  - mobile `/auth/login` layout at `390x844`
  - email entry to `/auth/verify`
  - 6-digit verification to `/traveller/discovery`
  - account switch to `/companion/dashboard`

## Anti-Pattern Checklist Evidence
- [x] Auth flow uses no fake urgency timers.
- [x] Verification and role context are private account mechanics, not public browse mechanics.
- [x] The flow remains premium, restrained, and non-objectifying.
