// WindowSelectionView.tsx — Pass H Sub-pass H3.Task 5.
//
// Companion-facing UI that lets a user pick exactly one of the 2-3 date
// windows the traveller proposed. Sibling of DateWindowPicker — that file
// is the traveller's *propose* side; this one is the companion's *select*
// side. Both display Bangkok local time (decision D2) and stay router-
// agnostic so the page (T8) can wrap them as needed.
//
// We deliberately do NOT pre-select a window: the companion has to make
// an active choice, mirroring how H2.T6 forces a decline reason instead
// of defaulting one. The submit button stays disabled until selectedIndex
// becomes non-null. The server is still authoritative on whether the
// picked window structurally matches one the traveller submitted.
//
// Wiring into CompanionInquiryDetailPage is deferred to H3.Task 8.

import { FormEvent, useState } from "react";
import type {
  CompanionSessionDetail,
  DateWindow,
  PlanWindowSelectionRequest,
} from "../../../shared/contracts";
import { BookingApiError, BookingService } from "../../api/booking";
import { Button } from "../ui/Button";

export type WindowSelectionViewProps = {
  inquiryId: string;
  // Pre-validated 2-3 windows from booking.travellerWindows. We trust the
  // caller (the detail page) to only mount this view once the inquiry is
  // in date_pending state with a populated array; we don't re-check here.
  travellerWindows: DateWindow[];
  onSubmitted: (inquiry: CompanionSessionDetail) => void;
  onCancel: () => void;
};

type ActionState = "idle" | "submitting" | "submitted" | "error";

// Renders a window as "Sat, 14 June · 18:00–20:00" in Asia/Bangkok local
// time. The start formatter carries the weekday/day/month; the end one
// only needs hour+minute. Thailand observes UTC+7 year-round (no DST), so
// the Intl call is deterministic.
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

export function WindowSelectionView(props: WindowSelectionViewProps) {
  const { inquiryId, travellerWindows, onSubmitted, onCancel } = props;

  // null = no choice yet. We block submit until this is a number so the
  // companion can't accidentally fire off a default pick. Mirrors H2.T6
  // decline-reason gating.
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submitting = actionState === "submitting";
  const canSubmit = selectedIndex !== null && !submitting;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedIndex === null) return;

    const selectedWindow = travellerWindows[selectedIndex];
    if (!selectedWindow) {
      // Defensive: index drifted out of bounds. Surface a generic error
      // rather than silently no-op so we don't strand the user.
      setActionState("error");
      setStatusMessage("Could not submit. Try again.");
      return;
    }

    setActionState("submitting");
    setStatusMessage(null);
    setFieldErrors({});

    const payload: PlanWindowSelectionRequest = { selectedWindow };

    try {
      const response = await BookingService.selectPlanWindow(inquiryId, payload);
      setActionState("submitted");
      setStatusMessage(response.message);
      onSubmitted(response.inquiry);
    } catch (err) {
      setActionState("error");
      if (err instanceof BookingApiError) {
        // Server surfaces selectedWindow errors here (structural mismatch,
        // window not in proposed set, etc.). We render the most relevant
        // one inline near the radio group; the message goes in the status
        // line so the user gets both human-readable context and the field
        // hint at the same time.
        setFieldErrors(err.fieldErrors || {});
        setStatusMessage(err.message || "Could not submit. Try again.");
      } else {
        setStatusMessage("Could not submit. Try again.");
      }
    }
  };

  const selectedWindowError = fieldErrors.selectedWindow;

  return (
    <section className="window-selection-view" aria-labelledby="window-selection-view-title">
      <header className="window-selection-header">
        <p className="eyebrow">Pick a window</p>
        <h2 id="window-selection-view-title">Pick a window</h2>
        <p>
          The traveller proposed these times. Pick one that works for you. They&rsquo;ll
          confirm on their end.
        </p>
        <p className="window-selection-tz">Times shown in Bangkok local time.</p>
      </header>

      <form className="window-selection-body" onSubmit={submit} noValidate>
        <fieldset className="window-selection-list">
          <legend className="field-label">Proposed windows</legend>
          {travellerWindows.map((window, index) => {
            const label = formatWindowLabel(window);
            return (
              <label
                key={`${window.start}-${index}`}
                className="window-selection-option"
              >
                <input
                  type="radio"
                  name="window-selection"
                  value={index}
                  checked={selectedIndex === index}
                  disabled={submitting}
                  onChange={() => {
                    setSelectedIndex(index);
                    if (fieldErrors.selectedWindow) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.selectedWindow;
                        return next;
                      });
                    }
                  }}
                />
                <span className="window-selection-option-body">
                  <span className="window-selection-option-label">{label}</span>
                  {window.note && (
                    <span className="window-selection-option-note">{window.note}</span>
                  )}
                </span>
              </label>
            );
          })}
          {selectedWindowError && (
            <p className="field-error" role="alert">{selectedWindowError}</p>
          )}
        </fieldset>

        <div className="window-selection-actions">
          <Button type="submit" variant="primary" disabled={!canSubmit}>
            {submitting ? "Submitting..." : "Pick this window"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>

        {statusMessage && (
          <p
            className={
              actionState === "error"
                ? "window-selection-status window-selection-status-error"
                : "window-selection-status"
            }
            role={actionState === "error" ? "alert" : "status"}
          >
            {statusMessage}
          </p>
        )}
      </form>
    </section>
  );
}
