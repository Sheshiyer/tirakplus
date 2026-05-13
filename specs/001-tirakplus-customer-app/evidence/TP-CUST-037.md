# TP-CUST-037 Evidence: Home Trust Band

## Responsive Screenshot/Contract Proof
- Component: `src/app/components/home/HomeTrustBand.tsx`, rendered by `src/app/pages/PublicHome.tsx`.
- API rail: Trust highlights are supplied by `GET /api/public/home` as `highlights`.
- Responsive proof: CSS renders a two-column trust band on desktop/wide and collapses to a single-column list below 860px. The band uses border, whitespace, and restrained elevation instead of nested cards.
- Verification command: `npm run check` passed after implementation (`wrangler types`, `tsc --noEmit`, `vite build`).

## Anti-Pattern Checklist Evidence
- [x] No cheap dating-directory energy: the band emphasizes verification, private inquiries, and provider approval.
- [x] No objectifying language or person-ranking mechanics.
- [x] No red-light, neon, or club-flyer treatment.
- [x] No fake urgency: copy describes review gates, not scarcity.
- [x] Data comes from `/api/public/home`, not hardcoded UI arrays.
