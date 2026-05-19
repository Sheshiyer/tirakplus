# TP-CUST-055 Evidence: Public Visual QA

- Captured public visual references:
  - `specs/001-tirakplus-customer-app/evidence/screenshots/phase7-390x844-root.png`
  - `specs/001-tirakplus-customer-app/evidence/screenshots/phase7-768x1024-overview.png`
  - `specs/001-tirakplus-customer-app/evidence/screenshots/phase7-1280x800-overview.png`
  - `specs/001-tirakplus-customer-app/evidence/screenshots/phase7-390x844-auth.png`
- `sips -g pixelWidth -g pixelHeight` confirmed screenshot dimensions.
- Browser MCP console check returned zero warnings/errors on `/` and `/overview`.
- Anti-pattern check: visual QA confirms Muse/private-routing positioning instead of generic dating-app mechanics.

## PNG Recovery Correction - 2026-05-18

- Rejected the GLB/model-viewer route for Wave 1 after visual review.
- Replaced app runtime character rendering with `MusePoseImage`, a plain PNG image component.
- Removed Muse art from auth so concept-board text and cropped UI fragments do not leak into login.
- Root Muse screen now implements the board composition with real DOM/CSS: Muse title, private Thailand subtitle, privacy promise rail, chat panel, and prompt input.
- Verification: `npm run check` passed and source audit shows no `model-viewer`, `MuseModel`, `.glb`, or `pose-pack` references in `src/app` or `public/assets/muse`.
- Latest screenshots: `specs/001-tirakplus-customer-app/evidence/screenshots/png-recovery-final/`.
