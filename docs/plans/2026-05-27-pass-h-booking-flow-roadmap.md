# Pass H — End-to-End Booking Flow Roadmap

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement H1 next session. H2-H6 sections are intentionally outlines, not bite-sized — clarify scope at the start of each sub-pass session before invoking executing-plans.

**Goal:** Turn Tirak Plus from a profile-browser into a real concierge product. Build the spine: traveller sends inquiry → companion accepts/declines → date+time confirmed → Stripe hold → day-of itinerary → post-session review → review feeds back to companion profile.

**Architecture:** State-machine-backed booking record in KV, role-aware UI handoffs, Stripe checkout in test mode for v1, soft-delete and confirmation patterns reused from Pass E. Each sub-pass is one session, each handoff is one state transition.

**Tech Stack:** React 19, Vite, Cloudflare Workers (TS), KV namespaces, Stripe REST (test mode), Resend (transactional emails), pattern-matched against existing companion/account modules.

---

## 1. Substrate already in place

Pass H is mostly a STATE-AND-WIRING pass — much of the contract surface already exists as in-memory fixtures.

**Existing contracts (`src/shared/contracts.ts`):**
- `InquiryStatus` enum: `draft | submitted | under_review | payment_review | routed | accepted | declined | cancelled`
- `TravellerInquiryRequest`, `TravellerInquirySummary`, `TravellerInquiryDetail`, `TravellerInquiryListResponse`, `TravellerInquiryCreateResponse`
- `CompanionInquirySummary`, `CompanionSessionDetail`, `CompanionInquiryListResponse`
- `TravellerSessionSummary`, `TravellerSessionDetail` (carries itinerary, messageThread, paymentState)
- `PaymentProviderSummary`, `PaymentSessionResult` (Stripe test-mode flow)

**Existing endpoints (`src/worker/index.ts`):**
- `POST /api/traveller/inquiries` (line 348) — creates inquiry, returns fixture
- `GET  /api/traveller/inquiries` (line 370) — lists fixtures
- `GET  /api/traveller/inquiries/{id}` (line 380) — fixture detail
- `GET  /api/companion/inquiries` (line 420) — lists fixtures for companion
- `GET  /api/companion/inquiries/{id}` (line 430) — fixture detail
- `POST /api/payment/checkout` — Stripe checkout creation (currently gated on `PAYMENT_PROVIDER_MODE === "stripe_test"`)

**Existing fixtures (`src/worker/staged-data.ts`):**
- `travellerInquiries` array with timeline labels like "Inquiry received"
- `companionInquiries` array
- Per-profile `inquiryGuidance` copy
- Profile timeline + payment state fixtures

**Existing payment infrastructure (`src/worker/payment-provider.ts`):**
- `createPaymentSession(provider, context)` → Stripe checkout session via REST
- `compliance_hold` mode blocks payment by default
- `stripe_test` mode requires `sk_test_*` key

