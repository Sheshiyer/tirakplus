# Evidence for TP-CUST-059: Experience Filter Control

## Contract Proof
- `TravellerDiscovery.tsx` renders the Experience `Select` from `filterOptions.experiences`.
- Worker parses `experience=muay-thai-night`.
- HTTP probe returned only profiles matching the Muay Thai night experience.

## Anti-Pattern Checklist Evidence
- [x] Experiences use nightlife, island, dining, fight-night, and guidance context without explicit or objectifying labels.
