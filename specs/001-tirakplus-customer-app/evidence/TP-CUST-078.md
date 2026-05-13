# Evidence for TP-CUST-078: Inquiry Validation Errors

## Contract Proof
- Worker validates preferred window, message length, privacy acknowledgement, city, experience, and companion ID.
- HTTP probe returned `422 INQUIRY_VALIDATION_FAILED` with `fieldErrors`.
- `InquiryCreatePage.tsx` maps field errors into form controls.

## Anti-Pattern Checklist Evidence
- [x] Validation enforces respectful, reviewable inquiry context.
