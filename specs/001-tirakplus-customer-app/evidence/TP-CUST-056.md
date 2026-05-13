# Evidence for TP-CUST-056: Discovery API Contract

## Contract Proof
- `GET /api/traveller/discovery` returns `filters`, `filterOptions`, `results`, `emptyState`, and `guidance`.
- HTTP probe passed for `city=bangkok&experience=muay-thai-night&availability=available`.
- Response includes request ID and API-shaped staged data.

## Anti-Pattern Checklist Evidence
- [x] Discovery returns review and availability context instead of ratings.
- [x] No hardcoded profile arrays are used inside UI components.
