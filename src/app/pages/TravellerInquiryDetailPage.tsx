import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { DateWindow, PaymentProviderSummary, TravellerInquiryDetail } from "../../shared/contracts";
import { BookingApiError, BookingService } from "../api/booking";
import { ApiRequestError, TravellerService } from "../api/traveller";
import { ConfirmPlanView } from "../components/booking/ConfirmPlanView";
import { DateWindowPicker } from "../components/booking/DateWindowPicker";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";

const POLL_INTERVAL_MS = 5000;

type LoadState =
  | { status: "loading"; inquiry?: undefined; message?: undefined }
  | { status: "ready"; inquiry: TravellerInquiryDetail; message?: undefined }
  | { status: "error"; inquiry?: undefined; message: string };

export function TravellerInquiryDetailPage() {
  const { inquiryId } = useParams();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [paymentProviders, setPaymentProviders] = useState<PaymentProviderSummary[]>([]);
  const [checkoutState, setCheckoutState] = useState<"idle" | "creating">("idle");
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const isPollingRef = useRef(false);

  // H3.T7 — Stage-aware plan UI toggles.
  //   showWindowPicker: drives the "accepted → propose dates" CTA → inline
  //     DateWindowPicker pattern. Closed by default so the page first reads
  //     as a calm status panel; the traveller opts in to the form.
  //   showConfirmForm: open by default when the page is sitting on
  //     date_proposed (the companion has picked; confirming is the only
  //     productive next move). Cancel collapses it into a smaller CTA card
  //     for the "I'll confirm later" path, with a button to re-open.
  const [showWindowPicker, setShowWindowPicker] = useState(false);
  const [showConfirmForm, setShowConfirmForm] = useState(true);

  // H4-stub — Hold-booking action state. Drives the "Hold your booking" CTA
  // that sits below the date_confirmed summary. submitting disables the
  // button; error surfaces a message inline next to the CTA without
  // disturbing the rest of the page.
  const [holdActionState, setHoldActionState] = useState<"idle" | "submitting" | "error">("idle");
  const [holdErrorMessage, setHoldErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!inquiryId) {
      setState({ status: "error", message: "Choose an inquiry before opening its details." });
      return;
    }

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
  }, [inquiryId]);

  // H2.T8 / H3.T7 / H4-stub — Mirror the inbox list poll for the detail page.
  // While the viewed inquiry sits in any non-terminal negotiation/hold state,
  // refetch every 5s so the page flips forward without manual reload. Stops
  // automatically once status leaves the pending set (date_confirmed,
  // session_scheduled, declined, cancelled, etc.). Skips when the tab is
  // hidden. Polling failures are swallowed silently.
  //
  // payment_held is included so the prod path (where Stripe webhook flips
  // payment_held → session_scheduled out-of-band) surfaces within 5s. In dev
  // the auto-advance bridge skips through payment_held synchronously, so the
  // poll usually never runs against it.
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
      s === "payment_held"
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

        {/* H3.T7 — Stage-aware plan UI. Renders different surfaces
            depending on inquiry.status so the same detail page carries the
            traveller through propose → wait → confirm → confirmed without
            a route change. Statuses outside this chain (submitted /
            under_review / routed / declined / cancelled / payment / etc.)
            fall through with no extra UI; the existing detail surface and
            future H4-H6 panels cover them. */}
        {inquiry.status === "accepted" && !showWindowPicker && (
          <section className="plan-stage-cta" aria-label="Propose dates">
            <p className="eyebrow">Plan</p>
            <h2>{inquiry.companionDisplayName} accepted your inquiry.</h2>
            <p>Suggest 2 or 3 times that work. Your companion will pick one.</p>
            <div className="plan-stage-actions">
              <Button type="button" variant="primary" onClick={() => setShowWindowPicker(true)}>
                Propose dates
              </Button>
            </div>
          </section>
        )}

        {inquiry.status === "accepted" && showWindowPicker && (
          <DateWindowPicker
            inquiryId={inquiry.id}
            initialWindows={inquiry.travellerWindows}
            onSubmitted={(next) => {
              setShowWindowPicker(false);
              setState({ status: "ready", inquiry: next });
            }}
            onCancel={() => setShowWindowPicker(false)}
          />
        )}

        {inquiry.status === "date_pending" && (
          <section className="plan-stage-cta" aria-label="Waiting on companion">
            <p className="eyebrow">Plan</p>
            <h2>
              Waiting for {inquiry.companionDisplayName} to pick a window.
            </h2>
            <p>You proposed:</p>
            {inquiry.travellerWindows && inquiry.travellerWindows.length > 0 && (
              <ul className="plan-window-readonly-list">
                {inquiry.travellerWindows.map((window, index) => (
                  <li key={index}>
                    <p className="label">{formatWindowLabel(window)}</p>
                    {window.note && <p className="note">{window.note}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {inquiry.status === "date_proposed" && inquiry.companionSelectedWindow && (
          <>
            {showConfirmForm ? (
              <ConfirmPlanView
                inquiryId={inquiry.id}
                companionSelectedWindow={inquiry.companionSelectedWindow}
                companionDisplayName={inquiry.companionDisplayName}
                onSubmitted={(next) => {
                  setShowConfirmForm(false);
                  setState({ status: "ready", inquiry: next });
                }}
                onCancel={() => setShowConfirmForm(false)}
              />
            ) : (
              <section className="plan-stage-cta" aria-label="Confirm the picked window">
                <p className="eyebrow">Plan</p>
                <h2>{inquiry.companionDisplayName} picked a window.</h2>
                <p>Confirm to lock the plan — they can't proceed until you do.</p>
                <div className="plan-stage-actions">
                  <Button type="button" variant="primary" onClick={() => setShowConfirmForm(true)}>
                    Open confirm form
                  </Button>
                </div>
              </section>
            )}
          </>
        )}

        {inquiry.status === "date_confirmed" && inquiry.companionSelectedWindow && (
          <section className="plan-stage-confirmed" aria-label="Plan confirmed">
            <p className="eyebrow">Plan confirmed</p>
            <h2>{formatWindowLabel(inquiry.companionSelectedWindow)}</h2>
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
        {inquiry.status === "payment_held" && inquiry.companionSelectedWindow && (
          <section className="plan-stage-confirmed" aria-label="Booking held">
            <p className="eyebrow">Booking held</p>
            <h2>Your hold is in place.</h2>
            <p>{formatWindowLabel(inquiry.companionSelectedWindow)} (Bangkok local time)</p>
            {inquiry.heldAt && <p>Held on {formatDate(inquiry.heldAt)}.</p>}
            <p>Tirak will share day-of details closer to the session.</p>
          </section>
        )}

        {/* H4-stub — session_scheduled panel. Terminal state for H4-stub. H5
            will replace this with the real day-of itinerary view (meeting
            point, contact number, safety checklist). */}
        {inquiry.status === "session_scheduled" && inquiry.companionSelectedWindow && (
          <section className="plan-stage-confirmed plan-stage-scheduled" aria-label="Session scheduled">
            <p className="eyebrow">Session scheduled</p>
            <h2>{formatWindowLabel(inquiry.companionSelectedWindow)}</h2>
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
  );
}

// TODO(H3-followup): formatWindowLabel is duplicated across
// DateWindowPicker, WindowSelectionView, ConfirmPlanView, and now this page.
// Extract to shared/booking-utils.ts in a future polish pass — the sibling
// components all carry the same flag and v1 keeps the local copy on
// purpose to avoid expanding T7's surface area.
function formatWindowLabel(window: DateWindow): string {
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
  const startParts = startFmt.formatToParts(new Date(window.start));
  const endParts = endFmt.formatToParts(new Date(window.end));
  const get = (parts: Intl.DateTimeFormatPart[], type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get(startParts, "weekday");
  const day = get(startParts, "day");
  const month = get(startParts, "month");
  const startTime = `${get(startParts, "hour")}:${get(startParts, "minute")}`;
  const endTime = `${get(endParts, "hour")}:${get(endParts, "minute")}`;
  return `${weekday}, ${day} ${month} · ${startTime}–${endTime}`;
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
