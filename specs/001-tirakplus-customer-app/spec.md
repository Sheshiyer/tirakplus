
# Feature Specification: Tirak Plus Customer App

**Feature Branch**: `001-tirakplus-customer-app`  
**Created**: 2026-05-08  
**Status**: Draft  
**Input**: Build the Tirak Plus customer app for home, traveller discovery, companion flow, profiles, auth, safety, inquiry flow, and responsive product UI.

## User Scenarios & Testing

### User Story 1 - Understand the Tirak Promise (Priority: P1)

A traveller lands on Tirak Plus and immediately understands that the product is a discreet, premium Thailand companion concierge, not a cheap dating directory.

**Why this priority**: This establishes trust and prevents brand drift before any conversion flow.

**Independent Test**: Open the home page at mobile, tablet, desktop, and wide desktop sizes and confirm the first viewport communicates Tirak's promise, target geography, trust posture, and primary entry paths without banned dating-app language or visuals.

**Acceptance Scenarios**:

1. Given a first-time visitor, when they view the home page, then they see the Tirak mark, discreet positioning, Thailand context, and traveller/companion entry points.
2. Given a mobile visitor, when they scroll the first two sections, then all text remains readable, no content overflows horizontally, and the primary CTA stays clear without sticky pressure.

### User Story 2 - Discover Companions and Experiences (Priority: P1)

A traveller can explore companions and Thailand experiences through city, mood, safety, availability, and itinerary context.

**Why this priority**: Traveller discovery is the main value loop and must avoid browse-volume or objectifying marketplace behavior.

**Independent Test**: Use API-backed staged data to open discovery, filter by city and experience, inspect a companion preview, and continue to profile without any hardcoded UI data.

**Acceptance Scenarios**:

1. Given staged API data, when a traveller filters Bangkok nightlife and Muay Thai night, then the UI updates from the API response and shows verification and availability context.
2. Given no matching results, when filters return empty, then the UI shows a composed empty state with alternatives rather than fake inventory.

### User Story 3 - Review a Companion Profile Respectfully (Priority: P1)

A traveller can review a companion profile as a consent-aware, verified adult profile with context, availability, and safety signals.

**Why this priority**: Profiles are the highest-risk brand surface for objectification and must establish product ethics.

**Independent Test**: Open a profile at all breakpoints and confirm it shows verification, availability, location context, interests, introduction rules, and inquiry action without star ratings, hot/not mechanics, or fake online urgency.

**Acceptance Scenarios**:

1. Given a verified profile, when a traveller opens it, then the UI shows profile context, verification status, visibility boundaries, and inquiry CTA.
2. Given a profile under review, when a traveller opens it from a stale link, then the UI shows a safe unavailable state and no private fields.

### User Story 4 - Submit a Private Inquiry (Priority: P2)

A traveller can request an introduction or plan through a discreet inquiry flow that explains privacy and next steps.

**Why this priority**: Inquiry flow converts value while preserving discretion and operational safety.

**Independent Test**: Submit a staged inquiry through API rails and confirm form validation, loading, success, and error states.

**Acceptance Scenarios**:

1. Given a profile with availability, when a traveller submits an inquiry, then the API records the request and the UI explains review/response timing.
2. Given invalid or incomplete inputs, when a traveller submits, then inline errors appear under the relevant fields.
3. Given Stripe has not approved the exact Tirak business model and jurisdiction, when a traveller reaches a payment step, then the UI shows a non-payment review state and the API does not create a live Stripe charge.

### User Story 5 - Companion Registers and Controls Visibility (Priority: P2)

A companion can register, create a profile, set availability, understand verification, and control what is visible.

**Why this priority**: Companion agency is required for a serious adult companion product.

**Independent Test**: Complete staged companion onboarding using API endpoints and confirm every sensitive field has visibility, verification, and privacy context.

**Acceptance Scenarios**:

1. Given a new companion, when they complete onboarding, then profile status becomes pending verification and no public profile is shown until approved.
2. Given a companion changes availability, when the API succeeds, then traveller discovery uses the updated availability through API data.

### User Story 6 - Manage Account, Safety, and Session State (Priority: P3)

