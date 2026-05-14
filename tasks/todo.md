# Tirak Plus Companion Phase

## Companion Registration, Profile Management, Availability

- [x] Review Phase 5 spec tasks T086-T115 and map them to a single coherent implementation slice.
- [x] Add API-shaped companion contracts for onboarding, draft profile, visibility, availability, review states, and companion inbox.
- [x] Add Worker endpoints for `/api/companion/onboarding`, `/api/companion/profile`, `/api/companion/visibility`, `/api/companion/availability`, `/api/companion/submit-verification`, and `/api/companion/inquiries`.
- [x] Add staged companion data behind Worker routes only; keep UI free of hardcoded staged profile or availability data.
- [x] Build companion onboarding, dashboard, profile editor, availability, inbox, account, and safety views with premium/discreet copy.
- [x] Verify mobile, tablet, and desktop layouts do not produce cheap dating-app, red-light, objectifying, fake-urgency, swipe-first, or person-rating patterns.
- [x] Run TypeScript/build checks, API probes, and browser smoke checks.
- [x] Mark spec tasks T086-T115 complete and attach evidence files.
- [x] Commit and push the customer repo.

## Review

- `npm run check` passed after companion contracts, routes, UI, and evidence were added.
- API probes covered onboarding, dashboard, companion inquiries, profile validation, availability validation/save, and verification submit validation/success.
- Browser smoke covered companion dashboard, onboarding, profile, availability, inbox, and safety at `390x844`, `768x1024`, and `1280x800` with no horizontal overflow.
- Browser console recheck reported no console errors or page errors across companion routes.

# Tirak Plus API Boundary Phase

## Phase 6: API Contracts, Staged Data Rails, Data Model, Cloudflare Boundary

- [x] Review Phase 6 spec tasks T116-T130 and map them to route, provider, schema, storage, and contract-test work.
- [x] Add a typed API route registry that covers public, auth/session, traveller, companion, payment, safety, account, and system routes.
- [x] Add a staged data provider boundary so Worker handlers do not import staged arrays directly.
- [x] Add schema and Cloudflare storage boundary artifacts for D1, R2, and KV.
- [x] Harden response envelopes with request ID propagation and consistent error shape.
- [x] Add missing safety/account API rails and keep payment behind the compliance gate.
- [x] Add a contract smoke harness that verifies API envelopes, request IDs, validation errors, and representative endpoints.
- [x] Mark spec tasks T116-T130 complete and attach evidence files.
- [x] Run TypeScript/build checks, contract smoke, API probes, and git diff checks.
- [x] Commit and push the customer repo.

## Review

- `npm run check` passed after request ID propagation, route registry, staged provider, storage/schema contracts, and role-gated APIs were added.
- `npm run contract:smoke` passed 26 checks against `http://127.0.0.1:8787`.
- Contract smoke covered system, public, auth, traveller, companion, payment, safety, and account endpoints.
- The harness caught and forced correction of the Stripe compliance gate so `PAYMENT_PROVIDER_NOT_APPROVED` is now a proper API error envelope.
- Browser smoke confirmed traveller discovery/profile, wrong-role companion redirect, companion dashboard/onboarding, and no mobile horizontal overflow after API role-gating.
