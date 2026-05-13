# Evidence for TP-CUST-076: Inquiry Form Contract

## Contract Proof
- `TravellerInquiryRequest` and `TravellerInquiryCreateResponse` are defined in shared contracts.
- `POST /api/traveller/inquiries` validates and returns `inquiry`.
- `InquiryCreatePage.tsx` submits through `TravellerService.createInquiry()`.

## Anti-Pattern Checklist Evidence
- [x] Inquiry is review-first and private; it is not an instant booking checkout.
