# TP-CUST-044 Evidence: Muay Thai Night Page

## Responsive Screenshot/Contract Proof
- Route: `/experiences/muay-thai-night` via `src/app/pages/ExperiencePage.tsx`.
- API rail: Context cards come from `GET /api/public/experiences?category=muay-thai-night`.
- Responsive proof: Desktop/wide uses a constrained editorial hero plus three-column context cards; mobile/tablet collapse to one column below 860px with 48px shared button targets.
- Verification command: `npm run check` passed after implementation (`wrangler types`, `tsc --noEmit`, `vite build`).

## Anti-Pattern Checklist Evidence
- [x] No cheap dating-directory grid or face-led browse surface.
- [x] No objectifying copy or explicit bait.
- [x] No red-light, neon, or club-flyer visual language.
- [x] No person-ranking, pressure cues, or browse-volume mechanics.
- [x] Experience data comes through API-shaped rails, not component-local arrays.
