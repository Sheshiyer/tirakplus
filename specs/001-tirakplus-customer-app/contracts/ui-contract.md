
# UI Contract: Tirak Plus Customer App

## Breakpoints

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

## Required States

Every screen must define:

- Loading skeleton shaped like real content.
- Empty state with next action.
- Error state with recovery path.
- Success or unavailable state where the workflow can complete or be blocked.
- Permission or visibility state for protected/sensitive surfaces.

## Required Anti-Pattern Gate

- No cheap dating-directory energy.
- No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- No red-light, neon nightlife flyer, or bikini-led hero treatment.
- No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- No hardcoded mock data in UI components; staged data must come through API-shaped rails.

## Required Screens

- home
- traveller discovery
- companion profile
- traveller onboarding
- companion onboarding
- auth
- inquiry flow
- safety center
- account settings
