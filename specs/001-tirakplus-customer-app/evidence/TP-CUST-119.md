# TP-CUST-119 Evidence: Error Response Shape

- Hardened `src/worker/http.ts` around shared error envelopes.
- Errors return `status`, `code`, `message`, `requestId`, and optional `fieldErrors`.
- Stripe compliance now returns `PAYMENT_PROVIDER_NOT_APPROVED` as an error envelope, not a failed success envelope.
- Contract smoke verifies validation and compliance errors.
