# TP-CUST-118 Evidence: Data Model Schema Draft

- Added `src/worker/data-model-schema.ts` and `docs/architecture/data-model-schema.md`.
- Exposed `GET /api/system/data-model`.
- Schema covers User, TravellerProfile, CompanionProfile, Experience, AvailabilityWindow, Inquiry, PaymentRecord, StripeWebhookEvent, SafetyReport, and AuditEvent.
- Anti-pattern check: private fields, review status, and visibility state are explicit.
