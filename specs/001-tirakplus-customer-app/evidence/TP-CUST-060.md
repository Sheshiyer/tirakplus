# Evidence for TP-CUST-060: Availability Filter Control

## Contract Proof
- `CompanionPreview.availabilityStatus` supports `available`, `planning_only`, and `hidden`.
- `TravellerDiscovery.tsx` renders the Availability `Select` from API options.
- Worker filters by `availability=available`.

## Anti-Pattern Checklist Evidence
- [x] Availability is described as review/planning context, not instant access or fake urgency.
