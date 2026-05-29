# Inquiry Composer (P2) — Single-Page Rebuild + H3 Deprecation

**Date:** 2026-05-28
**Status:** Approved, in progress
**Reference board:** `generated/web-reference-boards/gpt-image-2/inquiry-flow-responsive-board.png`
**Supersedes:** Pass H3 propose-pick-confirm chain

## Why

The inquiry-flow inspiration board shows a **single-page composer**: the
traveller picks one date, one time, one experience, a location, and writes
a message — then sends. The shipped H3 flow instead splits date selection
across three round-trips (traveller proposes 2-3 windows → companion picks
one → traveller confirms). The board's model is simpler and is the chosen
direction. H3 is deprecated.

## Locked design decisions (2026-05-28)

1. **Date model**: inquiry carries one `scheduledFor` ISO datetime.
   Duration is server-stamped (default 180 min / 3h), not user-picked.
   Companion accept auto-advances `accepted → date_confirmed` because the
   date is already set. The H3 `date_pending` / `date_proposed` states stay
   in the enum for back-compat but get no new transitions and no UI.
2. **Location**: inquiry `location` is the traveller's PREFERENCE. The H5
   companion-set `meetingPoint` remains the CONFIRMED point set day-of.
   They coexist (preference vs confirmed).
3. **Plan context**: reuse the 5 existing `ExperienceSlug` values rendered
   as icon chips. No new enum, no taxonomy fork. `experience` becomes
   user-selectable in the composer (was a URL prop).
4. **v1 scope = full fidelity**: Muse-assist is LIVE (button seeds Muse with
   composer context → suggests a respectful message → "Use this" inserts it)
   AND the calendar is availability-gated (only the companion's open days are
   selectable, time chips derive from the selected day's window).
5. **Migration**: accept staged-data reset. Bookings without `scheduledFor`
   render a "reschedule needed" fallback; new bookings use the new shape.
   No migration script (pre-launch, minimal real data).

## Schema (src/shared/contracts.ts)

```ts
export type TravellerInquiryRequest = {
  companionId: string;
  city: CitySlug;
  experience: ExperienceSlug;     // now user-selected via chips
  scheduledFor: string;           // NEW — ISO datetime
  location: string;               // NEW — preferred meeting place, 1-200 chars
  message: string;
  privacyAcknowledged: boolean;
  // preferredWindow REMOVED
  // durationMinutes server-stamped (default 180), not on the request
};
```

## State machine (src/worker/booking-store.ts)

Remove H3 `TRANSITION_ALLOWLIST` rules:
- `accepted → date_pending` (traveller)
- `date_pending → date_proposed` (companion)
- `date_proposed → date_confirmed` (traveller)

Add:
- `accepted → date_confirmed` (system, auto-advance; sets `confirmedAt = now`,
  `scheduledFor` + `durationMinutes` already present from inquiry creation)

## Deletions (H3 deprecation)

- Components: `DateWindowPicker.tsx`, `WindowSelectionView.tsx`, `ConfirmPlanView.tsx`
- `BookingService`: `submitPlanWindows`, `selectPlanWindow`, `confirmPlan`
- Worker routes: `POST /api/plans/:id/windows`, `/select-window`, `/confirm`
- All 6 wirings in `TravellerInquiryDetailPage` + `CompanionInquiryDetailPage`

## New components

| Component | Role |
|---|---|
| `InquiryComposerPage` | Full route `/traveller/companions/:companionId/inquire`, replaces the `<dialog>` |
| `CompanionInquiryCard` | Sidebar profile thumb + verified/city chips (reuse `Chip`) |
| `InlineCalendar` | Month grid, availability-gated by `companion.availabilityWindows` |
| `TimeSlotChips` | Preset time pills derived from the selected day's window |
| `ExperienceChipGroup` | The 5 `ExperienceSlug` as selectable icon chips |
| `LocationField` | Pin-iconed `Input` variant |
| `MuseComposeAssist` | "Ask Muse" → seeds Muse w/ context → suggests message → "Use this" inserts + /500 counter |
| `DiscreetByDesignCard` | Shield-icon privacy callout |

Layout: 3-column wide rail (profile | composer | privacy+session summary),
collapsing to single column at tablet/mobile.

## Build sequence (7 sub-tasks)

- **P2.T1** Schema migration + state-machine rewire + delete H3 worker endpoints
- **P2.T2** Delete H3 components + unwire from both detail pages
- **P2.T3** Composer primitives (calendar, time chips, exp chips, location, discreet card)
- **P2.T4** MuseComposeAssist (Muse integration — highest risk)
- **P2.T5** InquiryComposerPage + route + wire from discovery/profile
- **P2.T6** Styling (dark composer, 3-col → 1-col responsive)
- **P2.T7** Playwright smoke + validation (screenshots saved to `generated/qa-screenshots/`)

## Risks

- **T1 schema break**: old `preferredWindow` bookings lack `scheduledFor`.
  Mitigated by the "reschedule needed" UI fallback + pre-launch data reset.
- **T4 Muse integration**: seeding Muse with composer context + returning a
  draft is the most complex piece. Fallback: if Muse errors, the textarea
  stays a plain composer (graceful degradation).
- **Availability-gated calendar**: depends on `companion.availabilityWindows`
  being populated; empty availability → calendar shows "no open days, send a
  flexible request" fallback.

## QA artifact policy (lesson from Pass I)

QA screenshots go to `generated/qa-screenshots/<surface>/` (gitignored but
durable on disk) — NOT `/tmp` (ephemeral, cleared on resume).
