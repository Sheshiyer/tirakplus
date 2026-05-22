# UI Repair Contract

Phase 1 source of truth for GitHub issues `UIR-001` through `UIR-011`.

## Status

- Current product-design match: `5/10`.
- Target product-design match after this repair milestone: `8/10` or better.
- Existing Visual Reference QA target remains `4/5` or better for primary repaired routes.
- This document freezes the Phase 1 contract. Later phases may refine implementation, but they must not silently change the contracts below.

## Reference Inventory

Primary responsive reference boards:

| Route or surface | Reference | Role |
|---|---|---|
| Muse entry, onboarding, chat | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/muse-character-splash-responsive-board.png` | Binding scene, composition, close Muse treatment, secure-channel module, chat-first layout |
| Muse planning shell | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/muse-landing-responsive-board.png` | Secondary prompt-card, trust rail, and responsive web density reference |
| Traveller discovery | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/traveller-discovery-responsive-board.png` | Binding discovery grid, filters, mobile sheet, and desktop side-rail reference |
| Companion profile | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/companion-profile-responsive-board.png` | Binding profile detail, trust, availability, and inquiry CTA reference |
| Inquiry flow | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/inquiry-flow-responsive-board.png` | Binding private inquiry, plan context, message, date/time, and privacy status reference |
| Settings/privacy | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/settings-privacy-responsive-board.png` | Binding light account/privacy system reference |
| Safety | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/safety-center-responsive-board.png` | Safety-center structure and disclosure density reference |
| Age/auth | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/age-consent-auth-responsive-board.png` | Auth and consent hierarchy reference |

Mobile app treatment references:

| Surface | Reference | Role |
|---|---|---|
| Home/mobile app tone | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/screen-concepts/gpt-image-2-dark-pass/home-dark.png` | Dark immersive app tone, bottom nav, glass panels, rose action |
| Discovery/mobile | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/screen-concepts/gpt-image-2-dark-pass/traveller-discovery-dark.png` | Compact header, chips, profile cards, bottom filter sheet |
| Companion profile/mobile | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/screen-concepts/gpt-image-2-dark-pass/companion-profile-dark.png` | Close intentional portrait crop, profile panel hierarchy |
| Inquiry/mobile | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/screen-concepts/gpt-image-2-dark-pass/inquiry-flow-dark.png` | Private inquiry controls, calendar, privacy state, primary CTA |

Reference-only constraints:

- Do not crop full UI boards, viewport labels, generated text, phone chrome, cards, or mock controls into production.
- Do not ship generated people from mood boards as final profile media without separate source, consent, moderation, and brand review.
- Quarantined or superseded folders under `generated/web-reference-boards/gpt-image-2/_*` are not active references.
- The failed full-body Muse poster/card framing is rejected for mobile and tablet app surfaces.

## Two-Layer Product Contract

Tirak Plus has two coordinated UI layers.

1. **Traditional app layer**
   - Owns routing, navigation, cards, forms, account, plans, inbox, safety, profile, inquiry, payment, loading, empty, and error states.
   - Must remain usable when Muse, RAG, or animated assets are paused.
   - Consumes data through API-shaped service rails, not component-local mock fixtures.

2. **Muse layer**
   - Owns onboarding, guided interpretation, contextual interaction, RAG chat, floating trigger, close Muse visual atmosphere, and route handoff.
   - May personalize and prefill context, but must not replace normal app controls.
   - Must degrade to concise fallback copy while preserving normal app actions.

Blocking rule: Muse can guide the user to a card/form route, but it cannot be the only way to complete a traveller or companion workflow.

## Route Ownership Matrix

