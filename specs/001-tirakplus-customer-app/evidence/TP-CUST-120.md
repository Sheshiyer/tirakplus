# TP-CUST-120 Evidence: Request ID Propagation

- Added `createRequestId()` and response `X-Request-Id` headers.
- Incoming safe `X-Request-Id` values are propagated through success and error responses.
- Auth, route handlers, validation errors, and not-found errors now share the same request ID for a request.
- Contract smoke asserts request ID body/header propagation.
