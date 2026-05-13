# TP-CUST-103 Evidence: Availability Contract

- Added companion availability update request/response types and Worker validation.
- Implemented `PATCH /api/companion/availability`.
- Availability windows include city, label, status, note, and hidden/tentative/available states.
- Verification required: API probes for valid and invalid availability payloads.
- Anti-pattern check: contract treats availability as planning context, not instant booking.