Travellers and companions can manage sessions, account settings, privacy, safety guidance, and recovery states.

**Why this priority**: Account and safety workflows preserve long-term trust after first conversion.

**Independent Test**: Navigate account/settings, safety center, auth states, and recovery paths with staged API responses.

**Acceptance Scenarios**:

1. Given an expired session, when a user opens a protected route, then the app routes to auth and preserves the intended destination.
2. Given a user opens safety center, when they review content, then the UI explains privacy, reporting, verification, and product boundaries clearly.

## Edge Cases

- API returns empty discovery results for a city or experience.
- Profile transitions from approved to under-review while a traveller has the page open.
- Inquiry submit succeeds but notification delivery is delayed.
- Companion exits onboarding midway and returns later.
- User opens protected routes with expired or missing session.
- Mobile keyboard covers critical form actions.
- Generated or uploaded imagery is unavailable, rejected, or pending moderation.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST provide responsive home, discovery, profile, onboarding, auth, inquiry, safety, and account/settings screens.
- **FR-002**: The system MUST support traveller and companion role-aware navigation and session states.
- **FR-003**: The system MUST deliver staged and production data through API-shaped contracts, not hardcoded UI arrays.
- **FR-004**: Traveller discovery MUST support city, experience, availability, verification, and safety context.
- **FR-005**: Companion profiles MUST show verification state, availability, introduction boundaries, and privacy-safe context.
- **FR-006**: Inquiry flows MUST include validation, loading, success, error, and unavailable states.
- **FR-007**: Companion onboarding MUST support profile basics, visibility preferences, verification status, availability, and review state.
- **FR-008**: Auth flows MUST support traveller and companion entry paths, session recovery, expired-session handling, and protected-route redirects.
- **FR-009**: Safety center MUST explain verification, reporting, privacy, and product boundaries in respectful non-alarmist language.
- **FR-010**: All screens MUST satisfy DESIGN.md anti-pattern rules and responsive behavior.
- **FR-011**: Payment rails MUST use Stripe as the named payment service through a PaymentProvider abstraction, with live payment creation disabled until Stripe approval and jurisdiction checks are complete.
- **FR-012**: Payment UI MUST use Stripe-hosted or Stripe-approved collection flows only; no Tirak UI component may collect raw card data.

### Key Entities

- **User**: Account identity with traveller, companion, or operator-adjacent role flags.
- **TravellerProfile**: Traveller preferences, city interests, inquiry history, and privacy settings.
- **CompanionProfile**: Public and private profile fields, verification status, visibility settings, availability, and review status.
- **Experience**: Bangkok nightlife, Phuket island exploring, Koh Samui luxury calm, Koh Phangan night energy, Muay Thai night, and related tags.
- **Inquiry**: Traveller request for introduction or plan, with status, timestamps, participant references, and audit-relevant changes.
- **PaymentRecord**: Stripe-backed payment or checkout state tied to an inquiry, service fee, or approved commercial product, with provider IDs, status, compliance state, and webhook audit references.
- **SafetyReport**: User-initiated report or concern tied to profile, inquiry, or account.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A first-time visitor can identify Tirak's discreet companion concierge positioning and choose traveller or companion path within 30 seconds.
- **SC-002**: All required customer screens render at 390x844, 768x1024, 1280x800, and 1440x900 without horizontal overflow.
- **SC-003**: No customer UI component contains hardcoded staged profile, city, inquiry, or availability data.
- **SC-004**: Discovery, profile, onboarding, and inquiry flows each have loading, empty, error, and success/unavailable states.
- **SC-005**: Visual QA finds no banned cheap dating-app patterns, objectifying copy, fake urgency, or star-rating/hot-not mechanics.

## Assumptions

- Initial implementation uses a Cloudflare monolith-oriented TypeScript architecture.
- Staged data can be deterministic, but it must be served through documented API routes.
- Profile imagery remains moderated and optional until verification rules are implemented.
- Current generated assets are references, not final shipped production media.
- Stripe is the intended payment provider, but launch requires Stripe approval for the exact business model and Thailand-related jurisdiction constraints before live payments are enabled.
