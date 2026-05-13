# Evidence for TP-CUST-034: Auth Error State

## Contract Proof
- `AuthVerify.tsx` and `AuthStart.tsx` handle errors dynamically provided by `useAuth`.
- Uses `error.message` with the `--color-risk-fig` token defined in design guidelines.

## Anti-Pattern Checklist Evidence
- [x] No alarmist popups.
- [x] Graceful inline error messages beneath form inputs.
