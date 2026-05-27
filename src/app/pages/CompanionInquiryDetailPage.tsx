import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type {
  CompanionDeclineInquiryRequest,
  CompanionDeclineReasonCategory,
  CompanionSessionDetail,
} from "../../shared/contracts";
import { BookingApiError, BookingService } from "../api/booking";
import { MuseChartPanel } from "../components/muse/MuseChartPanel";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";
import { Textarea } from "../components/ui/Textarea";

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
            >
              {statusMessage}
            </p>
          )}
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
