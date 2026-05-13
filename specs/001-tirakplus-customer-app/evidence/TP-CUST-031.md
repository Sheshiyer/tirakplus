# Evidence for TP-CUST-031: Account Switch State

## Contract Proof
- `AccountSettings.tsx` exposes the active customer role and a switch action.
- `AuthContext.switchRole()` calls `SessionService.switchRole()`.
- `SessionService.switchRole()` posts to `/api/session/role`.
- `src/worker/auth.ts` updates the staged HttpOnly session cookie and returns the next session.
- HTTP probe verified `traveller` to `companion` role transition.
- Browser smoke verified the route moves from `/traveller/account` to `/companion/dashboard`.

## Anti-Pattern Checklist Evidence
- [x] Role switching is framed as account context, not persona bait.
- [x] No fake online state, ranking, or dating-app pressure pattern is introduced.
- [x] The API contract can be replaced by production auth without changing route consumers.
