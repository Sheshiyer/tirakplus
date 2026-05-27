// DateWindowPicker.tsx — Pass H Sub-pass H3.Task 4.
//
// Traveller-facing UI that lets a user propose 2-3 candidate date windows for
// a session after the companion has accepted their inquiry. Uses native HTML
// date + time inputs (decision D1) and displays times in Bangkok TZ (decision
// D2; Thailand observes UTC+7 year-round with no DST). On submit we convert
// each draft to an ISO datetime in UTC and post via BookingService.
//
// Wiring into TravellerInquiryDetailPage is deferred to H3.Task 7. This file
// stays page-agnostic: it takes inquiryId + callbacks and stays out of the
// router. Server is still authoritative on window count + duration bounds.

import { FormEvent, useState } from "react";
import type {
  DateWindow,
  PlanWindowsRequest,
  TravellerInquiryDetail,
} from "../../../shared/contracts";
import { BookingApiError, BookingService } from "../../api/booking";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export type DateWindowPickerProps = {
  inquiryId: string;
  initialWindows?: DateWindow[];
  onSubmitted: (inquiry: TravellerInquiryDetail) => void;
  onCancel: () => void;
};

// In-progress shape held in component state. We keep the date + times split
// because native <input type="date"> and <input type="time"> each expect one
// half of the ISO string. We re-assemble on submit (draftToDateWindow).
type WindowDraft = {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  note: string;
};

type ActionState = "idle" | "submitting" | "submitted" | "error";

// Thailand is UTC+7 year-round (no DST). Hardcoding the offset is safe for
// v1 — a future "user's local TZ" mode would compute this dynamically.
const BANGKOK_OFFSET = "+07:00";

const MIN_WINDOWS = 2;
const MAX_WINDOWS = 3;
const NOTE_MAX_LENGTH = 120;

function emptyDraft(): WindowDraft {
  return { date: "", startTime: "", endTime: "", note: "" };
}

function draftToDateWindow(draft: WindowDraft): DateWindow {
  // Build an ISO string anchored to Bangkok local time, then normalise to UTC
  // via toISOString() so the server can store it canonically. The Date ctor
  // is lenient and accepts `YYYY-MM-DDTHH:MM:00+07:00` directly.
  const startIso = new Date(`${draft.date}T${draft.startTime}:00${BANGKOK_OFFSET}`).toISOString();
  const endIso = new Date(`${draft.date}T${draft.endTime}:00${BANGKOK_OFFSET}`).toISOString();
  return {
    start: startIso,
    end: endIso,
    note: draft.note.trim() || undefined,
  };
}

function dateWindowToDraft(window: DateWindow): WindowDraft {
  // The wire format is UTC ISO — convert back to a Bangkok-local
  // YYYY-MM-DD + HH:MM pair so the inputs reflect what the user originally
  // saw. Intl.DateTimeFormat with timeZone: "Asia/Bangkok" handles the math.
  const startDate = new Date(window.start);
  const startFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const startParts = startFmt.formatToParts(startDate);
  const get = (type: string) => startParts.find((p) => p.type === type)?.value ?? "";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const startTime = `${get("hour")}:${get("minute")}`;

  const endFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const endParts = endFmt.formatToParts(new Date(window.end));
  const endHour = endParts.find((p) => p.type === "hour")?.value ?? "";
  const endMin = endParts.find((p) => p.type === "minute")?.value ?? "";
  const endTime = `${endHour}:${endMin}`;

  return { date, startTime, endTime, note: window.note ?? "" };
}

function initialDrafts(initialWindows?: DateWindow[]): WindowDraft[] {
  if (initialWindows && initialWindows.length >= MIN_WINDOWS) {
    return initialWindows.slice(0, MAX_WINDOWS).map(dateWindowToDraft);
  }
  // First open: start with the minimum allowed count of empty drafts.
  return [emptyDraft(), emptyDraft()];
}

