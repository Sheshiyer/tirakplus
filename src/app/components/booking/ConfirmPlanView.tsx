// ConfirmPlanView.tsx — Pass H Sub-pass H3.Task 6.
//
// Traveller-facing UI shown once the companion has picked one of the
// traveller's proposed windows. Last step in the H3 chain:
//   T4 DateWindowPicker      (traveller: propose 2-3)
//   T5 WindowSelectionView   (companion: pick one)
//   T6 ConfirmPlanView       (traveller: confirm)  <- THIS
//
// Read-only display of the companion-selected window + a single Confirm
// button. No selection, no input — per decision D4 the traveller can't
// reject the picked window in v1 (server enforces date_proposed →
// date_confirmed only). Cancel is a UI-level back action and never hits
// the server. Wiring into TravellerInquiryDetailPage is deferred to T7.
//
// Times display in Bangkok local time (decision D2) to match T4/T5.

import { FormEvent, useState } from "react";
import type {
  DateWindow,
  TravellerInquiryDetail,
} from "../../../shared/contracts";
import { BookingApiError, BookingService } from "../../api/booking";
import { Button } from "../ui/Button";

export type ConfirmPlanViewProps = {
  inquiryId: string;
  // The window the companion picked. Caller (detail page) is responsible
  // for only mounting this view once inquiry.status === "date_proposed"
  // and companionSelectedWindow is populated — we don't re-check here.
  companionSelectedWindow: DateWindow;
  companionDisplayName: string;
  onSubmitted: (inquiry: TravellerInquiryDetail) => void;
  onCancel: () => void;
};

type ActionState = "idle" | "submitting" | "submitted" | "error";

// Renders a window as "Sat, 14 June · 18:00–20:00" in Asia/Bangkok local
// time. Thailand is UTC+7 year-round (no DST), so Intl is deterministic.
// NOTE: duplicated from WindowSelectionView for now — a future polish
// pass can extract both into shared/booking-utils.ts (T6 keeps the
// surface intentionally minimal).
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

// Returns "3 hours" / "1 hour" / "1 hour 30 min" — used as a small
// affordance under the window label so the traveller can sanity-check
// the picked duration matches what they had in mind.
function formatWindowDurationHuman(window: DateWindow): string {
  const totalMinutes = Math.round(
    (Date.parse(window.end) - Date.parse(window.start)) / 60000,
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hourWord = hours === 1 ? "hour" : "hours";
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} ${hourWord}`;
  return `${hours} ${hourWord} ${minutes} min`;
}

export function ConfirmPlanView(props: ConfirmPlanViewProps) {
  const {
    inquiryId,
    companionSelectedWindow,
    companionDisplayName,
    onSubmitted,
    onCancel,
  } = props;

  const [actionState, setActionState] = useState<ActionState>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const submitting = actionState === "submitting";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setActionState("submitting");
    setStatusMessage(null);

    try {
      const response = await BookingService.confirmPlan(inquiryId);
      setActionState("submitted");
      setStatusMessage(response.message);
      onSubmitted(response.inquiry);
    } catch (err) {
      setActionState("error");
      if (err instanceof BookingApiError) {
        // confirmPlan takes no body so there are no fieldErrors worth
        // surfacing inline — server-side rejections (wrong status, no
        // selected window, etc.) all collapse to the message string.
        setStatusMessage(err.message || "Could not confirm. Try again.");
      } else {
        setStatusMessage("Could not confirm. Try again.");
      }
    }
  };

  const windowLabel = formatWindowLabel(companionSelectedWindow);
  const windowDuration = formatWindowDurationHuman(companionSelectedWindow);

  return (
    <section className="confirm-plan-view" aria-labelledby="confirm-plan-view-title">
      <header className="confirm-plan-view-header">
        <p className="eyebrow">Confirm your plan</p>
        <h2 id="confirm-plan-view-title">
          {companionDisplayName} picked this window
        </h2>
        <p>
          Confirming locks the time. Tirak will surface day-of details closer
          to the date.
        </p>
        <p className="confirm-plan-view-tz">Time shown in Bangkok local time.</p>
      </header>

      <form className="confirm-plan-view-body" onSubmit={submit} noValidate>
        <div className="confirm-plan-window-card" aria-live="polite">
          <span className="label">{windowLabel}</span>
          {companionSelectedWindow.note && (
            <span className="note">{companionSelectedWindow.note}</span>
          )}
          <span className="duration">{windowDuration} window</span>
        </div>

        <div className="confirm-plan-view-actions">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Confirming..." : "Confirm plan"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Back to detail
          </Button>
        </div>

        {statusMessage && (
          <p
            className={
              actionState === "error"
                ? "confirm-plan-view-status confirm-plan-view-status-error"
                : "confirm-plan-view-status"
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
