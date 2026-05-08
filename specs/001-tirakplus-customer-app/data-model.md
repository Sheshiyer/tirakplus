
# Data Model: Tirak Plus Customer App

## Shared Entity Principles

- All staged data must be delivered through API-shaped contracts.
- Every entity with public display impact must carry status and visibility fields.
- Sensitive fields must be separated from public profile fields.
- Moderation and verification states must be explicit, not inferred from missing data.

## Entities

### User

- id, emailOrContact, role, status, sessionState, createdAt, updatedAt.
- Roles: traveller, companion.
- States: anonymous, pending_auth, active, restricted, suspended.

### TravellerProfile

- id, userId, displayName, cityInterest, experienceInterest, privacySettings, inquiryPreferences.
- Relationships: creates Inquiry, views CompanionProfile.

### CompanionProfile

- id, userId, displayName, publicBio, privateReviewFields, city, experienceTags, visibilityState, verificationState, reviewStatus, availabilitySummary.
- States: draft, pending_verification, changes_requested, approved, hidden, suspended.

### Experience

- id, slug, city, category, title, description, safetyNotes, heroAssetReference.
- Categories: nightlife, island_explorer, muay_thai_night, private_dining, local_guidance.

### AvailabilityWindow

- id, companionProfileId, city, startsAt, endsAt, status, visibility.
- States: available, tentative, unavailable, hidden.

### Inquiry

- id, travellerProfileId, companionProfileId, experienceContext, message, status, createdAt, updatedAt.
- States: draft, submitted, under_review, payment_review, payment_pending, routed, accepted, declined, cancelled, escalated.

### PaymentRecord

- id, inquiryId, travellerProfileId, provider, providerCheckoutSessionId, providerPaymentIntentId, amount, currency, status, complianceState, idempotencyKey, createdAt, updatedAt.
- Provider: stripe.
- States: disabled_for_compliance, draft, checkout_created, requires_action, processing, succeeded, failed, cancelled, refunded, disputed.
- Validation: live Stripe payment creation is blocked unless complianceState is stripe_approved for the exact product, jurisdiction, and account configuration.

### StripeWebhookEvent

- id, stripeEventId, eventType, paymentRecordId, signatureVerified, processingStatus, requestId, receivedAt, processedAt.
- States: received, processed, duplicate, failed, ignored.
- Validation: webhook processing must be idempotent and must not trust unverified payloads.

### SafetyReport

- id, reporterUserId, targetType, targetId, reasonCategory, summary, status, createdAt.
- States: submitted, triaged, investigating, resolved, escalated.
