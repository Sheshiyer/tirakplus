# Evidence for TP-CUST-030: Role-Aware Route Guard

## Contract Proof
- `ProtectedRoute.tsx` takes `allowedRoles` prop to enforce boundaries between `traveller` and `companion`.
- Redirects anonymous users to `/auth/login`.
- Redirects role mismatches to the active role home.
- Evaluated in `main.tsx` for `/traveller` and `/companion` paths.
- Browser smoke verified traveller login and companion switch paths.

## Anti-Pattern Checklist Evidence
- [x] No arbitrary exposure of profiles based on improper routing.
- [x] Strictly isolates views according to user persona.
