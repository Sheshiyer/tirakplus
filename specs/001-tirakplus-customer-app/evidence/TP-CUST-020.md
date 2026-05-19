# TP-CUST-020: visual anti-pattern checklist

## Status

Complete.

## Evidence

Verified current active UI avoids red-light/neon, objectifying copy, swipe-first UX, ratings, fake urgency, and component-local mock data for staged profiles.

## Source References

- DESIGN.md
- docs/design/component-system.md
- docs/design/responsive-view-matrix.md
- docs/design/asset-usage.md
- src/app/design-tokens.css
- src/app/styles.css
- src/app/registry/assets.ts
- specs/001-tirakplus-customer-app/contracts/ui-contract.md
- specs/001-tirakplus-customer-app/evidence/screenshots/chat-dev-qa-pass/

## Verification

- npm run check: passed during board cleanup pass.
- Anti-pattern review: no cheap dating-directory, objectifying, red-light, swipe-first, star-rating, fake-urgency, or component-local mock-data pattern accepted for this issue.
- Responsive requirement: covered by the binding responsive view matrix and current screenshot evidence where the issue has a visible surface.
