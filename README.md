# Tirak Plus Customer App

This repository contains the spec-kit planning baseline for Tirak Plus Customer App.

## Source of Truth

- `DESIGN.md`: premium Tirak visual and product rules.
- `.specify/memory/constitution.md`: binding delivery constitution.
- `specs/001-tirakplus-customer-app/plan.md`: implementation plan.
- `docs/issues/backlog-map.md`: repo-local issue-ready backlog.
- `docs/payments/stripe.md`: Stripe payment-service decision and compliance gate.
- `docs/payments/provider-alternatives.md`: Thailand/local and high-risk payment-provider research.

## GitHub Issues

The initial backlog has been published here: https://github.com/Sheshiyer/tirakplus/issues

Issue count in this repo: 140.

## Payment Provider

Stripe is the first adapter candidate, not a hard product dependency. Live payment creation is disabled by default until the selected provider approves the exact Tirak business model, jurisdiction, product wording, and merchant-account setup. API contracts and UI states should be implemented first through the PaymentProvider boundary so Stripe, KBank, SCB, 2C2P, Bangkok Bank, GB Prime Pay, or a specialist high-risk provider can be swapped without rewriting product flows.