**What's missing:**
- KV-backed state for inquiries (today's data is reset on Worker restart)
- Companion accept/decline endpoints + state transitions
- Plan record (date+time picker, ICS export, calendar slot)
- Stripe wiring from "accepted plan" → "payment held" flow
- Day-of itinerary derivation from confirmed plan + companion data
- Post-session review submission + companion profile rating aggregation
- Real transitions between InquiryStatus values (today they're terminal labels on fixtures)

---

## 2. State machine — Booking lifecycle

```
[Traveller composes]
       │
       ▼
   ┌────────┐     submit
   │ DRAFT  │ ──────────────►  SUBMITTED
   └────────┘                       │
                                    │  Tirak review
                                    ▼
                              UNDER_REVIEW
                                    │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
        rejected               approved + routed       cancelled (traveller)
            │                      │
            ▼                      ▼
        DECLINED                 ROUTED  ───────►  CANCELLED (traveller withdraws)
                                    │
                       ┌────────────┼────────────┐
                       │            │            │
                     accept       decline    timeout
                       │            │            │
                       ▼            ▼            ▼
                   ACCEPTED      DECLINED    DECLINED (auto)
                       │
                       ▼
                 DATE_PENDING   ────────► (traveller picks 2-3 windows)
                       │
                       ▼
                 DATE_PROPOSED  ────────► (companion picks one)
                       │
                       ▼
                 DATE_CONFIRMED ────────► (Stripe hold prompt unlocks)
                       │
                       ▼
                 PAYMENT_HELD   ────────► (hold = $X authorized, not captured)
                       │
                       ▼
              SESSION_SCHEDULED  ──────► (waiting for session date)
                       │
                       ▼
              SESSION_LIVE       ──────► (day-of itinerary shown)
                       │
                       ▼
              SESSION_COMPLETED  ──────► (Stripe captures hold)
                       │
                       ▼
              REVIEW_PENDING     ──────► (traveller has 7 days to review)
                       │
                       ▼
              REVIEW_COMPLETED   ──────► (rating + comment posted)
```

**Extension required to `InquiryStatus` enum:**
```ts
export type InquiryStatus =
  | "draft" | "submitted" | "under_review"
  | "routed" | "accepted" | "declined" | "cancelled"
  | "date_pending" | "date_proposed" | "date_confirmed"
  | "payment_held" | "session_scheduled" | "session_live" | "session_completed"
  | "review_pending" | "review_completed";
// removed "payment_review" — replaced by explicit payment_held state
```

**State transition allowlist (server-enforced):**
| From | To | Actor | Endpoint |
|------|----|----|----|
| `(none)` | `submitted` | traveller | POST /api/traveller/inquiries |
| `submitted` | `under_review` | Tirak (auto) | (background) |
| `under_review` | `routed` | Tirak (auto) | (background) |
| `under_review` | `declined` | Tirak | (admin endpoint, out of Pass H scope) |
| `routed` | `accepted` | companion | POST /api/companion/inquiries/{id}/accept |
| `routed` | `declined` | companion | POST /api/companion/inquiries/{id}/decline |
| `submitted`/`routed` | `cancelled` | traveller | DELETE /api/traveller/inquiries/{id} |
| `accepted` | `date_pending` | traveller | POST /api/plans/{inquiryId}/windows |
| `date_pending` | `date_proposed` | companion | POST /api/plans/{inquiryId}/select-window |
| `date_proposed` | `date_confirmed` | traveller | POST /api/plans/{inquiryId}/confirm |
| `date_confirmed` | `payment_held` | traveller | POST /api/plans/{inquiryId}/checkout |
| `payment_held` | `session_scheduled` | system (Stripe webhook) | POST /api/webhooks/stripe |
| `session_scheduled` | `session_live` | system (cron near scheduledFor) | (background) |
| `session_live` | `session_completed` | system | (background, +session duration) |
| `session_completed` | `review_pending` | system | (background) |
| `review_pending` | `review_completed` | traveller | POST /api/plans/{inquiryId}/review |

For Pass H the background-system transitions are stubbed (manual triggers via dev endpoint until cron lands in a later pass).

---

## 3. KV schema

**New namespace:** `BOOKING_DATA` (declare in `wrangler.jsonc` mirroring `ACCOUNT_DATA`).

**Key layout:**
```
booking:{inquiryId}                        → BookingRecord (full state)
booking:traveller:{email}:inquiries        → string[] (inquiry IDs, newest first, capped 50)
booking:companion:{email}:inquiries        → string[] (inquiry IDs, newest first, capped 50)
booking:companion:{email}:rating-sum       → number (running sum)
booking:companion:{email}:rating-count     → number (running count)
booking:companion:{email}:reviews          → ReviewSummary[] (capped 25, newest first)
```

**`BookingRecord` shape (new in contracts.ts):**
```ts
export type BookingRecord = {
  id: string;                                // bk_{uuid}
  travellerEmail: string;                    // lowercase, indexed
  companionEmail: string;                    // lowercase, indexed
  companionId: string;                       // from existing profile fixture
  city: CitySlug;
  experience: ExperienceSlug;
  status: InquiryStatus;
  message: string;                           // traveller's original inquiry message
  createdAt: string;
  updatedAt: string;
  privacyAcknowledged: boolean;

  // Date negotiation (populated H3)
  travellerWindows?: DateWindow[];           // 2-3 windows the traveller proposes
  companionSelectedWindow?: DateWindow;      // companion picks one
  confirmedAt?: string;                      // when both parties confirmed
  scheduledFor?: string;                     // ISO datetime, when session starts
  durationMinutes?: number;                  // expected length

  // Payment (populated H4)
  paymentSessionId?: string;                 // Stripe session ID
  paymentStatus?: "none" | "held" | "captured" | "refunded";
  paymentAmount?: number;                    // smallest unit (THB satang or USD cent)
  paymentCurrency?: string;
  heldAt?: string;

  // Day-of (populated H5)
  meetingPoint?: string;                     // address or landmark
  contactNumber?: string;                    // companion's day-of phone
  dayOfNotes?: string[];                     // safety + logistics

  // Review (populated H6)
  reviewedAt?: string;
  reviewScore?: number;                      // 1-5
  reviewComment?: string;
};

export type DateWindow = {
  start: string;                             // ISO datetime
  end: string;                               // ISO datetime
  note?: string;                             // "evening only" etc.
};

export type ReviewSummary = {
  bookingId: string;
  travellerLabel: string;                    // "Traveller from Bangkok" — no PII
  score: number;
  comment: string;
  submittedAt: string;
};
```

---

## 4. Sub-pass sequence + dependencies

| # | Name | Adds states | Adds endpoints | Adds UI | Depends on |
|---|------|-------------|----------------|---------|------------|
| H1 | Inquiry creation | `submitted` | POST /api/traveller/inquiries (real KV), DELETE | "Send inquiry" form on Discovery + Profile pages; KV-backed inbox | — |
| H2 | Companion accept/decline | `accepted`, `declined` (real transitions) | POST /api/companion/inquiries/{id}/accept, /decline | Accept/Decline actions on CompanionInbox detail; traveller inbox status update | H1 |
| H3 | Plan + date/time | `date_pending`, `date_proposed`, `date_confirmed` | POST/GET /api/plans/{id}/windows, /select-window, /confirm | Date-window picker, mutual-confirm UI | H2 |
| H4 | Stripe checkout | `payment_held` | POST /api/plans/{id}/checkout, POST /api/webhooks/stripe | "Hold your booking" CTA, Stripe redirect, return URL handling | H3 |
| H5 | Day-of itinerary | `session_scheduled`, `session_live`, `session_completed` | GET /api/plans/{id}/itinerary, POST /api/dev/advance-session (test trigger) | Itinerary view on /traveller/sessions/{id} + /companion/sessions/{id} | H4 |
| H6 | Post-session review | `review_pending`, `review_completed` | POST /api/plans/{id}/review, GET /api/companions/{id}/reviews | Review form modal, companion-profile rating badge, reviews list | H5 |

---

## 5. Sub-pass H1 — Inquiry creation (NEXT SESSION)

**Files:**
- Modify: `src/shared/contracts.ts` — extend `InquiryStatus` enum, add `BookingRecord`, add `DateWindow`, add `ReviewSummary` (lines ~520-580)
- Modify: `wrangler.jsonc` — add `BOOKING_DATA` KV binding (mirror ACCOUNT_DATA shape from Pass E)
- Create: `src/worker/booking-store.ts` — KV-backed get/set/list/delete (mirror `account-store.ts` from Pass E)
- Modify: `src/worker/index.ts` — replace fixture-backed POST /api/traveller/inquiries with KV-backed handler; add DELETE for cancellation; modify GET endpoints to read from KV
- Modify: `src/worker/route-registry.ts` — update notes on existing routes (productionTarget: D1 → KV), add DELETE
- Create: `src/app/api/booking.ts` — BookingService client (mirror `account.ts`)
- Modify: `src/app/pages/TravellerDiscoveryPage.tsx` — add "Send inquiry" button on each profile card → bottom sheet form
- Create: `src/app/components/booking/InquiryFormSheet.tsx` — modal/sheet form (companionId, preferredWindow, message, privacyAck)
- Modify: `src/app/pages/TravellerInboxPage.tsx` — show real KV-backed inquiries (today shows fixture)
- Modify: `src/app/pages/CompanionInboxPage.tsx` — show real KV-backed inquiries received

**Key decisions for H1 session:**
- D1: bottom-sheet vs full-page form for InquiryFormSheet — defer to brainstorming at session start (lean: bottom sheet since Pass J primitives not yet built, use a `<dialog>` element with native behavior for now)
- D2: where the "Send inquiry" CTA lives — Discovery card vs Profile detail page vs both. Recommendation: Profile detail page (so traveller sees full bio + inquiryGuidance before sending), with a "View profile to inquire" CTA on Discovery card
- D3: tirak.app review step — auto-transition `submitted → under_review → routed` after fixed delay for v1? Or require manual admin action? Recommendation: auto-route after 5 minutes (configurable via env var) so the flow is testable end-to-end without admin tooling

**Detailed task breakdown (TDD bite-sized steps for H1):**

### H1.Task 1: Extend `InquiryStatus` enum + add `BookingRecord` type

**Files:**
- Modify: `src/shared/contracts.ts:522-530` (extend enum), append after line ~580 (BookingRecord + DateWindow + ReviewSummary)

**Step 1:** Add the additional states (`date_pending`, `date_proposed`, `date_confirmed`, `payment_held`, `session_scheduled`, `session_live`, `session_completed`, `review_pending`, `review_completed`) to `InquiryStatus` union. Remove `payment_review` (replaced by `payment_held`).

**Step 2:** Append `BookingRecord`, `DateWindow`, `ReviewSummary` types per Section 3 schema.

**Step 3:** Run TypeScript check.

```bash
cd /Volumes/madara/2026/Projects/thoughtseed/tirak/standalone-repos/tirakplus && npx tsc --noEmit
```
Expected: PASS (or fail only at uses of removed `payment_review` — those should error and need handling in Task 2)

**Step 4:** Commit.

```bash
git add src/shared/contracts.ts
git commit -m "feat(contracts): extend InquiryStatus for full booking lifecycle + BookingRecord type"
```

### H1.Task 2: Add ACCOUNT_DATA-style KV binding for booking

**Files:**
- Modify: `wrangler.jsonc` (add ACCOUNT_DATA after AUTH_OTPS — see line 33 from Pass E for placeholder ID pattern)
- Modify: `src/worker/index.ts:WorkerEnv` (add BOOKING_DATA?: KVNamespace)

**Step 1:** Add `BOOKING_DATA` to `kv_namespaces` in wrangler.jsonc with the same placeholder ID pattern Pass E used. Document key layout in the comment.

**Step 2:** Add `BOOKING_DATA?: KVNamespace` to `WorkerEnv` type.

**Step 3:** Run `npm run cf:types` to regen worker types.

**Step 4:** Run TypeScript check + commit.

### H1.Task 3: Create `src/worker/booking-store.ts`

**Files:**
- Create: `src/worker/booking-store.ts` (mirror `account-store.ts` from Pass E)

Functions required (each TDD'd):
- `readBooking(kv, id)` → `BookingRecord | null`
- `writeBooking(kv, record)` → `BookingRecord` (writes + updates index)
- `deleteBooking(kv, id)` → cancels + removes from indices
- `listTravellerBookings(kv, email)` → `BookingRecord[]`
- `listCompanionBookings(kv, email)` → `BookingRecord[]`
- `createBooking(kv, request, travellerEmail)` → `BookingRecord` (generates ID, sets status: 'submitted', timestamps, indexes by both emails)
- `transitionBookingStatus(kv, id, fromStatus[], toStatus, actorEmail)` → `BookingRecord` (validates transition is in allowlist + actor is authorized; returns null if invalid)

State transition allowlist lives in this file as a constant Map; the validator is the single source of truth.

### H1.Task 4: Wire `POST /api/traveller/inquiries` to KV

**Files:**
- Modify: `src/worker/index.ts:348-368` (replace fixture call with `createBooking` from booking-store)

### H1.Task 5: Wire GET endpoints to KV with fixture fallback

**Files:**
- Modify: `src/worker/index.ts:370-378` (traveller list)
- Modify: `src/worker/index.ts:380-386` (traveller detail)
- Modify: `src/worker/index.ts:420-428` (companion list)
- Modify: `src/worker/index.ts:430-440` (companion detail)

Falls back to existing fixtures when KV is empty (for first-time dev experience).

### H1.Task 6: Add DELETE /api/traveller/inquiries/{id} for cancellation

**Files:**
- Modify: `src/worker/index.ts` (add handler block); transition rule: only valid from `submitted | under_review | routed`

### H1.Task 7: Create `src/app/api/booking.ts` BookingService client

Mirror `src/app/api/account.ts` exactly. Methods: `createInquiry`, `listTravellerInquiries`, `getInquiry`, `listCompanionInquiries`, `cancelInquiry`.

### H1.Task 8: Build `InquiryFormSheet.tsx` modal

**Files:**
- Create: `src/app/components/booking/InquiryFormSheet.tsx`
- Form fields: companionId (hidden, passed via prop), preferredWindow (text — "weekend evening" style), message (textarea), privacyAcknowledged (checkbox)
- Uses native `<dialog>` for now; Pass J will replace with BottomSheet primitive

### H1.Task 9: Wire "Send inquiry" CTA on profile detail page

**Files:**
- Modify: `src/app/pages/TravellerDiscoveryDetailPage.tsx` (or whichever route renders profile detail — confirm with Grep first)

### H1.Task 10: Real KV-backed inboxes

**Files:**
- Modify: `src/app/pages/TravellerInboxPage.tsx` — call `BookingService.listTravellerInquiries`
- Modify: `src/app/pages/CompanionInboxPage.tsx` — call `BookingService.listCompanionInquiries`

### H1.Task 11: End-to-end smoke + screenshot capture

- curl-based: dev login → POST inquiry → GET list (verify real one appears) → GET detail
- Playwright-based: build a `qa-pass-h1-review.mjs` mirroring `qa-pass-e-review.mjs` walking through Discovery → Profile → Send inquiry → Inbox shows it

**Success criteria for H1 (verifiable):**
- [ ] POST /api/traveller/inquiries persists to KV (survives worker restart)
- [ ] DELETE /api/traveller/inquiries/{id} works only from `submitted | under_review | routed`
- [ ] Inquiry appears in both traveller inbox AND companion inbox (indexed by both emails)
- [ ] InquiryFormSheet validates message min 20 chars + privacyAcknowledged required
- [ ] State transition allowlist rejects invalid moves (e.g. routed → review_completed)
- [ ] Existing fixture data still works when KV is empty (dev fallback)
- [ ] npm run check is clean
- [ ] Playwright walk captures 8-10 frames showing the flow

---

## 6. Sub-pass H2 — Companion accept/decline (FUTURE SESSION)

**Scope:** Companion can accept or decline a routed inquiry. Traveller sees status update in their inbox.

**Files (preview):**
- Modify: `src/worker/index.ts` (add 2 POST handlers under `/api/companion/inquiries/{id}/accept` and `/decline`)
- Modify: `src/worker/route-registry.ts` (register 2 routes)
- Modify: `src/worker/booking-store.ts` (add `transitionBookingStatus` calls)
- Modify: `src/app/api/booking.ts` (add `acceptInquiry`, `declineInquiry`)
- Modify: `src/app/pages/CompanionInboxDetailPage.tsx` (or equivalent — confirm route at session start) — accept/decline action buttons
- Modify: `src/app/pages/TravellerInboxPage.tsx` — render status pill changes when status moves to `accepted` or `declined`

**Decision points to settle at session start:**
- D1: Decline requires reason category? (privacy, safety, schedule, other)
- D2: Email notification to traveller on accept/decline? Use Resend, mirror OTP path
- D3: Optimistic UI on accept/decline or wait for server?

**Success criteria:**
- [ ] Companion sees Accept/Decline actions only when status === `routed`
- [ ] Traveller status updates within 5 seconds (poll or refresh)
- [ ] Decline includes optional reason; stored on BookingRecord
- [ ] Email notification sent (Resend) to traveller on both transitions

---

## 7. Sub-pass H3 — Plan + date/time (FUTURE SESSION)

**Scope:** After acceptance, traveller proposes 2-3 date windows. Companion picks one. Traveller confirms. Booking status: `accepted → date_pending → date_proposed → date_confirmed`.

**Files (preview):**
- Modify: `src/shared/contracts.ts` — add `PlanWindowRequest`, `PlanWindowSelectionRequest`, `PlanConfirmRequest`
- Modify: `src/worker/booking-store.ts` — methods for window operations
- Modify: `src/worker/index.ts` — 3 new POST endpoints under `/api/plans/{inquiryId}/`
- Create: `src/app/components/booking/DateWindowPicker.tsx` — 2-3 window picker (date + time range + optional note)
- Create: `src/app/components/booking/WindowSelectionView.tsx` — companion sees windows, picks one
- Create: `src/app/components/booking/ConfirmPlanView.tsx` — traveller sees selected window, confirms
- Modify: `src/app/pages/TravellerInboxDetailPage.tsx` + `CompanionInboxDetailPage.tsx` — stage-aware UI

**Decision points:**
- D1: Native date input vs custom calendar picker (defer custom to Pass J)
- D2: Timezone — store all in UTC, display in user's local? Or fix to Bangkok TZ for v1?
- D3: ICS / .ics calendar download on confirm?

**Success criteria:**
- [ ] Traveller picks 2-3 windows, each at least 1 hour
- [ ] Companion picks exactly one window
- [ ] Traveller confirms; both inboxes show `date_confirmed`
- [ ] Windows in the past are rejected server-side
- [ ] Confirmation triggers email to both parties

---

## 8. Sub-pass H4 — Stripe checkout (FUTURE SESSION)

**Scope:** Once date confirmed, traveller clicks "Hold your booking" → Stripe Checkout in test mode → return URL flips status to `payment_held`. Webhook captures payment after session completion (H5).

**Files (preview):**
- Modify: `wrangler.jsonc` — flip `PAYMENT_PROVIDER_MODE` to `stripe_test` (or per-environment vars)
- Modify: `src/worker/index.ts` — new `POST /api/plans/{id}/checkout` endpoint (creates Stripe session via existing payment-provider.ts)
- Create: `src/worker/webhook-stripe.ts` — handles `checkout.session.completed` event
- Modify: `src/worker/index.ts` — add `POST /api/webhooks/stripe` route
- Create: `src/app/pages/PaymentReturnPage.tsx` — Stripe return URL handler (success/cancel)
- Modify: `src/app/pages/TravellerInboxDetailPage.tsx` — "Hold your booking" CTA when status === `date_confirmed`
- Modify: `src/shared/contracts.ts` — extend `BookingRecord.paymentStatus` handling

**Decision points:**
- D1: Hold amount — flat THB (e.g. 1500), or % of expected session fee?
- D2: Webhook signature verification — use Stripe library or hand-roll HMAC?
- D3: Idempotency keys on session creation?
- D4: Refund policy if cancellation before session

**Success criteria:**
- [ ] Stripe test session creates with correct metadata (bookingId, travellerEmail)
- [ ] Return URL parses session_id, verifies status, flips booking to `payment_held`
- [ ] Webhook handler verifies signature, updates booking status
- [ ] Decline flow refunds (no-op since we only authorized, not captured)
- [ ] No live keys (sk_live_*) used; sk_test_* enforced server-side

---

## 9. Sub-pass H5 — Day-of itinerary (FUTURE SESSION)

**Scope:** As the session date approaches, derive day-of itinerary from confirmed plan + companion profile. Show meeting point, contact button, safety reminders. Status flows `payment_held → session_scheduled → session_live → session_completed`.

**Files (preview):**
- Modify: `src/shared/contracts.ts` — `BookingRecord` extensions (meetingPoint, contactNumber already drafted in schema above)
- Modify: `src/worker/index.ts` — `GET /api/plans/{id}/itinerary` endpoint; `POST /api/dev/advance-session/{id}` test trigger
- Create: `src/app/pages/SessionDetailPage.tsx` (or extend existing) — itinerary card, meeting point, contact button, safety bar
- Decision: who fills meetingPoint? Companion at acceptance time? Tirak admin? Auto-derived from city?

**Decision points:**
- D1: Map embed — Apple Maps deep link vs Google Maps vs inline map (defer inline to Pass J)
- D2: Contact reveal — phone number or in-app messaging only (Pass I dependency)
- D3: How does `session_live` trigger? Cron worker? Timestamp comparison on GET?

**Success criteria:**
- [ ] Within 24h of scheduledFor, booking transitions to `session_scheduled`
- [ ] Itinerary card visible to both parties with meeting point + contact
- [ ] Contact button uses tel: scheme (or in-app msg in Pass I)
- [ ] After session ends (scheduledFor + durationMinutes), status auto-flips to `session_completed`
- [ ] Stripe capture-payment intent triggered on `session_completed`

---

## 10. Sub-pass H6 — Post-session review (FUTURE SESSION)

**Scope:** After `session_completed`, traveller has 7 days to submit a review (1-5 score + comment). Review feeds into companion profile aggregate (rating + count + recent reviews).

**Files (preview):**
- Modify: `src/shared/contracts.ts` — `ReviewRequest` type, `ReviewSummary` already drafted
- Modify: `src/worker/booking-store.ts` — `submitReview`, `getCompanionReviews`, aggregate rating helpers
- Modify: `src/worker/index.ts` — `POST /api/plans/{id}/review`, `GET /api/companions/{id}/reviews`
- Modify: `src/app/api/booking.ts` — `submitReview`, `getCompanionReviews`
- Create: `src/app/components/booking/ReviewFormSheet.tsx` — score + comment + privacy-aware "post anonymously"
- Modify: `src/app/pages/CompanionPublicProfile.tsx` (or equivalent) — show aggregate rating + recent reviews
- Modify: `src/app/pages/TravellerInboxDetailPage.tsx` — "Leave a review" CTA when status === `review_pending`

**Decision points:**
- D1: Companion can respond to reviews? Out of Pass H scope, future
- D2: PII handling — `ReviewSummary.travellerLabel` is "Traveller from Bangkok" not real name; should review even surface inquiry-specific details? Conservative: no
- D3: Aggregate update — atomic counter (KV race) or recompute from list on read? Use list-recompute for v1 since review submission is rare

**Success criteria:**
- [ ] Review form rejects score outside 1-5
- [ ] Comment min 20 chars, max 500
- [ ] After 7 days from `session_completed`, status auto-flips to `review_completed` (without review) or stays after submission
- [ ] Companion public profile shows rating + count + 3 most recent reviews (truncated)
- [ ] Companion's own account shows full review list

---

## 11. Cross-cutting concerns

**Email notifications (every transition):**
- Use existing Resend wrapper (currently used for OTP)
- Templates kept inline for v1 (no template KV); migrate to KV when 5+ templates exist
- Notification gate respects `AccountPrivacySettings.receiveInquiryUpdates` (Pass E surface)

**CSRF:**
- All POST/DELETE go through `guardApiMutation` (already adds DELETE to allow list in Pass E)
- New webhooks endpoint MUST bypass CSRF (Stripe-signed)

**Rate limiting:**
- Add `booking_mutation` group to `src/worker/rate-limit.ts` — 10 inquiries per traveller per day
- `payment_checkout` group — 3 attempts per inquiry per day

**Telemetry:**
- Log state transitions to console for now; PostHog event hookup is a separate Pass (not in H scope)

**Test data reset:**
- Add `POST /api/dev/reset-bookings` for clean QA runs (gated on `ENVIRONMENT !== "production"` per existing pattern)

---

## 12. Open questions for the user (not blocking H1, but answer before H4)

1. **Hold amount strategy** — flat fee vs % of session price (and what determines session price)?
2. **Cancellation policy** — refund window (24h before? 72h? non-refundable after acceptance?)
3. **Companion no-show** — automatic full refund + booking status?
4. **Traveller no-show** — partial vs full forfeit?
5. **Disputes** — Pass H ships happy-path; dispute resolution surfaces are a separate pass

---

## 13. Out of scope for Pass H

These are explicitly deferred to keep H shippable in 6 sessions:

- Real-time messaging (Pass I)
- Native UI primitives — bottom-sheet, action-sheet, pull-to-refresh (Pass J)
- Companion availability calendar (separate sub-pass within Pass I or post-J)
- Multi-companion plans (group bookings)
- Recurring bookings
- Companion payouts / split / accounting (separate financial-flows pass)
- Cron worker for time-based transitions (use manual triggers + dev endpoints; cron lands later)
- PostHog telemetry hooks
- Map integration (Pass J or later)

---

## Execution handoff

**Plan complete and saved to `docs/plans/2026-05-27-pass-h-booking-flow-roadmap.md`.**

Two execution options for H1 (next sub-pass):

**1. Subagent-Driven (this session continuation)** — I dispatch fresh subagent per H1 task, review between tasks, fast iteration.

**2. Parallel Session (separate session, fresh context)** — Open a new session in the worktree, point it at this plan, batch-execute H1 with checkpoints.

Recommend (2) because Pass E + Pass H planning has consumed enough context this session; a fresh session for H1 implementation gets the cleanest run.
