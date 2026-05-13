# TP-CUST-096 Evidence: Onboarding Mobile Layout

- Added mobile responsive rules for companion hero, workflow grid, step panel, form columns, and choices.
- Mobile width uses `min(100% - 32px, 520px)` with single-column grids.
- Bottom navigation uses a short availability label to avoid text overflow at 390px width.
- Verification required: Playwright/browser smoke at 390x844 on `/companion/onboarding`.
- Anti-pattern check: mobile UI is operational and discreet, not swipe-first or card-stacked dating browse.
