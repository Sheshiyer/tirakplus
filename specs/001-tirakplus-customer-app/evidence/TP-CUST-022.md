# Evidence for TP-CUST-022: Traveller Shell

## Contract Proof
- `TravellerShell.tsx` renders `<TopNav />` and `<BottomNav />` with traveller-specific routes.
- Uses `TravellerShell` to wrap `/traveller/*` routes.
- Uses `member-shell` and `member-main` CSS classes for fixed header and mobile bottom-nav spacing.
- Browser smoke verified sign-in redirects to `/traveller/discovery`.

## Anti-Pattern Checklist Evidence
- [x] Clear and transactional routing (Discovery, Inbox, Plans, Account).
- [x] No artificial urgency or countdown timers in the shell navigation.
- [x] Neutral, calm styling avoiding cheap dating-app color schemes.
