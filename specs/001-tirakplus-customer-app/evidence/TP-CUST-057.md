# Evidence for TP-CUST-057: Discovery Filter Model

## Contract Proof
- `DiscoveryFilterSelection` and `DiscoveryFilterModel` are defined in `src/shared/contracts.ts`.
- `discoveryFilterOptions` is served from `src/worker/staged-data.ts`.
- `TravellerDiscovery.tsx` renders filters from API-provided options.

## Anti-Pattern Checklist Evidence
- [x] Filter language is trip-context oriented, not ranking or desirability oriented.
- [x] No browse-volume or online-now filter exists.
