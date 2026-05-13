# Evidence for TP-CUST-082: Inquiry List Endpoint

## Contract Proof
- `GET /api/traveller/inquiries` returns `results` and `emptyState`.
- `TravellerInquiriesPage.tsx` renders the inbox list from API data.
- HTTP probe passed for inquiry list.

## Anti-Pattern Checklist Evidence
- [x] Inquiry list shows review status, not public social or popularity state.
