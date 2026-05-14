# Data Model Schema Draft

The implementation schema is exposed by `GET /api/system/data-model` and defined in `src/worker/data-model-schema.ts`.

Entities:

- `User`
- `TravellerProfile`
- `CompanionProfile`
- `Experience`
- `AvailabilityWindow`
- `Inquiry`
- `PaymentRecord`
- `StripeWebhookEvent`
- `SafetyReport`
- `AuditEvent`

Core rules:

- Sensitive fields are explicitly marked private.
- Companion public visibility is never inferred from missing data; review and visibility fields are mandatory.
- Inquiry messages remain private and are not copied onto profile or discovery surfaces.
- Payment records are created only behind the documented compliance gate.
- Webhook events must be signature-verified and idempotent before mutating payment state.
