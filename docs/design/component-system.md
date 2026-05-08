
# Component System

## Shared Components

- AppLogo: Uses the interlinked Tirak mark. Source direction: /Users/sheshnarayaniyer/Downloads/tirakplus-app-icon-gpt-image-2.png.
- ButtonPrimary: Rose Bronze fill, Pearl text, 48px minimum height, physical pressed state, no glow.
- ButtonSecondary: Pearl fill, Charcoal Ink text, Veil Border, same dimensions as primary.
- FieldGroup: Label above input, helper text, input, error text, privacy note if sensitive.
- StatusPill: Neutral by default; Trust Green for verified/safe, Warning Clay for review, Risk Fig for admin risk only.
- EmptyState: Quiet heading, one explanatory paragraph, one next action. No desperate or salesy copy.
- LoadingSkeleton: Matches the target content shape. No circular generic spinners.
- ErrorNotice: Inline, recoverable, request ID where applicable.

## Customer Components

- PublicHero: Asymmetric, mark-led, no generic centered nightclub hero.
- CityExperienceTile: City/experience context with safety and local fluency, not sexual bait.
- DiscoveryFilterRail: City, experience, availability, verification; mobile collapses into bottom sheet.
- CompanionPreviewCard: Editorial profile preview with verification and availability context, no star ratings.
- CompanionProfileHeader: Profile identity, verification state, availability, visibility-safe imagery.
- InquiryForm: Private message, plan context, validation, privacy note, status states.
- StripePaymentReviewPanel: Shows payment review/compliance state for an inquiry without urgency copy or raw card data; live payment action appears only after Stripe approval.
- CompanionOnboardingStepper: Profile basics, city/experience, visibility, verification, availability.
- SafetyCenterPanel: Verification, reporting, privacy, boundaries, and support guidance.

## Admin Components

- AdminShell: Left rail desktop/tablet, drawer/bottom-safe navigation on mobile.
- QueueTable: Dense operational rows with status, severity, owner, updated time, and next action.
- CaseDetailPanel: Split-pane detail for verification/moderation/inquiry review.
- DecisionModal: Action, reason, confirmation, audit outcome.
- PermissionBanner: Clear explanation when an operator cannot take an action.
- PaymentStatusPanel: Stripe payment state, compliance state, webhook state, request ID, and allowed operator action.
- AuditEventRow: Actor, action, target, timestamp, reason, request ID.
- RiskFilterBar: Severity, status, entity type, assignment, date.

## Component Rules

- Cards are only for repeated objects, modals, and framed tools.
- Do not nest cards inside cards.
- No emojis as icons.
- No fake metrics or placeholder numbers.
- No generic names in profile examples.
- All data-driven components must accept API response shapes, not local mock arrays.
