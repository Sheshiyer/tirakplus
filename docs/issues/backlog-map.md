# Tirak Plus Customer App Issue Backlog Map

## Summary

This file is the repo-local issue source for Tirak Plus Customer App. The initial issue set has already been published to Sheshiyer/tirakplus.

- Total issues in this repo: 140
- Published issues: https://github.com/Sheshiyer/tirakplus/issues
- Source planning date: 2026-05-08

## Payment Service Decision

Stripe is the named payment service, behind a PaymentProvider abstraction and the compliance gate in docs/payments/stripe.md. Live Stripe charges stay disabled until Stripe approves the exact Tirak business model, jurisdiction, and payment use case.

## Issue Body Contract

Every issue below contains objective, user/operator value, design surface, implementation scope, responsive requirements, API/data references, dependencies, acceptance criteria, verification evidence, and anti-pattern checklist.


## TP-CUST-001: Customer: DESIGN.md token audit

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the DESIGN.md token audit customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: DESIGN.md token audit
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for DESIGN.md token audit.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on constitution and DESIGN.md only.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-002: Customer: color token implementation

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the color token implementation customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: color token implementation
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for color token implementation.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-003: Customer: type scale implementation

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the type scale implementation customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: type scale implementation
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for type scale implementation.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-004: Customer: button variants

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the button variants customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: button variants
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for button variants.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-005: Customer: card and panel rules

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the card and panel rules customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: card and panel rules
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for card and panel rules.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-006: Customer: navigation rules

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the navigation rules customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: navigation rules
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for navigation rules.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-007: Customer: profile card rules

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the profile card rules customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: profile card rules
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for profile card rules.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-008: Customer: form field rules

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the form field rules customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: form field rules
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for form field rules.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-009: Customer: state components

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the state components customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: state components
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for state components.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-010: Customer: asset usage registry

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the asset usage registry customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: asset usage registry
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for asset usage registry.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-011: Customer: app icon handoff

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the app icon handoff customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: app icon handoff
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for app icon handoff.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-012: Customer: icon sheet extraction plan

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the icon sheet extraction plan customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: icon sheet extraction plan
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for icon sheet extraction plan.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-013: Customer: brand board staging guide

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the brand board staging guide customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: brand board staging guide
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for brand board staging guide.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-014: Customer: responsive view matrix home

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the responsive view matrix home customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: responsive view matrix home
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for responsive view matrix home.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-015: Customer: responsive view matrix discovery

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the responsive view matrix discovery customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: responsive view matrix discovery
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for responsive view matrix discovery.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-016: Customer: responsive view matrix profile

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the responsive view matrix profile customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: responsive view matrix profile
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for responsive view matrix profile.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-017: Customer: responsive view matrix onboarding

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the responsive view matrix onboarding customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: responsive view matrix onboarding
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for responsive view matrix onboarding.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-018: Customer: responsive view matrix auth

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the responsive view matrix auth customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: responsive view matrix auth
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for responsive view matrix auth.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-019: Customer: responsive view matrix safety

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the responsive view matrix safety customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: responsive view matrix safety
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for responsive view matrix safety.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-020: Customer: visual anti-pattern checklist

- **Epic**: Design system, responsive view matrix, and asset integration
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the visual anti-pattern checklist customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: visual anti-pattern checklist
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for visual anti-pattern checklist.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-021: Customer: public app shell

- **Epic**: App shell, navigation, auth, roles, session states
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the public app shell customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: public app shell
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for public app shell.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-022: Customer: logged-in traveller shell

- **Epic**: App shell, navigation, auth, roles, session states
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the logged-in traveller shell customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: logged-in traveller shell
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for logged-in traveller shell.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-023: Customer: logged-in companion shell

- **Epic**: App shell, navigation, auth, roles, session states
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the logged-in companion shell customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: logged-in companion shell
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for logged-in companion shell.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-024: Customer: mobile bottom nav

- **Epic**: App shell, navigation, auth, roles, session states
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the mobile bottom nav customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: mobile bottom nav
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for mobile bottom nav.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-025: Customer: desktop nav rail

- **Epic**: App shell, navigation, auth, roles, session states
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the desktop nav rail customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: desktop nav rail
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for desktop nav rail.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-026: Customer: auth start screen

