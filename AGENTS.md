# Tirak Plus Customer App Agent Instructions

<!-- SPECKIT START -->
Primary spec-kit plan:
- Tirak Plus Customer App: specs/001-tirakplus-customer-app/plan.md

Shared source-of-truth documents:
- .specify/memory/constitution.md
- DESIGN.md
- docs/design/responsive-view-matrix.md
- docs/design/component-system.md
- docs/design/asset-usage.md
- docs/payments/stripe.md
- docs/issues/backlog-map.md
<!-- SPECKIT END -->

## Project Rules

- Treat DESIGN.md as binding for all UI work.
- Treat docs/issues/backlog-map.md and the linked GitHub issues as the implementation source.
- Do not hardcode mock data in UI components; staged data must come through API-shaped rails.
- Block cheap dating-app, red-light, objectifying, fake-urgency, and swipe-first patterns.
- Payment service is Stripe, but live payment creation must stay behind the documented Stripe compliance gate until the exact business model and jurisdiction are approved.
