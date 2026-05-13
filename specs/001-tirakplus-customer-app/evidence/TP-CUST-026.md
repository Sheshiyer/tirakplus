# Evidence for TP-CUST-026: Auth Start Screen

## Contract Proof
- `AuthStart.tsx` created and hooked up to `/auth/login` via `main.tsx`.
- Single column layout centered on screen using `.auth-page` and `.auth-panel`.
- Provides an email input for seamless magic-link / OTP style auth matching standard modern paradigms.
- Bottom safe areas handled, spacing logic respects `DESIGN.md`.
- Form calls `SessionService.requestLogin()`, which posts to `/api/auth/start`.
- Browser smoke verified the form renders at mobile `390x844` and transitions to `/auth/verify`.

## Anti-Pattern Checklist Evidence
- [x] Simple and clean typography without urgent CTAs.
- [x] No dating-app style social logins emphasized inappropriately.
- [x] Respectful onboarding copy linking to safety and community guidelines.