- **Epic**: App shell, navigation, auth, roles, session states
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the auth start screen customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: auth start screen
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for auth start screen.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-027: Customer: auth verify screen

- **Epic**: App shell, navigation, auth, roles, session states
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the auth verify screen customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: auth verify screen
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for auth verify screen.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-028: Customer: session endpoint contract

- **Epic**: App shell, navigation, auth, roles, session states
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the session endpoint contract customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: session endpoint contract
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for session endpoint contract.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-029: Customer: expired session redirect

- **Epic**: App shell, navigation, auth, roles, session states
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the expired session redirect customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: expired session redirect
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for expired session redirect.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-030: Customer: role-aware route guard

- **Epic**: App shell, navigation, auth, roles, session states
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the role-aware route guard customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: role-aware route guard
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for role-aware route guard.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-031: Customer: account switch state

- **Epic**: App shell, navigation, auth, roles, session states
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the account switch state customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: account switch state
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for account switch state.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-032: Customer: logout flow

- **Epic**: App shell, navigation, auth, roles, session states
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the logout flow customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: logout flow
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for logout flow.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-033: Customer: protected route loading

- **Epic**: App shell, navigation, auth, roles, session states
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the protected route loading customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: protected route loading
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for protected route loading.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-034: Customer: auth error state

- **Epic**: App shell, navigation, auth, roles, session states
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the auth error state customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: auth error state
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for auth error state.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-035: Customer: session smoke tests

- **Epic**: App shell, navigation, auth, roles, session states
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the session smoke tests customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: session smoke tests
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for session smoke tests.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-036: Customer: home hero

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the home hero customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: home hero
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for home hero.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-037: Customer: home trust band

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the home trust band customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: home trust band
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for home trust band.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-038: Customer: city overview Bangkok

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the city overview Bangkok customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: city overview Bangkok
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for city overview Bangkok.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-039: Customer: city overview Phuket

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the city overview Phuket customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: city overview Phuket
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for city overview Phuket.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-040: Customer: city overview Koh Samui

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the city overview Koh Samui customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: city overview Koh Samui
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for city overview Koh Samui.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-041: Customer: city overview Koh Phangan

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the city overview Koh Phangan customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: city overview Koh Phangan
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for city overview Koh Phangan.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-042: Customer: nightlife experience page

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the nightlife experience page customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: nightlife experience page
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for nightlife experience page.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-043: Customer: island explorer experience page

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the island explorer experience page customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: island explorer experience page
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for island explorer experience page.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-044: Customer: Muay Thai night page

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the Muay Thai night page customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: Muay Thai night page
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for Muay Thai night page.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-045: Customer: private dining placeholder

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the private dining placeholder customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: private dining placeholder
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for private dining placeholder.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-046: Customer: local guidance page

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the local guidance page customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: local guidance page
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for local guidance page.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-047: Customer: safety message band

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the safety message band customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: safety message band
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for safety message band.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-048: Customer: companion CTA band

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the companion CTA band customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: companion CTA band
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for companion CTA band.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-049: Customer: traveller CTA band

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the traveller CTA band customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: traveller CTA band
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for traveller CTA band.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-050: Customer: home mobile composition

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the home mobile composition customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: home mobile composition
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for home mobile composition.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-051: Customer: home tablet composition

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the home tablet composition customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: home tablet composition
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for home tablet composition.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-052: Customer: home desktop composition

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the home desktop composition customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: home desktop composition
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for home desktop composition.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-053: Customer: public API home endpoint

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the public API home endpoint customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: public API home endpoint
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for public API home endpoint.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-054: Customer: public empty/fallback states

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the public empty/fallback states customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: public empty/fallback states
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for public empty/fallback states.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-055: Customer: public visual QA

