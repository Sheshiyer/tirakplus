# UI Repair Phase 1 Baseline Evidence

Captured on 2026-05-21 against `http://127.0.0.1:8787`.

## Scope

- Muse entry: `390x844`, `768x1024`, `1280x800`, `1440x900`.
- Traveller protected routes: dashboard, discovery, companion profile, inbox, plans, safety, account at `390x844`.
- Companion protected routes: dashboard, onboarding, profile, inbox, plans, safety, account at `390x844`.

## Current Ratings

| Surface | Rating | Main gap |
|---|---:|---|
| Overall product design match | 5/10 | App rails exist, but route composition and Muse placement still drift from references. |
| Traditional app layer | 6.5/10 | Card/form foundation is present but not yet reference-tight. |
| Muse layer | 4/10 | Muse is conceptually present but needs a close, layered, reference-led composition. |
| Flow coherence | 5.5/10 | Muse and normal app routes coexist but handoff and fallback boundaries need implementation. |

## Files

- `muse-entry-mobile-390x844.png`
- `muse-entry-tablet-768x1024.png`
- `muse-entry-desktop-1280x800.png`
- `muse-entry-wide-1440x900.png`
- `traveller-dashboard-mobile-390x844.png`
- `traveller-discovery-mobile-390x844.png`
- `traveller-companions-cmp-mali-mobile-390x844.png`
- `traveller-inbox-mobile-390x844.png`
- `traveller-plans-mobile-390x844.png`
- `traveller-safety-mobile-390x844.png`
- `traveller-account-mobile-390x844.png`
- `companion-dashboard-mobile-390x844.png`
- `companion-onboarding-mobile-390x844.png`
- `companion-profile-mobile-390x844.png`
- `companion-inbox-mobile-390x844.png`
- `companion-plans-mobile-390x844.png`
- `companion-safety-mobile-390x844.png`
- `companion-account-mobile-390x844.png`

## Smoke Notes

- Playwright console warning/error sweep returned zero messages for the captured session.
- `npm run copy:audit` passed.
- `npm run route:audit` passed.
