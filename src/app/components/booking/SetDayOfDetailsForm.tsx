// SetDayOfDetailsForm.tsx — Pass H Sub-pass H5.Task 3.
//
// Companion-facing form used to set (or edit) the day-of details for a
// confirmed session: meeting point + day-of contact number + up to 5
// short safety/logistics notes. Mounted from the companion's plan/session
// detail page once the booking has reached date_confirmed (and remains
// editable through session_completed per server contract).
//
// Pattern alignment:
//   - DateWindowPicker (H3.T4) — add/remove list pattern is reused here
//     for dayOfNotes (windows there, notes here).
//   - ConfirmPlanView   (H3.T6) — form-with-action pattern (header,
//     <form> body, actions row, status message).
//
// All caps are enforced server-side (SetDayOfDetailsRequest: meetingPoint
// ≤ 280, contactNumber ≤ 40, dayOfNotes max 5 × ≤ 200). We mirror them
// client-side as UX cues only — server is authoritative and any rejection
// surfaces inline via BookingApiError.fieldErrors.
//
// Wiring into the companion plan/detail page is deferred to H5.Task 5.
// This file stays page-agnostic: it takes inquiryId + initial values +
// callbacks and stays out of the router.

import { FormEvent, useState } from "react";
import type {
  CompanionSessionDetail,
  SetDayOfDetailsRequest,
} from "../../../shared/contracts";
import { BookingApiError, BookingService } from "../../api/booking";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";

export type SetDayOfDetailsFormProps = {
  inquiryId: string;
  initial: {
    meetingPoint?: string;
    contactNumber?: string;
    dayOfNotes?: string[];
  };
  onSubmitted: (inquiry: CompanionSessionDetail) => void;
  onCancel: () => void;
};

type ActionState = "idle" | "submitting" | "submitted" | "error";

// Caps mirror the server contract (SetDayOfDetailsRequest). Kept as
// module-level constants so they're easy to find + audit alongside the
// matching server validator.
const MEETING_POINT_MAX = 280;
const CONTACT_NUMBER_MAX = 40;
const NOTE_MAX_LENGTH = 200;
const MAX_NOTES = 5;

