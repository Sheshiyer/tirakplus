# TP-CUST-049 Evidence: Traveller CTA Band

## Responsive Screenshot/Contract Proof
- Component: `src/app/components/home/AudienceCtaBand.tsx`, rendered by `src/app/pages/PublicHome.tsx`.
- API rail: Traveller entry path comes from `GET /api/public/home` as `entryPaths`.
- Responsive proof: Desktop/wide uses a two-card CTA grid; mobile/tablet collapses to one column below 860px with 48px shared button targets.
- Verification command: `npm run check` passed after implementation (`wrangler types`, `tsc --noEmit`, `vite build`).

## Anti-Pattern Checklist Evidence
- [x] Traveller CTA focuses on city context, experience context, safety guidance, and private inquiry.
- [x] No objectifying or browse-volume language.
- [x] No fake urgency or conversion pressure.
- [x] No red-light, neon, or party-flyer visual treatment.
- [x] Data comes through `/api/public/home`, not component-local arrays.
