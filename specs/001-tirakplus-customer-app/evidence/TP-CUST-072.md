# Evidence for TP-CUST-072: Profile Unavailable State

## Contract Proof
- Restricted profile `cmp-nara` returns HTTP `423 PROFILE_UNAVAILABLE`.
- `CompanionProfilePage.tsx` catches unavailable errors and renders a safe `FeedbackState`.
- Playwright desktop smoke verified the unavailable state.

## Anti-Pattern Checklist Evidence
- [x] The unavailable state does not leak hidden profile details.
