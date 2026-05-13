# Evidence for TP-CUST-023: Companion Shell

## Contract Proof
- `CompanionShell.tsx` sets up navigation with companion-specific routes.
- Navigation items focus on management and agency (Dashboard, Inbox, Plans, Profile).
- Correctly implemented and hooked up to `/companion` paths in `main.tsx`.
- Browser smoke verified role switch routes to `/companion/dashboard`.

## Anti-Pattern Checklist Evidence
- [x] Focuses on business management (Dashboard, Plans) rather than passive discovery.
- [x] Does not use red-light, objectifying, or degrading terminology for routes.
- [x] Preserves companion agency through professional UI layout.
