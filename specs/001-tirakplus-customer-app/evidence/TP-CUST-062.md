# Evidence for TP-CUST-062: Discovery Result Card

## Contract Proof
- `CompanionPreviewCard` renders profile preview, city, verification state, experience tags, and availability summary.
- `TravellerDiscovery.tsx` wraps cards in profile links.
- Playwright mobile smoke verified result cards link to `/traveller/companions/cmp-aura`.

## Anti-Pattern Checklist Evidence
- [x] Cards show verification and fit context, not star ratings or swipe actions.
