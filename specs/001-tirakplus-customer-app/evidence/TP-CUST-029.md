# Evidence for TP-CUST-029: Expired Session Redirect

## Contract Proof
- `ProtectedRoute.tsx` implements logic to check if a user is authenticated.
- If not authenticated and not loading, redirects to `/auth/login`.

## Anti-Pattern Checklist Evidence
- [x] Silent redirects without jarring popups or fake error alerts.
- [x] Professional session handling flow.
