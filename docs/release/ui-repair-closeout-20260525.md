# UI Repair Closeout 2026-05-25

## Scope

This closeout covers UI repair issues `UIR-012` through `UIR-059` that remained open on GitHub after the Phase 4 product-readiness hardening commit.

## Release Candidate

- Branch: `main`
- Commit: `7c61a24 Harden Tirak Plus product readiness`
- Local preview: `http://127.0.0.1:8787`
- Runtime mode: staged customer app, `PAYMENT_PROVIDER_MODE=compliance_hold`, `MUSE_AGENT_MODE=external` with local service binding not connected.

## Verification

- `npm run quality:release` passed.
- `npm run contract:smoke` passed 31 API checks against `http://127.0.0.1:8787`.
- `npm run stripe:smoke` passed with checkout correctly blocked by `PAYMENT_PROVIDER_NOT_APPROVED`.
- `npm run app:smoke` passed 9 routes against `http://127.0.0.1:8787`.

Screenshot evidence:

- `generated/qa-screenshots/ui-repair-phase2-protected-20260521/`
- `generated/qa-screenshots/ui-repair-phase3-muse-layer-20260521/`
- `generated/qa-screenshots/ui-repair-phase4-public-floor-asset-20260524/`
- `generated/qa-screenshots/public-account-copy-hygiene-20260525/`
- `generated/qa-screenshots/phase4-product-readiness-20260525/`

## Design Score

- Overall product-readiness match: `8/10`
- Protected app layer: `8/10`
- Muse layer: `8/10`
- Visual reference QA: `4/5`

The app now preserves the two-layer architecture: Muse handles onboarding, private read, and staged interaction support, while the conventional card/form app layer remains usable for dashboard, profile, inquiry, safety, account, and payment-state workflows.

## Issue Closeout

- `UIR-012` through `UIR-022`: completed through protected dashboard, discovery, profile, inquiry, plans, inbox, safety, account, companion dashboard/onboarding, shell, and integration review work.
- `UIR-034` through `UIR-045`: completed through asset provenance, responsive Muse assets, product media placement, staleness/board-crop audits, and final asset pipeline review.
- `UIR-046` through `UIR-058`: completed through screenshot matrix, route smoke, copy hygiene, accessibility/focus spot checks, asset loading review, payment/safety regression, Muse regression, release suite, preview notes, and final closeout.
- `UIR-059`: intentionally closed as superseded. The GLB/model-viewer fallback renderer is out of scope for Wave 1 and conflicts with the approved PNG-based Muse asset direction. `scripts/render-muse-pose-fallbacks.mjs` remains a retired scaffold and must not recreate `public/assets/muse/png-poses`.

## Rollback

Rollback to the pre-UI-repair remote baseline:

```sh
git revert --no-commit f5cb28b^..7c61a24
npm run quality:release
npm run contract:smoke
git commit -m "Revert UI repair release candidate"
git push origin main
```

If only the final hardening pass needs rollback, revert:

```sh
git revert 7c61a24
npm run quality:release
npm run contract:smoke
git push origin main
```

## Residual Risks

- Muse RAG remains staged locally until the external service binding and production credentials are connected.
- Stripe checkout remains blocked by the documented compliance gate.
- Current Muse foreground assets are launchable placeholders from the approved portrait family, not final brand art.
- Production preview still needs the hosting provider deployment URL and custom-domain verification before public launch.
