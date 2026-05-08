
# Tirak Plus Constitution

## Core Principles

### I. Premium Discretion Before Conversion

Every public and logged-in surface must feel like a private travel concierge and discreet members club. The product may serve an adult companion market, but it must never use cheap dating-directory language, red-light visual cues, objectifying copy, fake urgency, or sexualized conversion bait. Trust, safety, consent, privacy, and local fluency are product requirements, not decoration.

### II. Specification-First Delivery

Specifications, plans, design contracts, and issue bodies are source-of-truth artifacts. Implementation must trace back to the relevant spec, issue, API contract, and design contract. If product intent changes, update the spec before changing code. No feature is implementation-ready until acceptance criteria, responsive behavior, API/data contracts, and verification evidence are explicit.

### III. API Rails Before UI Data

No UI component may hardcode mock data. Staged data is allowed only when delivered through the same API-shaped rails planned for production. Traveller discovery, companion profiles, onboarding, availability, inquiries, verification, moderation, and audit views must use documented request/response contracts before UI implementation begins.

### IV. Responsive Design Is Mandatory

Every user-facing and operator-facing workflow must specify mobile 390x844, tablet 768x1024, desktop 1280x800, and wide desktop 1440x900 behavior before implementation. Mobile must have no horizontal overflow, touch targets must be at least 44px, and full-height sections must use 100dvh-safe behavior rather than h-screen assumptions.

### V. Verification Before Done

No task, issue, user story, or phase is complete without evidence. Required evidence can include spec validation, issue checklist completion, API contract review, visual QA screenshots, accessibility checks, smoke tests, security/privacy review, or admin permission tests. Issue completion must include the anti-pattern checklist and explicit verification artifacts.

## Additional Constraints

- Main customer app target repo: sheshiyer/tirakplus.
- Admin panel target repo: sheshiyer/tirakplus0admin.
- Architecture direction: Cloudflare monolith-oriented TypeScript stack with API routes, auth/session handling, and frontend assets deployed through Cloudflare-compatible infrastructure.
- Customer app and admin panel share DESIGN.md, asset rules, terminology, safety posture, and issue format.
- Admin may use denser operational layouts, but it must not invent fake KPI cards or hide moderation risk behind vague statuses.
- Generated assets are references until explicitly approved for production use.

## Development Workflow

- Use spec-kit flow: constitution, specify, clarify/analyze, plan, tasks, taskstoissues.
- Maintain two spec tracks: 001-tirakplus-customer-app and 002-tirakplus-admin-panel.
- Maintain a 225-issue local backlog map before creating live GitHub issues.
- Do not run taskstoissues against a remote that is not the target repository for the intended app.
- Each issue must be detailed enough for another engineer or agent to execute without asking for missing context.

## Governance

This constitution overrides ad hoc design or implementation preferences. Any exception must be documented in the relevant spec or plan with rationale, risk, and verification requirements. Design regressions toward cheap dating-app patterns are blocking defects. API-contract drift, hardcoded mock data, and unresolved responsive behavior are blocking defects.

**Version**: 1.0.0 | **Ratified**: 2026-05-08 | **Last Amended**: 2026-05-08
