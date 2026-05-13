# TP-CUST-048 Evidence: Companion CTA Band

## Responsive Screenshot/Contract Proof
- Component: `src/app/components/home/AudienceCtaBand.tsx`, rendered by `src/app/pages/PublicHome.tsx`.
- API rail: Companion entry path comes from `GET /api/public/home` as `entryPaths`.
- Responsive proof: Desktop/wide uses a two-card CTA grid; mobile/tablet collapses to one column below 860px with 48px shared button targets.
- Verification command: `npm run check` passed after implementation (`wrangler types`, `tsc --noEmit`, `vite build`).

## Anti-Pattern Checklist Evidence
- [x] Companion CTA focuses on visibility control, review, boundaries, and agency.
- [x] No objectifying or status-ranking language.
- [x] No fake urgency or conversion pressure.
- [x] No red-light, neon, or fake-premium visual cliches.
- [x] Data comes through `/api/public/home`, not component-local arrays.