- **Epic**: Home, city pages, experience surfaces, trust/safety messaging
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the public visual QA customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: public visual QA
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for public visual QA.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-056: Customer: discovery API contract

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the discovery API contract customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: discovery API contract
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for discovery API contract.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-057: Customer: discovery filter model

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the discovery filter model customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: discovery filter model
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for discovery filter model.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-058: Customer: city filter control

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the city filter control customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: city filter control
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for city filter control.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-059: Customer: experience filter control

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the experience filter control customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: experience filter control
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for experience filter control.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-060: Customer: availability filter control

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the availability filter control customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: availability filter control
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for availability filter control.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-061: Customer: verified filter control

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the verified filter control customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: verified filter control
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for verified filter control.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-062: Customer: discovery result card

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the discovery result card customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: discovery result card
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for discovery result card.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-063: Customer: discovery empty state

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P1
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the discovery empty state customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: discovery empty state
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for discovery empty state.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-064: Customer: discovery loading skeleton

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the discovery loading skeleton customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: discovery loading skeleton
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for discovery loading skeleton.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-065: Customer: discovery error state

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the discovery error state customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: discovery error state
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for discovery error state.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-066: Customer: profile route contract

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the profile route contract customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: profile route contract
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for profile route contract.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-067: Customer: profile hero section

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the profile hero section customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: profile hero section
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for profile hero section.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-068: Customer: profile verification panel

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the profile verification panel customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: profile verification panel
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for profile verification panel.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-069: Customer: profile availability panel

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the profile availability panel customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: profile availability panel
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for profile availability panel.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-070: Customer: profile experience fit panel

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the profile experience fit panel customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: profile experience fit panel
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for profile experience fit panel.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-071: Customer: profile safety note

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the profile safety note customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: profile safety note
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for profile safety note.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-072: Customer: profile unavailable state

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the profile unavailable state customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: profile unavailable state
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for profile unavailable state.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-073: Customer: profile mobile layout

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the profile mobile layout customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: profile mobile layout
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for profile mobile layout.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-074: Customer: profile tablet layout

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the profile tablet layout customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: profile tablet layout
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for profile tablet layout.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-075: Customer: profile desktop layout

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the profile desktop layout customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: profile desktop layout
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for profile desktop layout.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-076: Customer: inquiry form contract

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the inquiry form contract customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: inquiry form contract
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for inquiry form contract.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Stripe Payment Note

- Stripe is the named payment service for inquiry payment rails; this issue must define the compliance-hold path before live checkout creation.
- Reference docs/payments/stripe.md and specs/001-tirakplus-customer-app/contracts/api-contract.md.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-077: Customer: inquiry form fields

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the inquiry form fields customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: inquiry form fields
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for inquiry form fields.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Stripe Payment Note

- Any payment-related inquiry field must describe review/payment intent without collecting card data or implying instant paid access.
- Stripe Checkout or approved Stripe elements are the only allowed payment collection surfaces after approval.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-078: Customer: inquiry validation errors

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the inquiry validation errors customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: inquiry validation errors
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for inquiry validation errors.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Stripe Payment Note

- Include `PAYMENT_PROVIDER_NOT_APPROVED`, Stripe validation failure, duplicate request, and webhook-delay error states.
- Error copy must stay private, non-alarming, and non-leaking.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-079: Customer: inquiry loading state

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the inquiry loading state customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: inquiry loading state
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for inquiry loading state.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Stripe Payment Note

- Loading states must cover Stripe checkout-session creation and compliance-review checks without fake urgency.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-080: Customer: inquiry success state

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the inquiry success state customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: inquiry success state
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for inquiry success state.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Stripe Payment Note

- Success states must distinguish inquiry submitted, payment review pending, checkout created, and payment confirmed states.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-081: Customer: inquiry unavailable state

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the inquiry unavailable state customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: inquiry unavailable state
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for inquiry unavailable state.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-082: Customer: inquiry list endpoint

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the inquiry list endpoint customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: inquiry list endpoint
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for inquiry list endpoint.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Stripe Payment Note

- Inquiry list responses must expose payment status only through `PaymentRecord` summary fields from the API contract.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-083: Customer: inquiry detail screen

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the inquiry detail screen customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: inquiry detail screen
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for inquiry detail screen.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Stripe Payment Note

- Inquiry detail must show Stripe payment/compliance state without raw card data or pressure-copy.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-084: Customer: traveller privacy copy

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the traveller privacy copy customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: traveller privacy copy
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for traveller privacy copy.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-085: Customer: traveller flow smoke test