| Route | Traditional app layer | Muse layer | Primary references | Phase 2/3 owner |
|---|---|---|---|---|
| `/` | Public shell, chat input fallback, legal nav | Primary Muse scene, onboarding, secure-channel module, RAG chat | Muse character splash board, Muse landing board | `UIR-023` |
| `/overview` | Public business overview and route links | Light brand support only | Home dark-pass tone, public web references | Existing public work, QA only |
| `/discovery` | Public discovery explanation | Entry CTA to Muse/protected discovery | Discovery boards | Existing public work, QA only |
| `/auth/login`, `/auth/verify` | Auth, consent, role entry | Optional Muse brand support | Age/auth board | Existing auth work, QA only |
| `/traveller/dashboard` | Route board, next actions, active inquiry, plan summary | Compact contextual Muse support | Home dark-pass, companion-profile close crop, route-board concept | `UIR-012` |
| `/traveller/discovery` | Filters, profile cards, bottom sheet, saved state | Context handoff and suggested filters | Traveller discovery board, discovery dark-pass | `UIR-013`, `UIR-030` |
| `/traveller/companions/:id` | Profile detail, verification, privacy, inquiry CTA | Optional profile-read support | Companion profile board, companion-profile dark-pass | `UIR-014`, `UIR-040` |
| `/traveller/companions/:id/inquire` | Inquiry form, message, date/time, privacy, payment gate | Suggested message/boundary help | Inquiry board, inquiry dark-pass | `UIR-015` |
| `/traveller/inbox`, `/traveller/inbox/:id` | Thread list/detail, status, next action | Optional reply help | Inquiry board, protected app tone | `UIR-017` |
| `/traveller/plans`, `/traveller/plans/:id` | Plan/session cards, readiness, payment and calendar-safe CTAs | Optional plan review context | Protected app tone, inquiry board | `UIR-016` |
| `/traveller/safety` | Safety, support, disclosures, privacy, automation explanation | Entry back to Muse only if useful | Safety board | `UIR-018` |
| `/traveller/account` | Account and privacy controls | No primary Muse role | Settings/privacy board | `UIR-019` |
| `/companion/dashboard` | Review state, inquiries, availability, profile readiness | Optional profile/rhythm support | Protected app tone | `UIR-020` |
| `/companion/onboarding` | Profile setup, visibility, verification, availability | Muse-assisted profile drafting | Companion assist and onboarding concepts | `UIR-020`, `UIR-024` |
| `/companion/profile` | Profile manager, review state, public/private split | Optional tone review | Companion profile board | `UIR-020` |
| `/companion/inbox`, `/companion/inbox/:id` | Inquiry decision workflow | Optional reply help | Inquiry board | `UIR-020` |
| `/companion/plans` | Availability planning | Optional context only | Protected app tone | `UIR-020` |
| `/companion/safety` | Companion safety and boundaries | Entry back to Muse only if useful | Safety board | `UIR-020` |
| `/companion/account` | Account and privacy controls | No primary Muse role | Settings/privacy board | `UIR-019` |

## Responsive And Crop Rules

- Mobile `390x844`: use close, scene-integrated imagery. Do not place a distant full-body character in a narrow poster card.
- Tablet `768x1024`: compose separately. Do not scale a mobile crop or desktop crop without a tablet-specific object position.
- Desktop `1280x800`: use intentional split composition, stable panels, and readable chat/forms.
- Wide `1440x900`: add breathing room and scene depth without making cards float as decorative islands.
- Fixed-format surfaces must declare stable dimensions using grid tracks, aspect ratio, or min/max sizing.
- Image assets must use `object-fit: cover` only when intentional close crop is documented; use `contain` for standalone transparent assets.
- Head, face, and primary CTA areas must never be clipped by nav, cards, bottom bars, or floating Muse.
- Text must not overlap images or preceding/subsequent controls at any required breakpoint.

## Information Architecture Target

Traveller navigation:

- Board: route board and immediate next actions.
- Discovery: reviewed profiles and filters.
- Plans: upcoming and historical plan/session state.
- Inbox: inquiry/message state.
- Safety: safety, privacy, support, disclosure, and boundaries.
- Account: privacy/account settings, accessible from shell/account links.

