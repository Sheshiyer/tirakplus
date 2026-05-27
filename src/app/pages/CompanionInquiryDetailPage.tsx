import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type {
  CompanionDeclineInquiryRequest,
  CompanionDeclineReasonCategory,
  CompanionSessionDetail,
  DateWindow,
} from "../../shared/contracts";
import { BookingApiError, BookingService } from "../api/booking";
import { MuseChartPanel } from "../components/muse/MuseChartPanel";
import { WindowSelectionView } from "../components/booking/WindowSelectionView";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";
import { Textarea } from "../components/ui/Textarea";

const POLL_INTERVAL_MS = 5000;

type LoadState =
  | { status: "loading"; data?: undefined; message?: undefined }
  | { status: "ready"; data: CompanionSessionDetail; message?: undefined }
  | { status: "error"; data?: undefined; message: string };

type ActionState = "idle" | "accepting" | "declining";

const DECLINE_REASON_OPTIONS: Array<{
  value: CompanionDeclineReasonCategory;
  label: string;
}> = [
  { value: "schedule", label: "Scheduling conflict" },
  { value: "privacy", label: "Privacy concern" },
  { value: "safety", label: "Safety reason" },
  { value: "other", label: "Other" },
];

const NOTES_MAX = 280;

export function CompanionInquiryDetailPage() {
  const { inquiryId } = useParams();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  // Decision UI state (only meaningful when state.status === "ready").
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState<CompanionDeclineReasonCategory | "">("");
  const [declineNotes, setDeclineNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusVariant, setStatusVariant] = useState<"info" | "error">("info");

  // H3.T8 — Stage-aware plan UI toggle.
  //   showWindowSelection: drives the "date_pending → pick a window" CTA →
  //     inline WindowSelectionView pattern. Defaults OPEN because once the
  //     traveller has proposed, picking is the only productive next move
  //     for the companion. Cancel collapses it into a smaller CTA card
  //     with a button to re-open. Mirrors showConfirmForm on the traveller
  //     side (H3.T7).
  const [showWindowSelection, setShowWindowSelection] = useState(true);

  const isPollingRef = useRef(false);

  useEffect(() => {
    if (!inquiryId) {
      setState({ status: "error", message: "Choose an inquiry before opening its details." });
      return;
    }

    let cancelled = false;
    BookingService.getCompanionInquiry(inquiryId)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
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

  // H3.T8 — Polling parity with TravellerInquiryDetailPage (H2.T8 + H3.T7).
  // While the inquiry sits in any non-terminal state where the OTHER party
  // is the next mover, refetch every 5s so the page transitions without a
  // manual reload. Polling stops automatically once status reaches a
  // terminal state (session_scheduled / declined / cancelled) or any state
  // where the companion holds the next action (date_pending).
  //
  //   routed         → waiting on companion's own decision — included so
  //                    a parallel session that accepts elsewhere reflects
  //                    here too (matches H2.T8 behavior).
  //   accepted       → waiting on traveller to propose dates.
  //   date_pending   → companion's turn, but a parallel session may have
  //                    already submitted; keep polling to catch the
  //                    transition to date_proposed.
  //   date_proposed  → waiting on traveller to confirm.
  //   payment_held   → H4-stub. Traveller has placed the payment hold;
  //                    in prod the Stripe webhook flips this to
  //                    session_scheduled out-of-band, so keep polling
  //                    so the companion sees the transition within 5s.
  //                    In dev/staging the auto-advance bridge skips
  //                    through this state synchronously so the panel
  //                    is rarely seen.
  //
  // hasPending is derived via useMemo so the polling effect keys on a
  // boolean rather than the whole state object — keeping the 5s cadence
  // steady across successful polls instead of resetting on every setState.
  const hasPending = useMemo(() => {
    if (state.status !== "ready") return false;
    const s = state.data.status;
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
        const inquiry = await BookingService.getCompanionInquiry(inquiryId);
        if (!cancelled) setState({ status: "ready", data: inquiry });
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

  if (state.status === "loading") {
    return (
      <section className="companion-page">
        <SkeletonCard />
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="companion-page">
        <FeedbackState
          variant="error"
          title="Inquiry unavailable"
          description={state.message}
          actionLabel="Back to inbox"
          onAction={() => window.location.assign("/companion/inbox")}
        />
      </section>
    );
  }

  const { data } = state;

  const handleAccept = async () => {
    if (!inquiryId || actionState !== "idle") return;
    setActionState("accepting");
    setFieldErrors({});
    setStatusMessage(null);
    try {
      const response = await BookingService.acceptInquiry(inquiryId);
      // Trust the server's canonical updated record.
      setState({ status: "ready", data: response.inquiry });
      setStatusVariant("info");
      setStatusMessage(response.message);
      setActionState("idle");
    } catch (error) {
      if (error instanceof BookingApiError) {
        setFieldErrors(error.fieldErrors || {});
        setStatusVariant("error");
        setStatusMessage(error.message);
      } else {
        setStatusVariant("error");
        setStatusMessage("Could not accept. Try again.");
      }
      setActionState("idle");
    }
  };

  const handleDeclineSubmit = async () => {
    if (!inquiryId || actionState !== "idle") return;
    if (!declineReason) {
      setFieldErrors({ reasonCategory: "Choose a reason to continue." });
      return;
    }
    setActionState("declining");
    setFieldErrors({});
    setStatusMessage(null);
    const payload: CompanionDeclineInquiryRequest = {
      reasonCategory: declineReason,
      ...(declineNotes.trim() ? { notes: declineNotes.trim() } : {}),
    };
    try {
      const response = await BookingService.declineInquiry(inquiryId, payload);
      setState({ status: "ready", data: response.inquiry });
      setStatusVariant("info");
      setStatusMessage(response.message);
      setShowDeclineForm(false);
      setDeclineReason("");
      setDeclineNotes("");
      setActionState("idle");
    } catch (error) {
      if (error instanceof BookingApiError) {
        setFieldErrors(error.fieldErrors || {});
        setStatusVariant("error");
        setStatusMessage(error.message);
      } else {
        setStatusVariant("error");
        setStatusMessage("Could not decline. Try again.");
      }
      setActionState("idle");
    }
  };

  const openDeclineForm = () => {
    if (actionState !== "idle") return;
    setShowDeclineForm(true);
    setStatusMessage(null);
    setFieldErrors({});
  };

  const cancelDeclineForm = () => {
    setShowDeclineForm(false);
    setDeclineReason("");
    setDeclineNotes("");
    setFieldErrors({});
  };

  const notesLen = declineNotes.length;
  const notesOver = notesLen > NOTES_MAX;

  return (
    <section className="companion-page companion-inquiry-detail-page" aria-labelledby="companion-inquiry-detail-title">
      <div className="member-hero">
        <div className="member-hero-copy">
          <p className="eyebrow">{data.status.replace(/_/g, " ")}</p>
          <h1 id="companion-inquiry-detail-title">{data.travellerLabel}</h1>
          <p>{data.travellerContext}</p>
          <div className="status-pill-row">
            <span>{data.city.replace(/-/g, " ")}</span>
            <span>{data.experience.replace(/-/g, " ")}</span>
            <span>{data.preferredWindow}</span>
          </div>
        </div>
        <aside className="member-route-support-card" aria-label="Muse inquiry support">
          <MuseChartPanel chart={data.museFit} compact />
          <div className="member-route-support-copy">
            <p className="eyebrow">Muse fit</p>
            <h2>{data.museFit.summary}</h2>
            <p>{data.museFit.nextPrompt}</p>
          </div>
        </aside>
      </div>

      <div className="member-bento-grid member-bento-grid-featured">
        {data.status !== "routed" && (
          <article className="member-bento-card member-bento-card-large">
            <p className="eyebrow">Decision options</p>
            <div className="decision-grid">
              {data.decisionOptions.map((option) => (
                <button key={option.value} className="decision-card" type="button">
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </article>
        )}

        <article className="member-bento-card">
          <p className="eyebrow">Review checklist</p>
          <div className="session-checklist">
            {data.checklist.map((item) => (
              <article key={item.label} className={`timeline-item timeline-item-${item.status}`}>
                <p className="meta">{item.status}</p>
                <h2>{item.label}</h2>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="member-bento-card">
          <p className="eyebrow">Muse reply help</p>
          <div className="message-thread">
            {data.messageThread.map((message) => (
              <p key={message.id} className={`message-bubble message-bubble-${message.role}`}>
                {message.content}
              </p>
            ))}
          </div>
        </article>
      </div>

      <section className="member-bento-card member-safety-panel">
        <div>
          <p className="eyebrow">Payment and privacy</p>
          <h2>{data.paymentState.status.replace(/_/g, " ")}</h2>
          <p>{data.paymentState.note}</p>
        </div>
        <p>{data.privacyNote}</p>
      </section>

      {/* H2.T6 — Decision surface. Branches by inquiry.status. */}
      {data.status === "routed" && !showDeclineForm && (
        <section className="companion-decision-panel" aria-label="Respond to this inquiry">
          <div className="companion-decision-actions">
            <Button
              type="button"
              variant="primary"
              onClick={handleAccept}
              disabled={actionState !== "idle"}
            >
              {actionState === "accepting" ? "Accepting..." : "Accept"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={openDeclineForm}
              disabled={actionState !== "idle"}
            >
              Decline
            </Button>
          </div>
          {statusMessage && (
            <p
              className={`companion-decision-status${
                statusVariant === "error" ? " companion-decision-status-error" : ""
              }`}
              role={statusVariant === "error" ? "alert" : "status"}
              aria-live={statusVariant === "error" ? "assertive" : "polite"}
            >
              {statusMessage}
            </p>
          )}
        </section>
      )}

      {data.status === "routed" && showDeclineForm && (
        <section className="companion-decision-panel companion-decline-form" aria-label="Decline this inquiry">
          <header>
            <h2>Decline this inquiry</h2>
            <p>Tirak shares only the reason category with the traveller — your notes stay internal.</p>
          </header>

          <fieldset className="companion-decline-reasons">
            <legend className="field-label">Reason</legend>
            {DECLINE_REASON_OPTIONS.map((option) => (
              <label key={option.value} className="companion-decline-reason">
                <input
                  type="radio"
                  name="decline-reason"
                  value={option.value}
                  checked={declineReason === option.value}
                  onChange={() => {
                    setDeclineReason(option.value);
                    if (fieldErrors.reasonCategory) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.reasonCategory;
                        return next;
                      });
                    }
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
            {fieldErrors.reasonCategory && (
              <p className="field-error">{fieldErrors.reasonCategory}</p>
            )}
          </fieldset>

          <Textarea
            label="Notes (optional)"
            value={declineNotes}
            onChange={(event) => setDeclineNotes(event.target.value)}
            maxLength={NOTES_MAX}
            error={fieldErrors.notes}
            helperText={
              <span className={notesOver ? "companion-decline-notes-over" : undefined}>
                {notesLen}/{NOTES_MAX} characters
              </span>
            }
          />

          <div className="companion-decision-actions">
            <Button
              type="button"
              variant="danger"
              onClick={handleDeclineSubmit}
              disabled={actionState !== "idle" || !declineReason || notesOver}
            >
              {actionState === "declining" ? "Declining..." : "Submit decline"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={cancelDeclineForm}
              disabled={actionState !== "idle"}
            >
              Cancel
            </Button>
          </div>

          {statusMessage && (
            <p
              className={`companion-decision-status${
                statusVariant === "error" ? " companion-decision-status-error" : ""
              }`}
              role={statusVariant === "error" ? "alert" : "status"}
              aria-live={statusVariant === "error" ? "assertive" : "polite"}
            >
              {statusMessage}
            </p>
          )}
        </section>
      )}

      {/* H3.T8 — Stage-aware plan UI. Renders different surfaces depending
          on data.status so the companion is carried through accept →
          await-proposal → pick → await-confirm → confirmed without a
          route change. Mirrors the traveller-side H3.T7 layout but from
          the receiving angle. The H2.T5 declined/accepted panels below
          remain the post-decision baseline; these branches are additive
          plan UI overlaid on top. */}
      {data.status === "accepted" && (
        <section className="plan-stage-cta" aria-label="Waiting on traveller">
          <p className="eyebrow">Plan</p>
          <h2>Waiting for {data.travellerLabel} to propose dates.</h2>
          <p>You accepted this inquiry. The traveller will share their preferred windows soon.</p>
        </section>
      )}

      {data.status === "date_pending" && data.travellerWindows && data.travellerWindows.length > 0 && (
        showWindowSelection ? (
          <WindowSelectionView
            inquiryId={data.id}
            travellerWindows={data.travellerWindows}
            onSubmitted={(next) => {
              setShowWindowSelection(false);
              setState({ status: "ready", data: next });
            }}
            onCancel={() => setShowWindowSelection(false)}
          />
        ) : (
          <section className="plan-stage-cta" aria-label="Pick a window">
            <p className="eyebrow">Plan</p>
            <h2>
              The traveller proposed {data.travellerWindows.length} window
              {data.travellerWindows.length === 1 ? "" : "s"}.
            </h2>
            <p>Pick the one that works best for you.</p>
            <div className="plan-stage-actions">
              <Button type="button" variant="primary" onClick={() => setShowWindowSelection(true)}>
                Pick a window
              </Button>
            </div>
          </section>
        )
      )}

      {data.status === "date_proposed" && data.companionSelectedWindow && (
        <section className="plan-stage-cta" aria-label="Waiting for traveller to confirm">
          <p className="eyebrow">Plan</p>
          <h2>Waiting for {data.travellerLabel} to confirm.</h2>
          <p>You picked:</p>
          <ul className="plan-window-readonly-list">
            <li>
              <p className="label">{formatWindowLabel(data.companionSelectedWindow)}</p>
              {data.companionSelectedWindow.note && (
                <p className="note">{data.companionSelectedWindow.note}</p>
              )}
            </li>
          </ul>
        </section>
      )}

      {data.status === "date_confirmed" && data.companionSelectedWindow && (
        <section className="plan-stage-confirmed" aria-label="Plan confirmed">
          <p className="eyebrow">Plan confirmed</p>
          <h2>{formatWindowLabel(data.companionSelectedWindow)}</h2>
          <p>
            Bangkok local time
            {typeof data.durationMinutes === "number"
              ? ` · ${formatDurationHours(data.durationMinutes)}`
              : ""}
            .
          </p>
          {data.confirmedAt && <p>Confirmed on {formatDate(data.confirmedAt)}.</p>}
          <p>Tirak will surface day-of details closer to the date.</p>
        </section>
      )}

      {/* H4-stub — payment_held panel. Read-only confirmation for the
          companion that the traveller placed the hold. No CTA on this side
          (the traveller is the actor). In prod this state persists until
          the Stripe webhook flips it to session_scheduled; the hasPending
          memo above keeps polling so the transition surfaces within 5s.
          In dev/staging the auto-advance bridge skips this state
          synchronously, so this panel is rarely seen. */}
      {data.status === "payment_held" && data.companionSelectedWindow && (
        <section className="plan-stage-confirmed" aria-label="Traveller placed hold">
          <p className="eyebrow">Booking held</p>
          <h2>{data.travellerLabel} placed a hold.</h2>
          <p>{formatWindowLabel(data.companionSelectedWindow)} (Bangkok local time)</p>
          {data.heldAt && <p>Held on {formatDate(data.heldAt)}.</p>}
          <p>Tirak will surface day-of details for both of you closer to the session.</p>
        </section>
      )}

      {/* H4-stub — session_scheduled panel. Terminal state for H4-stub. H5
          will replace this with the day-of details surface. Mirrors the
          traveller-side panel from commit 2ba6b0d. */}
      {data.status === "session_scheduled" && data.companionSelectedWindow && (
        <section className="plan-stage-confirmed plan-stage-scheduled" aria-label="Session scheduled">
          <p className="eyebrow">Session scheduled</p>
          <h2>{formatWindowLabel(data.companionSelectedWindow)}</h2>
          <p>
            Bangkok local time
            {typeof data.durationMinutes === "number"
              ? ` · ${formatDurationHours(data.durationMinutes)}`
              : ""}
            .
          </p>
          {data.heldAt && <p>Hold placed on {formatDate(data.heldAt)}.</p>}
          <p>Day-of details will appear here closer to the session.</p>
        </section>
      )}

      {data.status === "accepted" && (
        <section className="companion-decision-panel companion-decision-accepted" aria-label="Accepted">
          <p className="eyebrow">Accepted</p>
          <h2>You accepted this inquiry{data.acceptedAt ? ` on ${formatDate(data.acceptedAt)}` : ""}.</h2>
          <p>Next: agree on a date with the traveller. Date negotiation opens in the next step.</p>
        </section>
      )}

      {data.status === "declined" && (
        <section className="companion-decision-panel companion-decision-declined" aria-label="Declined">
          <p className="eyebrow">Declined</p>
          <h2>
            You declined this inquiry
            {data.declinedAt ? ` on ${formatDate(data.declinedAt)}` : ""}.
          </h2>
          {data.declineReasonLabel && (
            <p>
              <strong>Reason:</strong> {data.declineReasonLabel}
            </p>
          )}
          {data.declineNotes && (
            <p>
              <strong>Note:</strong> {data.declineNotes}
            </p>
          )}
        </section>
      )}

      <div className="action-row">
        <Button as={Link} to="/companion/inbox" variant="secondary">
          Back to inbox
        </Button>
        <Button as={Link} to="/companion/plans" variant="secondary">
          Availability
        </Button>
      </div>
    </section>
  );
}

// TODO(H3-followup): formatWindowLabel / formatDate / formatDurationHours
// are duplicated across DateWindowPicker, WindowSelectionView,
// ConfirmPlanView, TravellerInquiryDetailPage, and now this page. Extract
// to shared/booking-utils.ts in a future polish pass — the sibling
// components all carry the same flag and v1 keeps the local copy on
// purpose to avoid expanding T8's surface area.
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

// "3 hours" / "1 hour" / "1 hour 30 min". Used by the date_confirmed
// panel so the companion can sanity-check the locked duration at a
// glance.
function formatDurationHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const hourWord = hours === 1 ? "hour" : "hours";
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} ${hourWord}`;
  return `${hours} ${hourWord} ${mins} min`;
}