- **Epic**: Traveller discovery, profile browsing, inquiry flow
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the traveller flow smoke test customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: traveller flow smoke test
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for traveller flow smoke test.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-086: Customer: companion onboarding contract

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the companion onboarding contract customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: companion onboarding contract
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for companion onboarding contract.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-087: Customer: companion welcome screen

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the companion welcome screen customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: companion welcome screen
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for companion welcome screen.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-088: Customer: profile basics step

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the profile basics step customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: profile basics step
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for profile basics step.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-089: Customer: profile bio step

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the profile bio step customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: profile bio step
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for profile bio step.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-090: Customer: city and experience step

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the city and experience step customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: city and experience step
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for city and experience step.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-091: Customer: visibility settings step

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the visibility settings step customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: visibility settings step
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for visibility settings step.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-092: Customer: verification explanation step

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the verification explanation step customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: verification explanation step
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for verification explanation step.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-093: Customer: verification submit step

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the verification submit step customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: verification submit step
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for verification submit step.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-094: Customer: onboarding progress state

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the onboarding progress state customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: onboarding progress state
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for onboarding progress state.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-095: Customer: onboarding resume state

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the onboarding resume state customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: onboarding resume state
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for onboarding resume state.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-096: Customer: onboarding mobile layout

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the onboarding mobile layout customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: onboarding mobile layout
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for onboarding mobile layout.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-097: Customer: onboarding tablet layout

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the onboarding tablet layout customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: onboarding tablet layout
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for onboarding tablet layout.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-098: Customer: onboarding desktop layout

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the onboarding desktop layout customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: onboarding desktop layout
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for onboarding desktop layout.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-099: Customer: companion dashboard shell

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the companion dashboard shell customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: companion dashboard shell
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for companion dashboard shell.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-100: Customer: profile draft editor

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the profile draft editor customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: profile draft editor
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for profile draft editor.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-101: Customer: profile preview safe view

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the profile preview safe view customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: profile preview safe view
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for profile preview safe view.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-102: Customer: visibility control panel

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the visibility control panel customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: visibility control panel
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for visibility control panel.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-103: Customer: availability contract

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the availability contract customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: availability contract
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for availability contract.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-104: Customer: availability calendar list

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the availability calendar list customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: availability calendar list
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for availability calendar list.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-105: Customer: availability city selector

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the availability city selector customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: availability city selector
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for availability city selector.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-106: Customer: availability hidden state

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the availability hidden state customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: availability hidden state
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for availability hidden state.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-107: Customer: availability save flow

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the availability save flow customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: availability save flow
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for availability save flow.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-108: Customer: verification pending state

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the verification pending state customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: verification pending state
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for verification pending state.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-109: Customer: changes requested state

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the changes requested state customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: changes requested state
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for changes requested state.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-110: Customer: approved profile state

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the approved profile state customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: approved profile state
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for approved profile state.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-111: Customer: rejected profile state

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the rejected profile state customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: rejected profile state
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for rejected profile state.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-112: Customer: companion inquiry list

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P2
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the companion inquiry list customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: companion inquiry list
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for companion inquiry list.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-113: Customer: companion account settings

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the companion account settings customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: companion account settings
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for companion account settings.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-114: Customer: companion safety guidance

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the companion safety guidance customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: companion safety guidance
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for companion safety guidance.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-115: Customer: companion flow smoke test

- **Epic**: Companion registration, profile management, availability
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: UI/app implementation agent
- **Track**: Customer app

### Objective

Define and prepare the companion flow smoke test customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: companion flow smoke test
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for companion flow smoke test.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-116: Customer: API route registry

- **Epic**: API contracts, stub-data rails, data model, Cloudflare monolith boundaries
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the API route registry customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: API route registry
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for API route registry.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Stripe Payment Note

- API route registry must include Stripe customer payment endpoints and the Stripe webhook endpoint from docs/payments/stripe.md.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-117: Customer: staged data provider contract

- **Epic**: API contracts, stub-data rails, data model, Cloudflare monolith boundaries
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the staged data provider contract customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: staged data provider contract
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for staged data provider contract.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Stripe Payment Note

- Staged provider contract must simulate Stripe states through API rails without creating live charges.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-118: Customer: data model schema draft

- **Epic**: API contracts, stub-data rails, data model, Cloudflare monolith boundaries
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the data model schema draft customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: data model schema draft
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for data model schema draft.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-119: Customer: error response shape

