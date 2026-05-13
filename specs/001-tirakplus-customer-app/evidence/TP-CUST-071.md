# Evidence for TP-CUST-071: Profile Safety Note

## Contract Proof
- `CompanionProfile.safetyNote` and `inquiryGuidance` are served by the Worker.
- `CompanionProfilePage.tsx` renders a dark safety panel after profile details.

## Anti-Pattern Checklist Evidence
- [x] Safety guidance appears before inquiry action context is completed.