Companion navigation:

- Board: review state, inquiries, visibility, and profile readiness.
- Profile: public/private profile management.
- Plans: availability and scheduling context.
- Inbox: inquiry review and response.
- Safety: boundaries, support, reporting, privacy.
- Account: account/privacy settings.

Floating Muse:

- Present on protected app routes except the primary Muse entry.
- Must not occlude bottom nav, primary CTAs, or form controls.
- Opens the Muse interaction layer with route context.

## Copy Hygiene Rules

Visible app copy may say:

- Muse, private, discreet, route, plan, inquiry, verified, reviewed, safety, privacy, boundary, companion, traveller, profile, availability, payment review, support.

Visible app copy must not say:

- RAG, vector, prompt, model, system prompt, retrieval, staged fixture, mock, hardcoded, generated board, issue, task, swarm, implementation, AI concierge.

Required disclosure placement:

- Safety route: automation assistance, privacy, boundaries, support, reporting, verification limits.
- Payment surfaces: compliance hold, test-mode state, checkout availability, review state.
- Docs: implementation details, RAG internals, provider compliance details, issue workflow.

## API-Shaped Data Boundary

- UI components consume data from `src/app/api/*`, shared contracts, or route props already supplied by service calls.
- Worker handlers own staged fixtures in `src/worker/staged-data.ts` and provider boundaries.
- New UI work must not introduce component-local profile, inquiry, payment, or session mock arrays.
- If a route needs new state, add or extend a shared contract first, then expose it through the Worker/provider boundary.
- Staged Tirak Plus demo/private data remains allowed when intentionally routed through API-shaped rails.

## Payment, Safety, And Privacy Rules

- Stripe test mode stays behind server-side `PAYMENT_PROVIDER_MODE=stripe_test` and environment secrets.
- React must never receive or store Stripe secret keys.
- Production live payment behavior remains blocked behind the documented compliance gate.
- Payment UI may show a hosted checkout action only when the API returns a session URL.
- Safety owns policy-heavy content. Other routes should link to Safety rather than duplicating policy blocks.
- Privacy copy must be visible before conversion pressure, but it must remain concise and route-specific.

## Phase 1 Baseline Ratings

Current ratings before Phase 2 implementation:

| Surface | Rating | Main reason |
|---|---:|---|
| Overall product design match | 5/10 | Stronger data/payment/safety rails exist, but visual hierarchy still drifts from references |
| Traditional app layer | 6.5/10 | Usable route/card foundation exists, but protected routes need app-like hierarchy and copy cleanup |
| Muse layer | 4/10 | Muse concept exists, but current placement/crop/interaction does not yet match the reference-led close scene |
| Flow coherence | 5.5/10 | Normal app and Muse layer coexist, but handoff boundaries are not explicit enough yet |

## Worker Checklist

Every downstream UI repair issue must confirm:

- Reference board or mobile concept used.
- Traditional app layer responsibility preserved.
- Muse layer role identified, or explicitly absent.
- No full-board crop, phone chrome, board label, or generated UI text shipped.
- No new component-local mock data introduced.
- Required breakpoints checked: `390x844`, `768x1024`, `1280x800`, `1440x900` when visible.
- Visual Reference QA score recorded.
- `npm run check` run when code changes are made.
- `npm run copy:audit` run when visible copy changes are made.

## Phase 1 Unlock

Phase 2 may start after:

- This document is merged or accepted as the contract.
- Baseline screenshot evidence exists.
- GitHub issues `UIR-001` through `UIR-011` are closed with evidence comments.

Parallelization after Phase 1:

- `UIR-012` through `UIR-021` can run in parallel if shared shell/style lock zones are serialized.
- `UIR-023` can start in parallel with Phase 2 after the Muse/app boundary remains unchanged.
- Asset generation issues `UIR-036` through `UIR-038` must wait for `UIR-035`; no new Muse character generation should happen before the asset strategy is accepted.
