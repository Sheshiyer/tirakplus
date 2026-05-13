# TP-CUST-038 Evidence: City Overview Bangkok

## Responsive Screenshot/Contract Proof
- Component: `src/app/components/home/CityOverview.tsx`, rendered by `src/app/pages/PublicHome.tsx` for Bangkok.
- API rail: City copy is supplied by `GET /api/public/home`; Bangkok experience cards are supplied by `GET /api/public/experiences?city=bangkok`.
- Endpoint behavior: `src/worker/index.ts` now applies both `city` and `category` filters for `/api/public/experiences` to match the public API contract.
- Responsive proof: CSS renders a sticky editorial city panel with two-column experience cards on desktop/wide and collapses to a single column below 860px with no horizontal overflow.
- Verification command: `npm run check` passed after implementation (`wrangler types`, `tsc --noEmit`, `vite build`).

## Anti-Pattern Checklist Evidence
- [x] No cheap dating-directory energy: Bangkok is framed through private evenings, fight nights, rooftops, and reviewed plans.
- [x] No objectifying language or nationality-as-fetish phrasing.
- [x] No red-light or nightlife flyer visuals: cards use neutral surfaces and safety notes.
- [x] No swipe-first, star ratings, or online-now mechanics.
- [x] City and experience data come through API-shaped rails, not component-local arrays.