export function DateWindowPicker(props: DateWindowPickerProps) {
  const { inquiryId, initialWindows, onSubmitted, onCancel } = props;

  const [drafts, setDrafts] = useState<WindowDraft[]>(() => initialDrafts(initialWindows));
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submitting = actionState === "submitting";

  const updateDraft = (index: number, patch: Partial<WindowDraft>) => {
    setDrafts((current) =>
      current.map((draft, i) => (i === index ? { ...draft, ...patch } : draft)),
    );
  };

  const addWindow = () => {
    if (drafts.length >= MAX_WINDOWS) return;
    setDrafts((current) => [...current, emptyDraft()]);
  };

  const removeWindow = (index: number) => {
    if (drafts.length <= MIN_WINDOWS) return;
    setDrafts((current) => current.filter((_, i) => i !== index));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Local validation: each row needs date + start + end before we even try
    // the server. The server enforces duration bounds and minimum lead time;
    // we keep the client check shallow on purpose so error messages stay
    // server-driven (BookingApiError.fieldErrors).
    const nextErrors: Record<string, string> = {};
    drafts.forEach((draft, index) => {
      if (!draft.date) {
        nextErrors[`windows.${index}.date`] = "Pick a date.";
      }
      if (!draft.startTime) {
        nextErrors[`windows.${index}.start`] = "Pick a start time.";
      }
      if (!draft.endTime) {
        nextErrors[`windows.${index}.end`] = "Pick an end time.";
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setActionState("error");
      setStatusMessage("Please complete every window before submitting.");
      return;
    }

    setActionState("submitting");
    setStatusMessage(null);
    setFieldErrors({});

    const payload: PlanWindowsRequest = {
      windows: drafts.map(draftToDateWindow),
    };

    try {
      const response = await BookingService.submitPlanWindows(inquiryId, payload);
      setActionState("submitted");
      setStatusMessage(response.message);
      onSubmitted(response.inquiry);
    } catch (err) {
      setActionState("error");
      if (err instanceof BookingApiError) {
        setFieldErrors(err.fieldErrors || {});
        setStatusMessage(err.message || "Could not submit. Try again.");
      } else {
        setStatusMessage("Could not submit. Try again.");
      }
    }
  };

  const canRemove = drafts.length > MIN_WINDOWS;
  const canAdd = drafts.length < MAX_WINDOWS;

  return (
    <section className="date-window-picker" aria-labelledby="date-window-picker-title">
      <header className="date-window-picker-header">
        <p className="eyebrow">Propose your windows</p>
        <h2 id="date-window-picker-title">Propose 2 or 3 date windows</h2>
        <p>Pick a few times that work for you. Your companion will choose one.</p>
        <p className="date-window-picker-tz">Times are in Bangkok local time.</p>
      </header>

      <form className="date-window-picker-body" onSubmit={submit} noValidate>
        <ol className="date-window-picker-list">
          {drafts.map((draft, index) => {
            const dateError = fieldErrors[`windows.${index}.date`];
            const startError = fieldErrors[`windows.${index}.start`];
            const endError = fieldErrors[`windows.${index}.end`];
            const noteError = fieldErrors[`windows.${index}.note`];
            return (
              <li key={index} className="date-window-card">
                <header className="date-window-card-header">
                  <h3>Window {index + 1}</h3>
                  {canRemove && (
                    <button
                      type="button"
                      className="date-window-remove"
                      onClick={() => removeWindow(index)}
                      disabled={submitting}
                    >
                      Remove
                    </button>
                  )}
                </header>

                <Input
                  type="date"
                  label="Date"
                  value={draft.date}
                  onChange={(event) => updateDraft(index, { date: event.target.value })}
                  placeholder="YYYY-MM-DD"
                  error={dateError}
                  disabled={submitting}
                  autoComplete="off"
                />

                <div className="date-window-time-row">
                  <Input
                    type="time"
                    label="Start"
                    value={draft.startTime}
                    onChange={(event) => updateDraft(index, { startTime: event.target.value })}
                    error={startError}
                    disabled={submitting}
                    autoComplete="off"
                  />
                  <Input
                    type="time"
                    label="End"
                    value={draft.endTime}
                    onChange={(event) => updateDraft(index, { endTime: event.target.value })}
                    error={endError}
                    disabled={submitting}
                    autoComplete="off"
                  />
                </div>

                <Input
                  label="Note (optional)"
                  value={draft.note}
                  onChange={(event) =>
                    updateDraft(index, { note: event.target.value.slice(0, NOTE_MAX_LENGTH) })
                  }
                  placeholder="evening only"
                  helperText={`Up to ${NOTE_MAX_LENGTH} characters.`}
                  error={noteError}
                  disabled={submitting}
                  autoComplete="off"
                  maxLength={NOTE_MAX_LENGTH}
                />
              </li>
            );
          })}
        </ol>

        {canAdd && (
          <button
            type="button"
            className="date-window-add"
            onClick={addWindow}
            disabled={submitting}
          >
            + Add window
          </button>
        )}

        <div className="date-window-picker-actions">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit windows"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        </div>

        {statusMessage && (
          <p
            className={
              actionState === "error"
                ? "date-window-picker-status date-window-picker-status-error"
                : "date-window-picker-status"
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
