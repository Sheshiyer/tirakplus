# Evidence for TP-CUST-069: Profile Availability Panel

## Contract Proof
- `GET /api/traveller/companions/:id/availability` returns availability windows.
- `CompanionProfilePage.tsx` renders `availabilityWindows`.
- HTTP probe passed for `cmp-aura/availability`.

## Anti-Pattern Checklist Evidence
- [x] Availability is shown as planning context and review status, not instant booking.
