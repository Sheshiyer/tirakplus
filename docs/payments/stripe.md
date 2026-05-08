# Stripe Payment Service Decision

## Decision

Stripe is the named payment service for Tirak Plus planning.

Implementation must use a PaymentProvider boundary so customer and admin code depend on Tirak API contracts, not direct Stripe calls from UI components. Staged data may simulate Stripe-shaped states, but live Stripe payment creation remains disabled until the exact Tirak business model, jurisdiction, product wording, and merchant account setup are approved.

## Current Policy Risk

Official Stripe policy currently lists adult services, including escorts, under prohibited adult content and services. It also lists online dating and matchmaking as limited availability, with Thailand dating services specifically listed under jurisdiction-specific prohibited businesses. Source: https://stripe.com/en-ca/legal/restricted-businesses

This does not prevent planning the Stripe integration, but it changes implementation order:

- Build API contracts and UI states now.
- Keep live charges disabled by default.
- Add explicit `PAYMENT_PROVIDER_NOT_APPROVED` and `disabled_for_compliance` states.
- Complete Stripe/business-model review before production payment enablement.
- Keep a fallback provider boundary available if Stripe cannot approve the business model.

## Customer Payment Rails

- `POST /api/traveller/inquiries/:id/stripe-checkout-session`
- `GET /api/traveller/payments/:id`
- `POST /api/webhooks/stripe`

Rules:

- Use Stripe-hosted Checkout or approved Stripe client elements only after compliance approval.
- Do not collect raw card data in Tirak UI.
- Do not expose Stripe secrets to client code.
- Store provider IDs, status, amount, currency, compliance state, idempotency key, and request ID.
- Use idempotency keys for checkout/session creation.
- Webhooks must verify Stripe signatures before changing payment state.

## Admin Payment Rails

- `GET /api/admin/payments?status=&complianceState=&inquiryId=`
- `GET /api/admin/payments/:id`
- `POST /api/admin/payments/:id/mark-compliance-review`
- `GET /api/admin/stripe/webhook-events?paymentId=&status=`

Rules:

- Operators can see provider status, compliance state, webhook state, audit links, and request IDs.
- Operators must not see raw card data or unredacted payment instruments.
- Refund, dispute, payout, and Connect workflows are separate approval decisions and are not part of the first payment contract.

## Verification Gate

Before any production Stripe payment is enabled, an implementation issue must attach:

- Stripe approval or written supportability decision for the exact business model.
- Jurisdiction review covering Thailand and any merchant country.
- Product-copy review proving Tirak is not presenting prohibited adult, dating, escort, or sexual-service transactions.
- Contract test evidence for checkout creation, compliance hold, webhook verification, duplicate webhook idempotency, and payment-state display.
- Admin screenshot evidence showing payment state without raw card data.