- **Epic**: API contracts, stub-data rails, data model, Cloudflare monolith boundaries
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the error response shape customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: error response shape
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for error response shape.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-120: Customer: request ID propagation

- **Epic**: API contracts, stub-data rails, data model, Cloudflare monolith boundaries
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the request ID propagation customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: request ID propagation
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for request ID propagation.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-121: Customer: Cloudflare worker boundary

- **Epic**: API contracts, stub-data rails, data model, Cloudflare monolith boundaries
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the Cloudflare worker boundary customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: Cloudflare worker boundary
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for Cloudflare worker boundary.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-122: Customer: D1 persistence decision record

- **Epic**: API contracts, stub-data rails, data model, Cloudflare monolith boundaries
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the D1 persistence decision record customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: D1 persistence decision record
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for D1 persistence decision record.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-123: Customer: R2 media reference contract

- **Epic**: API contracts, stub-data rails, data model, Cloudflare monolith boundaries
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the R2 media reference contract customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: R2 media reference contract
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for R2 media reference contract.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-124: Customer: KV config boundary

- **Epic**: API contracts, stub-data rails, data model, Cloudflare monolith boundaries
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the KV config boundary customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: KV config boundary
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for KV config boundary.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-125: Customer: public endpoint handlers

- **Epic**: API contracts, stub-data rails, data model, Cloudflare monolith boundaries
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the public endpoint handlers customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: public endpoint handlers
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for public endpoint handlers.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-126: Customer: traveller endpoint handlers

- **Epic**: API contracts, stub-data rails, data model, Cloudflare monolith boundaries
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the traveller endpoint handlers customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: traveller endpoint handlers
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for traveller endpoint handlers.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-127: Customer: companion endpoint handlers

- **Epic**: API contracts, stub-data rails, data model, Cloudflare monolith boundaries
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the companion endpoint handlers customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: companion endpoint handlers
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for companion endpoint handlers.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-128: Customer: safety endpoint handlers

- **Epic**: API contracts, stub-data rails, data model, Cloudflare monolith boundaries
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the safety endpoint handlers customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: safety endpoint handlers
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for safety endpoint handlers.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-129: Customer: account endpoint handlers

- **Epic**: API contracts, stub-data rails, data model, Cloudflare monolith boundaries
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the account endpoint handlers customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: account endpoint handlers
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for account endpoint handlers.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-130: Customer: contract test harness

- **Epic**: API contracts, stub-data rails, data model, Cloudflare monolith boundaries
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Cloud/backend agent
- **Track**: Customer app

### Objective

Define and prepare the contract test harness customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: contract test harness
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for contract test harness.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Stripe Payment Note

- Contract tests must cover Stripe checkout-session compliance hold, webhook signature verification, duplicate webhook idempotency, and payment state transitions.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-131: Customer: keyboard navigation customer

- **Epic**: Accessibility, visual QA, security/privacy checks, smoke tests
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Validation agent
- **Track**: Customer app

### Objective

Define and prepare the keyboard navigation customer customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: keyboard navigation customer
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for keyboard navigation customer.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-132: Customer: screen reader labels customer

- **Epic**: Accessibility, visual QA, security/privacy checks, smoke tests
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Validation agent
- **Track**: Customer app

### Objective

Define and prepare the screen reader labels customer customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: screen reader labels customer
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for screen reader labels customer.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-133: Customer: color contrast audit

- **Epic**: Accessibility, visual QA, security/privacy checks, smoke tests
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Validation agent
- **Track**: Customer app

### Objective

Define and prepare the color contrast audit customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: color contrast audit
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for color contrast audit.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-134: Customer: mobile no-overflow audit

- **Epic**: Accessibility, visual QA, security/privacy checks, smoke tests
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Validation agent
- **Track**: Customer app

### Objective

Define and prepare the mobile no-overflow audit customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: mobile no-overflow audit
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for mobile no-overflow audit.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-135: Customer: tablet visual QA

- **Epic**: Accessibility, visual QA, security/privacy checks, smoke tests
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Validation agent
- **Track**: Customer app

### Objective

Define and prepare the tablet visual QA customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: tablet visual QA
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for tablet visual QA.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-136: Customer: desktop visual QA

- **Epic**: Accessibility, visual QA, security/privacy checks, smoke tests
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Validation agent
- **Track**: Customer app

