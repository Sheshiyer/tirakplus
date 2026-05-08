# Tirak Plus Customer App

This repository contains the spec-kit planning baseline for Tirak Plus Customer App.

## Source of Truth

- `DESIGN.md`: premium Tirak visual and product rules.
- `.specify/memory/constitution.md`: binding delivery constitution.
- `specs/001-tirakplus-customer-app/plan.md`: implementation plan.
- `docs/issues/backlog-map.md`: repo-local issue-ready backlog.
- `docs/payments/stripe.md`: Stripe payment-service decision and compliance gate.

## GitHub Issues

The initial backlog has been published here: https://github.com/Sheshiyer/tirakplus/issues

Issue count in this repo: 140.

## Payment Provider

Stripe is the named payment service. Live Stripe payment creation is disabled by default until Stripe approves the exact Tirak business model, jurisdiction, product wording, and merchant-account setup. API contracts and UI states should be implemented first through the PaymentProvider boundary.
