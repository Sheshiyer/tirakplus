
# API Contract: Tirak Plus Customer App

All endpoints return staged data first and production data later without changing the UI contract.

## Public

- GET /api/public/home -> brand, city summaries, trust highlights, entry paths, hero asset references.
- GET /api/public/experiences?city=&category= -> Bangkok, Phuket, Koh Samui, Koh Phangan experience cards.

## Auth and Session

- GET /api/session -> role-aware session state.
- POST /api/auth/start -> begins traveller or companion auth flow.
- POST /api/auth/verify -> verifies auth challenge and returns session state.
- POST /api/auth/logout -> expires current session.

## Traveller Discovery

- GET /api/traveller/discovery?city=&experience=&availability=&verified= -> companion previews and filters.
- GET /api/traveller/companions/:id -> profile detail with visibility-safe fields.
- GET /api/traveller/companions/:id/availability -> availability windows.

## Inquiry

- POST /api/traveller/inquiries -> creates inquiry draft/submission.
- GET /api/traveller/inquiries -> current traveller inquiry list.
- GET /api/traveller/inquiries/:id -> inquiry detail and status.

## Payments - Stripe

- POST /api/traveller/inquiries/:id/stripe-checkout-session -> creates a Stripe Checkout Session only for Stripe-approved products and jurisdictions; otherwise returns a compliance hold error.
- GET /api/traveller/payments/:id -> payment state, inquiry reference, provider, amount, currency, and next allowed action.
- POST /api/webhooks/stripe -> verifies Stripe signature, deduplicates by Stripe event ID, updates PaymentRecord state, and writes audit context.

Payment contract rules:

- Stripe is the named payment service.
- Staged payment data must use the same API shape as production, but it must not create live Stripe charges.
- The client must never collect raw card data; use Stripe-hosted Checkout or Stripe-approved client elements only after compliance approval.
- If Stripe approval is missing, payment endpoints must return `PAYMENT_PROVIDER_NOT_APPROVED` with a safe non-leaking message.

## Companion

- GET /api/companion/onboarding -> current onboarding state.
- PATCH /api/companion/profile -> update draft profile fields.
- PATCH /api/companion/visibility -> update visibility settings.
- PATCH /api/companion/availability -> update availability windows.
- POST /api/companion/submit-verification -> submit for review.

## Safety and Account

- GET /api/safety/content -> safety center content and reporting entry points.
- POST /api/safety/reports -> create report.
- GET /api/account -> role-aware account settings.
- PATCH /api/account/privacy -> update privacy preferences.

## Error Shape

All errors return status, code, message, requestId, and optional fieldErrors. Profile unavailable states must be safe and non-revealing.