### Objective

Define and prepare the desktop visual QA customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: desktop visual QA
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for desktop visual QA.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-137: Customer: privacy copy review

- **Epic**: Accessibility, visual QA, security/privacy checks, smoke tests
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Validation agent
- **Track**: Customer app

### Objective

Define and prepare the privacy copy review customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: privacy copy review
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for privacy copy review.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-138: Customer: security session review

- **Epic**: Accessibility, visual QA, security/privacy checks, smoke tests
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Validation agent
- **Track**: Customer app

### Objective

Define and prepare the security session review customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: security session review
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for security session review.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-139: Customer: anti-pattern audit customer

- **Epic**: Accessibility, visual QA, security/privacy checks, smoke tests
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Validation agent
- **Track**: Customer app

### Objective

Define and prepare the anti-pattern audit customer customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: anti-pattern audit customer
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for anti-pattern audit customer.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
## TP-CUST-140: Customer: customer quickstart smoke test

- **Epic**: Accessibility, visual QA, security/privacy checks, smoke tests
- **Spec link**: specs/001-tirakplus-customer-app/spec.md
- **Plan link**: specs/001-tirakplus-customer-app/plan.md
- **Priority**: P3
- **Owner type**: Validation agent
- **Track**: Customer app

### Objective

Define and prepare the customer quickstart smoke test customer capability so travellers or companions can use Tirak without cheap dating-app patterns or hardcoded UI data.

### User / Operator Value

Users get a discreet, premium, respectful flow that feels like private travel concierge software rather than a dating marketplace.

### Design Surface / Component

- Surface: Customer product surface
- Component/workflow: customer quickstart smoke test
- Design references: DESIGN.md, docs/design/component-system.md, docs/design/responsive-view-matrix.md, specs/001-tirakplus-customer-app/contracts/ui-contract.md

### Implementation Scope

- Create or update the planned component, route, contract, copy, and state definitions for customer quickstart smoke test.
- Use API-shaped staged data through specs/001-tirakplus-customer-app/contracts/api-contract.md wherever data is needed.
- Preserve Tirak's private concierge tone and the interlinked logo/icon visual language where brand marks are involved.
- Do not introduce production app code in this planning issue unless implementation has started from the relevant spec-kit task.

### Responsive Requirements

- Mobile 390x844: single column, bottom-safe actions, 44px minimum touch targets, no horizontal overflow.
- Tablet 768x1024: two-column where useful, persistent contextual panels only when content remains readable.
- Desktop 1280x800: asymmetric editorial layout, constrained content width, full nav, side panels for filters/review.
- Wide desktop 1440x900: max-width locked near 1400px, gutters absorb excess width, no over-stretched cards.

### API/Data Contract References

- Primary API reference: specs/001-tirakplus-customer-app/contracts/api-contract.md
- UI contract reference: specs/001-tirakplus-customer-app/contracts/ui-contract.md
- Data model reference: specs/001-tirakplus-customer-app/data-model.md

### Dependencies and Blocking Relationships

Depends on prior contract/design alignment and related preceding tasks where sequencing applies.

### Acceptance Criteria

- The planned surface has a clear default, loading, empty, error, and permission/unavailable state where relevant.
- All visible copy uses Tirak-approved respectful terminology and avoids banned dating-app vocabulary.
- Any staged data required by the issue is represented by an API route or contract, not by component-local mock arrays.
- Mobile, tablet, desktop, and wide desktop behavior is specified or validated for this issue.
- The issue can be independently reviewed against the linked spec and plan without asking for missing context.

### Verification Evidence Required

- Responsive screenshot/contract proof plus anti-pattern checklist evidence.
- Checklist result showing no unresolved clarification markers for this issue's linked artifacts.
- Visual/design audit result against DESIGN.md and tasks/tirak-premium-anti-patterns.md.
- API contract reference or explicit note that no data contract is required.

### Anti-Pattern Checklist

- [ ] No cheap dating-directory energy.
- [ ] No objectifying language such as Thai girls, babes, hot locals, hookup, or sexy near me.
- [ ] No red-light, neon nightlife flyer, or bikini-led hero treatment.
- [ ] No swipe-first meat-market UX, star ratings for people, or fake online urgency.
- [ ] No hardcoded mock data in UI components; staged data must come through API-shaped rails.
