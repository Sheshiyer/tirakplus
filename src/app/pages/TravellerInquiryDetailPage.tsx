import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import type { DateWindow, PaymentProviderSummary, TravellerInquiryDetail } from "../../shared/contracts";
import { BookingApiError, BookingService } from "../api/booking";
import { ApiRequestError, TravellerService } from "../api/traveller";
import { ChatThreadView } from "../components/booking/ChatThreadView";
import { ReviewFormSheet } from "../components/booking/ReviewFormSheet";
import { SessionItinerary } from "../components/booking/SessionItinerary";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";

const POLL_INTERVAL_MS = 5000;

// H5.T6 — Itinerary unlock window. The read-only SessionItinerary surface
// flips on 24 hours before the session's scheduledFor. Mirrors the H5.T5
// companion-side constant + the server-side cutover hook. The traveller
// can't edit day-of details — that surface belongs to the companion — so
// before unlock we just render a small "Day-of details coming" placeholder.
const ITINERARY_UNLOCK_HOURS = 24;

type LoadState =
  | { status: "loading"; inquiry?: undefined; message?: undefined }
  | { status: "ready"; inquiry: TravellerInquiryDetail; message?: undefined }
  | { status: "error"; inquiry?: undefined; message: string };

export function TravellerInquiryDetailPage() {
  const { inquiryId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  // Seed from location state when navigating directly from the composer —
  // avoids a KV round-trip that races the write (and fails when KV is unbound).
  const seedInquiry = (location.state as { inquiry?: TravellerInquiryDetail } | null)?.inquiry;
  const [state, setState] = useState<LoadState>(
    seedInquiry ? { status: "ready", inquiry: seedInquiry } : { status: "loading" },
  );
  const [paymentProviders, setPaymentProviders] = useState<PaymentProviderSummary[]>([]);
  const [checkoutState, setCheckoutState] = useState<"idle" | "creating">("idle");
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const isPollingRef = useRef(false);

  // H4-stub — Hold-booking action state. Drives the "Hold your booking" CTA
  // that sits below the date_confirmed summary. submitting disables the
  // button; error surfaces a message inline next to the CTA without
  // disturbing the rest of the page.
  const [holdActionState, setHoldActionState] = useState<"idle" | "submitting" | "error">("idle");
  const [holdErrorMessage, setHoldErrorMessage] = useState<string | null>(null);

  // H6.T7 — Review modal open/close toggle. The ReviewFormSheet is a
  // native <dialog> that only mounts in DOM when open=true; the CTA at
  // review_pending flips this on, and onSubmitted / onClose flip it off.
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    if (!inquiryId) {
      setState({ status: "error", message: "Choose an inquiry before opening its details." });
      return;
    }

    // Skip the initial fetch when the composer already gave us the inquiry via
    // location.state — the data is fresh and a round-trip would only 404 if
    // the KV write hasn't propagated yet (or the namespace isn't bound).
    if (seedInquiry) return;

    let cancelled = false;
    setState({ status: "loading" });

    BookingService.getTravellerInquiry(inquiryId)
      .then((inquiry) => {
        if (!cancelled) setState({ status: "ready", inquiry });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Inquiry detail could not be loaded.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [inquiryId, seedInquiry]);

  // H2.T8 / H3.T7 / H4-stub / H5.T6 / H6.T7 — Mirror the inbox list poll for
  // the detail page. While the viewed inquiry sits in any non-terminal
  // negotiation/hold/scheduled/review state, refetch every 5s so the page
  // flips forward without manual reload. Stops automatically once status
  // reaches review_completed (terminal for the traveller in H6) or any
  // terminal non-success state (declined / cancelled). Skips when the tab
  // is hidden. Polling failures are swallowed silently.
  //
  // payment_held is included so the prod path (where Stripe webhook flips
  // payment_held → session_scheduled out-of-band) surfaces within 5s. In dev
  // the auto-advance bridge skips through payment_held synchronously, so the
  // poll usually never runs against it.
  //
  // H5 additions:
  //   session_scheduled → system advances to session_live at the
  //     scheduled-for moment; keep polling so the page can swap the H4-stub
  //     "Day-of details will appear here" panel for the read-only
  //     SessionItinerary at the 24h cutover, and again at session_live.
  //   session_live      → system advances to session_completed when the
  //     session window ends; keep polling so the traveller sees the
  //     terminal state without a manual reload.
  //
  // H6 additions:
  //   session_completed → system auto-advances to review_pending immediately
  //     so the traveller can leave a review; keep polling so that surface
  //     flips in without a manual reload.
  //   review_pending    → the 7-day review period can auto-close to
  //     review_completed even without a submission; keep polling so the
  //     page surfaces the closed-window state when that fires.
  //
  // review_completed is terminal for the traveller and is intentionally
  // excluded so the page stops polling once the review chain ends.
  //
  // hasPending is derived via useMemo so the polling effect keys on a boolean
  // rather than the whole state object — keeping the 5s cadence steady across
  // successful polls instead of resetting the interval on every setState.
  const hasPending = useMemo(() => {
    if (state.status !== "ready") return false;
    const s = state.inquiry.status;
    return (
      s === "routed" ||
      s === "accepted" ||
      s === "date_pending" ||
      s === "date_proposed" ||
      s === "payment_held" ||
      s === "session_scheduled" || // H5: poll for session_live transition
      s === "session_live" ||      // H5: poll for session_completed transition
      s === "session_completed" || // H6: poll for review_pending transition
      s === "review_pending"       // H6: poll for review_completed (incl. 7-day auto-close)
    );
  }, [state]);

  useEffect(() => {
    if (!hasPending || !inquiryId) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      if (document.hidden) return;
      if (isPollingRef.current) return; // skip if previous fetch still in flight
      isPollingRef.current = true;
      try {
        const inquiry = await BookingService.getTravellerInquiry(inquiryId);
        if (!cancelled) setState({ status: "ready", inquiry });
      } catch {
        // best-effort — polling failures are not user-facing
      } finally {
        isPollingRef.current = false;
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hasPending, inquiryId]);

  useEffect(() => {
    let cancelled = false;
    TravellerService.getPaymentProviders()
      .then((providers) => {
        if (!cancelled) setPaymentProviders(providers);
      })
      .catch(() => {
        if (!cancelled) setPaymentProviders([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <section className="inquiry-page">
        <SkeletonCard />
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="inquiry-page">
        <FeedbackState
          variant="error"
          title="Inquiry detail is unavailable"
          description={state.message}
          actionLabel="Back to inbox"
          onAction={() => window.location.assign("/traveller/inbox")}
        />
      </section>
    );
  }

  const { inquiry } = state;

  // H5.T6 — Itinerary visibility logic. Mirrors the companion-side gate
  // from H5.T5 but with NO editable form (the traveller can't set day-of
  // details — that surface belongs to the companion).
  //   itineraryUnlocked: true once we're within 24h of scheduledFor.
  //     scheduledFor is only set from date_confirmed onward, so this
  //     short-circuits to false for earlier statuses.
  //   showItinerary: renders the read-only SessionItinerary. Requires both
  //     a confirmed window AND a scheduledFor (set by server on
  //     date_confirmed). True when the session is live/completed, OR when
  //     we've crossed the 24h unlock for one of the post-confirm states.
  const itineraryUnlocked = Boolean(
    inquiry.scheduledFor &&
      Date.now() >=
        Date.parse(inquiry.scheduledFor) - ITINERARY_UNLOCK_HOURS * 60 * 60 * 1000,
  );
  // P2.T5 — gate on scheduledFor (the P2 source of truth). New P2 bookings
  // carry scheduledFor + durationMinutes but never companionSelectedWindow
  // (the H3 field). The window the itinerary needs is synthesized from
  // scheduledFor below (windowFromSchedule), so a legacy companionSelectedWindow
  // is no longer required to render the surface.
  const showItinerary = Boolean(
    inquiry.scheduledFor &&
      (inquiry.status === "session_live" ||
        inquiry.status === "session_completed" ||
        (inquiry.status === "session_scheduled" && itineraryUnlocked) ||
        (inquiry.status === "payment_held" && itineraryUnlocked) ||
        (inquiry.status === "date_confirmed" && itineraryUnlocked)),
  );

  // H6.T7 — Humanise the CitySlug for the anonymised-via-label copy in the
  // Leave-a-Review CTA. The slug is kebab-case ("koh-samui"); we split on
  // dashes and title-case each word so the public-facing string reads
  // "Traveller from Koh Samui" instead of leaking the slug verbatim. Local
  // inline derivation avoids pulling in the booking-store CITY_LABELS map
  // for a single one-line transformation; matches the lightweight inline
  // formatters already used elsewhere on this page (formatWindowLabel etc.).
  const cityLabel = inquiry.city
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const paymentReturnState = searchParams.get("payment");
  const stripeProvider = paymentProviders.find((provider) => provider.id === "stripe");
  const isStripeTestMode = stripeProvider?.status === "test_mode";
  const canOpenCheckout = isStripeTestMode || inquiry.paymentState.status === "not_started";
  const paymentHeading =
    paymentReturnState === "success"
      ? "Checkout returned"
      : canOpenCheckout
      ? "Card checkout"
      : inquiry.paymentState.status === "pending_review"
      ? "Payment is waiting"
      : "Payment is paused";
  const paymentCopy = isStripeTestMode
    ? "Stripe test checkout is active on this local build. No live charge will be created."
    : inquiry.paymentState.note;

  // H4-stub — Place a hold on the confirmed plan. Calls
  // BookingService.holdBooking, which in dev/staging auto-advances through
  // payment_held → session_scheduled in one round-trip. In production this
  // would leave the booking at payment_held until the Stripe webhook fires;
  // the polling effect picks it up from there.
  const handleHold = async () => {
    setHoldActionState("submitting");
    setHoldErrorMessage(null);
    try {
      const response = await BookingService.holdBooking(inquiry.id);
      setState({ status: "ready", inquiry: response.inquiry });
      setHoldActionState("idle");
    } catch (err) {
      setHoldActionState("error");
      if (err instanceof BookingApiError) {
        setHoldErrorMessage(err.message || "Could not place hold. Try again.");
      } else {
        setHoldErrorMessage("Could not place hold. Try again.");
      }
    }
  };

  const startCheckout = async () => {
    setCheckoutState("creating");
    setCheckoutMessage(null);
    try {
      const result = await TravellerService.createPaymentSession(inquiry.id);
      if (result.status === "created") {
        window.location.assign(result.checkoutUrl);
        return;
      }
      setCheckoutMessage(result.message);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setCheckoutMessage(error.message);
      } else {
        setCheckoutMessage("Checkout could not be opened.");
      }
    } finally {
      setCheckoutState("idle");
    }
  };

  return (
    <>
    <section className="inquiry-page" aria-labelledby="inquiry-detail-title">
      <div className="inquiry-success-panel">
        <p className="eyebrow">{inquiry.status.replace("_", " ")}</p>
        <h1 id="inquiry-detail-title">{inquiry.companionDisplayName} inquiry</h1>
        <p>{inquiry.nextStep}</p>

        <div className="inquiry-detail-message">
          <h2>Your message</h2>
          <p>{inquiry.message}</p>
        </div>

        <div className="inquiry-timeline">
          {inquiry.timeline.map((item) => (
            <article key={item.label} className={`timeline-item timeline-item-${item.status}`}>
              <p className="meta">{item.status}</p>
              <h3>{item.label}</h3>
              <p>{item.note}</p>
            </article>
          ))}
        </div>

        <div className="payment-state-panel">
          <p className="meta">Payment</p>
          <h2>{paymentHeading}</h2>
          <p>{paymentCopy}</p>
          {paymentReturnState === "success" && (
            <p className="payment-return-note">Checkout sent you back to Tirak. We will update this plan when confirmation arrives.</p>
          )}
          {paymentReturnState === "cancelled" && (
            <p className="payment-return-note">Checkout was cancelled. Nothing has moved.</p>
          )}
          {checkoutMessage && <p className="payment-return-note">{checkoutMessage}</p>}
          {canOpenCheckout ? (
            <Button type="button" variant="primary" onClick={() => void startCheckout()} disabled={checkoutState === "creating"}>
              {checkoutState === "creating" ? "Opening checkout..." : isStripeTestMode ? "Open test checkout" : "Open checkout"}
            </Button>
          ) : (
            <p className="payment-hold-note">No payment action is available yet.</p>
          )}
        </div>

        <p className="privacy-note">{inquiry.privacyNote}</p>

        {/* P2.T2 — Legacy reschedule fallback. The H3 propose → pick →
            confirm chain (DateWindowPicker / ConfirmPlanView) was removed in
            P2: new inquiries carry a single scheduledFor from the composer
            and auto-advance accepted → date_confirmed server-side. Only
            bookings created BEFORE the P2.T1 migration can still be sitting
            in date_pending / date_proposed. Rather than crash on the deleted
            pickers, surface a neutral "start over" card pointing back to
            discovery. New bookings never hit this branch. */}
        {(inquiry.status === "date_pending" || inquiry.status === "date_proposed") && (
          <section className="plan-stage-cta" aria-label="Reschedule needed">
            <p className="eyebrow">Reschedule needed</p>
            <h2>This plan used an older scheduling flow.</h2>
            <p>Please start a new inquiry with your preferred date.</p>
            <div className="plan-stage-actions">
              <Button as={Link} to="/traveller/discovery" variant="primary">
                Open discovery
              </Button>
            </div>
          </section>
        )}

        {inquiry.status === "date_confirmed" && inquiry.scheduledFor && (
          <section className="plan-stage-confirmed" aria-label="Plan confirmed">
            <p className="eyebrow">Plan confirmed</p>
            <h2>{formatScheduleLabel(inquiry.scheduledFor, inquiry.durationMinutes)}</h2>
            <p>
              Bangkok local time
              {typeof inquiry.durationMinutes === "number"
                ? ` · ${formatDurationHours(inquiry.durationMinutes)}`
                : ""}
              .
            </p>
            {inquiry.confirmedAt && (
              <p>Confirmed on {formatDate(inquiry.confirmedAt)}.</p>
            )}

            {/* H4-stub — Hold booking CTA. Below the summary so the page
                still reads top-down as "plan locked; here's your next
                move". The dev-preview note is intentionally visible to
                signal the H4-stub status to anyone testing the build. */}
            <div className="plan-stage-hold-cta">
              <p className="meta">Hold your booking to secure this session.</p>
              <Button
                type="button"
                variant="primary"
                onClick={() => void handleHold()}
                disabled={holdActionState === "submitting"}
              >
                {holdActionState === "submitting" ? "Holding..." : "Hold your booking"}
              </Button>
              <p className="dev-preview-note">
                Dev preview — payment integration pending. The booking advances to
                scheduled without a real charge in this build.
              </p>
              {holdErrorMessage && (
                <p className="plan-stage-error" role="alert">{holdErrorMessage}</p>
              )}
            </div>
          </section>
        )}

        {/* H4-stub — payment_held panel. Reached only in production where the
            auto-advance bridge is disabled and the booking sits at payment_held
            until the Stripe webhook fires. In dev/staging the bridge skips
            straight to session_scheduled, so this panel is rarely seen — but
            we still render it so the prod path has a coherent surface. */}
        {inquiry.status === "payment_held" && inquiry.scheduledFor && (
          <section className="plan-stage-confirmed" aria-label="Booking held">
            <p className="eyebrow">Booking held</p>
            <h2>Your hold is in place.</h2>
            <p>{formatScheduleLabel(inquiry.scheduledFor, inquiry.durationMinutes)} (Bangkok local time)</p>
            {inquiry.heldAt && <p>Held on {formatDate(inquiry.heldAt)}.</p>}
            <p>Tirak will share day-of details closer to the session.</p>
          </section>
        )}

        {/* H4-stub — session_scheduled panel. Terminal state for H4-stub. H5
            will replace this with the real day-of itinerary view (meeting
            point, contact number, safety checklist). */}
        {inquiry.status === "session_scheduled" && inquiry.scheduledFor && (
          <section className="plan-stage-confirmed plan-stage-scheduled" aria-label="Session scheduled">
            <p className="eyebrow">Session scheduled</p>
            <h2>{formatScheduleLabel(inquiry.scheduledFor, inquiry.durationMinutes)}</h2>
            <p>
              Bangkok local time
              {typeof inquiry.durationMinutes === "number"
                ? ` · ${formatDurationHours(inquiry.durationMinutes)}`
                : ""}
              .
            </p>
            {inquiry.heldAt && <p>Booking held on {formatDate(inquiry.heldAt)}.</p>}
            <p>Day-of details will appear here closer to the session.</p>
          </section>
        )}

        {/* H5.T6 — Day-of placeholder. Renders only when the itinerary
            hasn't unlocked yet AND the booking is in the confirmed range
            (date_confirmed / payment_held / session_scheduled). Before
            date_confirmed there's no scheduledFor anchor, so the gate
            naturally collapses. After unlock or once the session is
            live/completed the SessionItinerary below takes over. The
            traveller can't edit these details — the companion owns that
            surface (H5.T5) — so this is purely a "what to expect" card. */}
        {!itineraryUnlocked &&
          (inquiry.status === "date_confirmed" ||
            inquiry.status === "payment_held" ||
            inquiry.status === "session_scheduled") && (
            <section className="plan-stage-cta" aria-label="Day-of details coming">
              <p className="eyebrow">Day-of details</p>
              <h2>Coming 24 hours before the session.</h2>
              <p>
                Meeting point, your companion's contact, and any logistics will
                appear here as the date approaches.
              </p>
            </section>
          )}

        {/* H5.T6 — Read-only itinerary. SessionItinerary (H5.T4) is pure
            display; visibility gating lives on showItinerary above. The two
            narrowed conditions here re-check the optional fields used in
            the JSX so TS can drop the undefined branch. perspective is
            "traveller" so the contact + notes cards read as
            "Companion contact" / "Notes from your companion". */}
        {showItinerary && inquiry.scheduledFor && (
          <SessionItinerary
            scheduledFor={inquiry.scheduledFor}
            durationMinutes={inquiry.durationMinutes}
            selectedWindow={
              inquiry.companionSelectedWindow ??
              windowFromSchedule(inquiry.scheduledFor, inquiry.durationMinutes)
            }
            meetingPoint={inquiry.meetingPoint}
            contactNumber={inquiry.contactNumber}
            dayOfNotes={inquiry.dayOfNotes}
            status={inquiry.status}
            perspective="traveller"
          />
        )}

        {/* Pass I.T6 — Chat thread. Self-contained: owns its own polling,
            optimistic send, mark-read, and scroll behaviour. The component
            also self-gates the composer on MATCHED_STATUSES (anything before
            "accepted" or any terminal-non-success state renders the composer
            disabled with a per-state hint), so no extra conditional wrapping
            is needed here. Rendered for every non-error ready state — sits
            between the itinerary surface and the review CTA so the thread
            stays anchored as the page flips through the booking lifecycle. */}
        <ChatThreadView
          inquiryId={inquiry.id}
          viewerRole="traveller"
          bookingStatus={inquiry.status}
        />

        {/* H6.T7 — Leave a review CTA at review_pending. The page sits on
            this status from session_completed → review_pending (auto-bridge,
            instantaneous) until the traveller either submits or the 7-day
            window expires. The CTA opens the ReviewFormSheet modal mounted
            at the bottom of this component. cityLabel humanises the slug
            inline so we don't ship the literal "{city}" token that
            ReviewFormSheet currently renders in its own header. */}
        {inquiry.status === "review_pending" && (
          <section className="plan-stage-cta" aria-label="Leave a review">
            <p className="eyebrow">Review</p>
            <h2>How was your time with {inquiry.companionDisplayName}?</h2>
            <p>
              Your review stays anonymous via &ldquo;Traveller from {cityLabel}.&rdquo;
              Reviews are immutable once submitted.
            </p>
            <Button type="button" variant="primary" onClick={() => setReviewModalOpen(true)}>
              Leave a review
            </Button>
          </section>
        )}

        {/* H6.T7 — Submitted review summary at review_completed. Renders the
            traveller's own review back to them so the page has a coherent
            terminal surface (and so any future "edit" affordance would have
            a place to live, though v1 reviews are immutable). The score +
            comment + submittedAt copy is the same shape the public
            CompanionProfilePage will use in T8. */}
        {inquiry.status === "review_completed" && inquiry.reviewScore !== undefined && (
          <section className="plan-stage-confirmed" aria-label="Review submitted">
            <p className="eyebrow">Review submitted</p>
            <h2>You rated {inquiry.companionDisplayName} {inquiry.reviewScore}/5.</h2>
            {inquiry.reviewComment && (
              <p className="review-summary-comment">&ldquo;{inquiry.reviewComment}&rdquo;</p>
            )}
            {inquiry.reviewedAt && <p>Submitted on {formatDate(inquiry.reviewedAt)}.</p>}
          </section>
        )}

        {/* H6.T7 — Auto-completed-without-review case. The 7-day review
            period can expire silently, in which case the inquiry advances
            to review_completed without a reviewScore. Show a brief notice
            so the page has SOMETHING here instead of a blank terminal
            state. Rare in practice — most reviews land within a day. */}
        {inquiry.status === "review_completed" && inquiry.reviewScore === undefined && (
          <section className="plan-stage-cta" aria-label="Review period closed">
            <p className="eyebrow">Review period closed</p>
            <h2>The 7-day review period has passed.</h2>
            <p>Reviews need to land within a week of the session completing.</p>
          </section>
        )}

        <div className="action-row">
          <Button as={Link} to="/traveller/inbox" variant="secondary">
            Back to inbox
          </Button>
          <Button as={Link} to="/traveller/discovery" variant="secondary">
            Open discovery
          </Button>
        </div>
      </div>
    </section>

    {/* H6.T7 — ReviewFormSheet mount. Native <dialog> modal that only
        renders DOM when open=true (the component early-returns null
        otherwise), so the cost of leaving it mounted here at the page
        level is zero when the traveller isn't reviewing. onSubmitted
        flips the page into review_completed by setting the next inquiry
        snapshot returned by the API, which immediately renders the
        review summary card above and stops the 5s poll. */}
    <ReviewFormSheet
      open={reviewModalOpen}
      inquiryId={inquiry.id}
      companionDisplayName={inquiry.companionDisplayName}
      onClose={() => setReviewModalOpen(false)}
      onSubmitted={(next) => {
        setReviewModalOpen(false);
        setState({ status: "ready", inquiry: next });
      }}
    />
    </>
  );
}

// P2.T5 — Default session length when durationMinutes is absent. Mirrors the
// server-stamped default (180 min / 3h) so a booking that somehow lacks the
// field still renders a coherent end time.
const DEFAULT_DURATION_MINUTES = 180;

// P2.T5 — Render a confirmed slot as "Sat, 14 June · 18:00–21:00" in
// Asia/Bangkok local time, derived from the P2 scheduledFor + durationMinutes
// (the H3 companionSelectedWindow is no longer the source of truth). Same
// output shape as formatWindowLabel so the date_confirmed+ panels read
// identically whether the data came from a legacy window or the new fields.
function formatScheduleLabel(scheduledFor: string, durationMinutes?: number): string {
  const start = new Date(scheduledFor);
  const end = new Date(start.getTime() + (durationMinutes ?? DEFAULT_DURATION_MINUTES) * 60 * 1000);
  const startFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const endFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const startParts = startFmt.formatToParts(start);
  const endParts = endFmt.formatToParts(end);
  const get = (parts: Intl.DateTimeFormatPart[], type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get(startParts, "weekday");
  const day = get(startParts, "day");
  const month = get(startParts, "month");
  const startTime = `${get(startParts, "hour")}:${get(startParts, "minute")}`;
  const endTime = `${get(endParts, "hour")}:${get(endParts, "minute")}`;
  return `${weekday}, ${day} ${month} · ${startTime}–${endTime}`;
}

// P2.T5 — Synthesize a DateWindow from scheduledFor + durationMinutes for the
// SessionItinerary surface, which still takes a required selectedWindow prop.
// New P2 bookings never set companionSelectedWindow, so we build an equivalent
// window on the fly; legacy bookings keep using their stored window.
function windowFromSchedule(scheduledFor: string, durationMinutes?: number): DateWindow {
  const start = new Date(scheduledFor);
  const end = new Date(start.getTime() + (durationMinutes ?? DEFAULT_DURATION_MINUTES) * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

// Mirrors AccountSettings.tsx's ISO → human date helper so confirmedAt /
// acceptedAt render the same way across the traveller surface.
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// "3 hours" / "1 hour" / "1 hour 30 min". Used by the date_confirmed panel
// so the traveller can sanity-check the locked duration at a glance.
function formatDurationHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const hourWord = hours === 1 ? "hour" : "hours";
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} ${hourWord}`;
  return `${hours} ${hourWord} ${mins} min`;
}