export function SetDayOfDetailsForm(props: SetDayOfDetailsFormProps) {
  const { inquiryId, initial, onSubmitted, onCancel } = props;

  const [meetingPoint, setMeetingPoint] = useState<string>(initial.meetingPoint ?? "");
  const [contactNumber, setContactNumber] = useState<string>(initial.contactNumber ?? "");
  // dayOfNotes is `string[]`; start with whatever the inquiry already has
  // (so the form doubles as an edit surface) or an empty list. We do NOT
  // pre-fill an empty slot — the companion has to tap "+ Add note" to opt
  // in, mirroring the optional-by-design server contract.
  const [dayOfNotes, setDayOfNotes] = useState<string[]>(() =>
    initial.dayOfNotes ? [...initial.dayOfNotes] : [],
  );
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submitting = actionState === "submitting";

  const updateNote = (index: number, value: string) => {
    setDayOfNotes((current) =>
      current.map((note, i) => (i === index ? value : note)),
    );
  };

  const addNote = () => {
    // Internal guard mirrors the hidden-when-full button — defence in
    // depth so a stale render or keyboard shortcut can't bypass the cap.
    if (dayOfNotes.length >= MAX_NOTES) return;
    setDayOfNotes((current) => [...current, ""]);
  };

  const removeNote = (index: number) => {
    setDayOfNotes((current) => current.filter((_, i) => i !== index));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Local validation: caps only. Server enforces the same — these are
    // UX-side cues so the companion sees the error before the round trip.
    // Empty strings are NOT errors; they collapse to `undefined` in the
    // payload below (server contract has all three fields optional).
    const nextErrors: Record<string, string> = {};
    if (meetingPoint.length > MEETING_POINT_MAX) {
      nextErrors.meetingPoint = `Keep this under ${MEETING_POINT_MAX} characters.`;
    }
    if (contactNumber.length > CONTACT_NUMBER_MAX) {
      nextErrors.contactNumber = `Keep this under ${CONTACT_NUMBER_MAX} characters.`;
    }
    dayOfNotes.forEach((note, index) => {
      if (note.length > NOTE_MAX_LENGTH) {
        nextErrors[`dayOfNotes.${index}`] = `Keep this under ${NOTE_MAX_LENGTH} characters.`;
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setActionState("error");
      setStatusMessage("Please tidy up the highlighted fields and try again.");
      return;
    }

    setActionState("submitting");
    setStatusMessage(null);
    setFieldErrors({});

    // Build the payload. Trim whitespace + collapse empty strings to
    // `undefined` so the server sees a clean signal (and so re-saving an
    // unchanged form doesn't blank out a previously-set field with "").
    // For notes we drop fully-empty entries before mapping — the
    // companion can leave a half-typed row when they cancel a thought.
    const payload: SetDayOfDetailsRequest = {
      meetingPoint: meetingPoint.trim() || undefined,
      contactNumber: contactNumber.trim() || undefined,
      dayOfNotes: dayOfNotes
        .filter((note) => note.trim().length > 0)
        .map((note) => note.trim()),
    };

    try {
      const response = await BookingService.setDayOfDetails(inquiryId, payload);
      setActionState("submitted");
      setStatusMessage(response.message);
      onSubmitted(response.inquiry);
    } catch (err) {
      setActionState("error");
      if (err instanceof BookingApiError) {
        // Server keys match our client keys (meetingPoint, contactNumber,
        // dayOfNotes.{index}) so we can hand the map straight to inputs.
        setFieldErrors(err.fieldErrors || {});
        setStatusMessage(err.message || "Could not save day-of details. Try again.");
      } else {
        setStatusMessage("Could not save day-of details. Try again.");
      }
    }
  };

  const canAddNote = dayOfNotes.length < MAX_NOTES;
  const meetingPointHelper = `${meetingPoint.length}/${MEETING_POINT_MAX} characters · Address or landmark`;

  return (
    <section className="day-of-details-form" aria-labelledby="day-of-details-form-title">
      <header className="day-of-details-header">
        <p className="eyebrow">Day-of details</p>
        <h2 id="day-of-details-form-title">
          Set the meeting point + how the traveller reaches you
        </h2>
        <p>These details surface to both of you 24 hours before the session.</p>
      </header>

      <form className="day-of-details-body" onSubmit={submit} noValidate>
        <Textarea
          label="Meeting point"
          value={meetingPoint}
          onChange={(event) =>
            setMeetingPoint(event.target.value.slice(0, MEETING_POINT_MAX))
          }
          placeholder="e.g. lobby of The Standard Bangkok, Mahanakhon"
          helperText={meetingPointHelper}
          error={fieldErrors.meetingPoint}
          disabled={submitting}
          rows={3}
          maxLength={MEETING_POINT_MAX}
          autoComplete="off"
        />

        <Input
          type="tel"
          label="Contact number"
          value={contactNumber}
          onChange={(event) =>
            setContactNumber(event.target.value.slice(0, CONTACT_NUMBER_MAX))
          }
          placeholder="+66 8 1234 5678"
          helperText="Will be a tap-to-call link for the traveller."
          error={fieldErrors.contactNumber}
          disabled={submitting}
          maxLength={CONTACT_NUMBER_MAX}
          autoComplete="tel"
          inputMode="tel"
        />

        <section className="day-of-details-notes" aria-label="Day-of notes">
          <header className="day-of-details-notes-header">
            <h3>Day-of notes</h3>
            <span className="day-of-details-notes-hint">
              Optional, up to {MAX_NOTES}
            </span>
          </header>

          {dayOfNotes.length > 0 && (
            <ol className="day-of-details-note-list">
              {dayOfNotes.map((note, index) => {
                const noteError = fieldErrors[`dayOfNotes.${index}`];
                return (
                  <li key={index} className="day-of-details-note">
                    <Input
                      label={`Note ${index + 1}`}
                      value={note}
                      onChange={(event) =>
                        updateNote(index, event.target.value.slice(0, NOTE_MAX_LENGTH))
                      }
                      placeholder="e.g. quiet venue — let me know if you need anything"
                      helperText={`${note.length}/${NOTE_MAX_LENGTH} characters`}
                      error={noteError}
                      disabled={submitting}
                      maxLength={NOTE_MAX_LENGTH}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="day-of-details-note-remove"
                      onClick={() => removeNote(index)}
                      disabled={submitting}
                      aria-label={`Remove note ${index + 1}`}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ol>
          )}

          {canAddNote && (
            <button
              type="button"
              className="day-of-details-add"
              onClick={addNote}
              disabled={submitting}
            >
              + Add note
            </button>
          )}
        </section>

        {fieldErrors.dayOfNotes && (
          <p className="field-error" role="alert">{fieldErrors.dayOfNotes}</p>
        )}

        <div className="day-of-details-actions">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Saving..." : "Save day-of details"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        </div>

        {statusMessage && (
          <p
            className={
              actionState === "error"
                ? "day-of-details-status day-of-details-status-error"
                : "day-of-details-status"
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
