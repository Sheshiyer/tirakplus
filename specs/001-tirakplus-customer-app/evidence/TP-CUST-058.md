# Evidence for TP-CUST-058: City Filter Control

## Contract Proof
- `TravellerDiscovery.tsx` renders the City `Select` from `filterOptions.cities`.
- Query param `city=bangkok` is parsed by the Worker and reflected in the response `filters`.
- HTTP probe confirmed Bangkok-only result filtering.

## Anti-Pattern Checklist Evidence
- [x] City selection is destination context, not proximity or "near me now" positioning.
