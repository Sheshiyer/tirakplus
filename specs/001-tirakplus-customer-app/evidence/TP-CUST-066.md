# Evidence for TP-CUST-066: Profile Route Contract

## Contract Proof
- `GET /api/traveller/companions/:id` returns `CompanionProfile`.
- `CompanionProfilePage.tsx` is routed at `/traveller/companions/:companionId`.
- HTTP probe passed for `cmp-aura`.

## Anti-Pattern Checklist Evidence
- [x] Profile route returns visibility-safe fields only.
