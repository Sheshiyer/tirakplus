
# Implementation Plan: Tirak Plus Customer App

**Branch**: `001-tirakplus-customer-app` | **Date**: 2026-05-08 | **Spec**: spec.md  
**Input**: Feature specification from specs/001-tirakplus-customer-app/spec.md

## Summary

Build the customer-facing Tirak Plus app as a premium, discreet Thailand companion concierge with traveller and companion flows, responsive UI contracts, and API-shaped staged data. Implementation must honor DESIGN.md, the constitution, and the 140 customer issues in docs/issues/backlog-map.md.

## Technical Context

**Language/Version**: TypeScript, modern React-compatible frontend, Cloudflare Workers-compatible runtime.  
**Primary Dependencies**: Cloudflare Workers/Pages or Workers Assets, Hono-style API routing, React UI, schema validation, D1-compatible persistence, R2-compatible media storage, Stripe API for approved payment flows.  
**Storage**: D1-compatible relational store for staged/production entities and Stripe payment state; R2-compatible object storage for approved media; KV-compatible cache for non-sensitive lookup/config data.  
**Testing**: Contract tests for API rails, Stripe webhook/idempotency tests, integration tests for user journeys, Playwright visual/responsive checks, accessibility checks.  
**Target Platform**: Cloudflare-hosted web app.  
**Project Type**: Full-stack web app with API routes and static/frontend assets in a Cloudflare monolith deployment model.  
**Performance Goals**: First useful render under 2.5 seconds on mobile staging build; API p95 under 300ms for staged data; no layout shift from generated assets.  
**Constraints**: No hardcoded mock data in UI components; no banned dating-app patterns; mobile 390x844 must have no horizontal overflow; live Stripe payments remain disabled until documented Stripe compliance approval is complete.  
**Scale/Scope**: Customer app covers home, discovery, profile, traveller onboarding, companion onboarding, auth, inquiry, safety center, and account/settings.

## Constitution Check

- Premium discretion before conversion: PASS. DESIGN.md and anti-pattern rules are mandatory.
- Specification-first delivery: PASS. Feature spec, plan, tasks, contracts, and issue map are source of truth.
- API rails before UI data: PASS. Contracts are defined before implementation tasks.
- Responsive design mandatory: PASS. Four breakpoints and required screens are explicit.
- Verification before done: PASS. Each issue includes verification evidence.

## Project Structure

~~~text
specs/001-tirakplus-customer-app/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contract.md
│   └── ui-contract.md
└── tasks.md

docs/design/
├── responsive-view-matrix.md
├── component-system.md
└── asset-usage.md

docs/issues/
└── backlog-map.md
~~~

**Structure Decision**: Customer implementation will later use a Cloudflare monolith app structure. This planning pass creates only spec/design/backlog artifacts.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Separate customer and admin specs | Different user/operator stories and risk models | One combined spec would dilute ownership and make the 225-issue backlog harder to validate |
| API-shaped staged data before production data | Prevents UI mock-data debt | Component-local mock arrays would violate the constitution and make production transition unsafe |
| Stripe behind a PaymentProvider gate | Keeps payment contracts implementation-ready while respecting Stripe restricted-business constraints | Direct live payment calls would be risky before Stripe approves the exact business model and jurisdiction |

## Phase 0: Research Decisions

See research.md for source-driven decisions from awesome-design-md, spec-kit, current Tirak assets, and local anti-pattern rules.

## Phase 1: Design and Contracts

- Data model: data-model.md.
- API contracts: contracts/api-contract.md.
- UI contracts: contracts/ui-contract.md.
- Quickstart validation: quickstart.md.

## Phase 2: Task and Issue Mapping

- Customer tasks: 140 tasks in tasks.md.
- Customer issues: TP-CUST-001 through TP-CUST-140 in docs/issues/backlog-map.md.
