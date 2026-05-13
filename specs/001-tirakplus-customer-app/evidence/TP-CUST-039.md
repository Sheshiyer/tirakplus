# TP-CUST-039 Evidence: City Overview Phuket

## Responsive Screenshot/Contract Proof
- Route: `/cities/phuket` via `src/app/pages/CityOverviewPage.tsx`.
- Component: `src/app/components/home/CityOverview.tsx`.
- API rail: City metadata comes from `GET /api/public/home`; Phuket experience contexts come from `GET /api/public/experiences?city=phuket`.
- Responsive proof: Desktop/wide uses sticky editorial city copy plus two-column experience cards; mobile/tablet collapses to one column below 860px with no horizontal overflow.
- Verification command: `npm run check` passed after implementation (`wrangler types`, `tsc --noEmit`, `vite build`).

## Anti-Pattern Checklist Evidence
- [x] No cheap dating-directory grid or face-led browse surface.
- [x] No objectifying or nationality-as-fetish copy.
- [x] No red-light, neon, bikini-led, or party-flyer visual language.
- [x] No person-ranking, pressure cues, or browse-volume mechanics.
- [x] Data comes through API-shaped rails, not component-local arrays.
