# Evidence for TP-CUST-032: Logout Flow

## Contract Proof
- `AccountSettings.tsx` calls `AuthContext.logout()` from the session panel.
- `AuthContext.logout()` calls `SessionService.logout()` and clears local session state.
- `SessionService.logout()` posts to `/api/auth/logout`.
- `src/worker/auth.ts` clears the staged session cookie using `Max-Age=0`.
- HTTP probe verified `/api/session` returns `session: null` and `status: anonymous` after logout.

## Anti-Pattern Checklist Evidence
- [x] Logout is a calm account action, not buried or dark-patterned.
- [x] No user data remains in browser-visible token fields.
- [x] Session state remains API-shaped and privacy-aware.
