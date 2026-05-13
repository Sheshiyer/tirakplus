# TP-CUST-036 Evidence: Home Hero

## Responsive Screenshot/Contract Proof
- Component: `src/app/components/home/HomeHero.tsx`, rendered by `src/app/pages/PublicHome.tsx`.
- API rail: `GET /api/public/home` supplies `brand.name` and `brand.promise`; the hero does not declare local profile, city, or inventory mock arrays.
- Responsive proof: CSS uses a two-column asymmetric editorial grid on desktop/wide and collapses to one column below 860px for mobile/tablet safety. Buttons retain 48px minimum height through the shared `.button` rules.
- Verification command: `npm run check` passed after implementation (`wrangler types`, `tsc --noEmit`, `vite build`).

## Anti-Pattern Checklist Evidence
- [x] No cheap dating-directory energy: first viewport is brand promise plus workflow panel, not a grid of faces.
- [x] No objectifying language: copy uses travellers, companions, concierge, review, and inquiry framing.
- [x] No red-light or neon nightlife cue: colors stay Porcelain, Pearl, Charcoal, Rose Bronze, and Trust Green.
- [x] No swipe-first, star ratings, or fake online urgency.
- [x] Data flows through `/api/public/home`, not component-local mock data.
