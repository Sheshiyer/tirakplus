// InquiryFormSheet.tsx — Pass H1.Task 8.
//
// Modal that lets a traveller send a private inquiry to a specific companion.
// Uses a native <dialog> for v1.
//
// P2.T1 (2026-05-28) — Migrated off the deprecated H3 free-text
// `preferredWindow` to the single-date model: the traveller now picks one
// `scheduledFor` datetime + a `location` at inquiry time (the companion accept
// handler auto-advances accepted → date_confirmed). This is the MINIMAL
// contract-compliant form; P2.T5 replaces this <dialog> with the full
// InquiryComposerPage (availability-gated calendar, time chips, Muse assist).
//
// Lifecycle pattern mirrors the sub-card forms inside AccountSettings
// (DataExportCard / DeletionCard / SafetyReportsCard): local useState for
// draft + action state + per-field errors + a single status line.

import { FormEvent, useEffect, useRef, useState } from "react";
import type {
  CitySlug,
  ExperienceSlug,
  TravellerInquiryDetail,
  TravellerInquiryRequest,
} from "../../../shared/contracts";
import { BookingApiError, BookingService } from "../../api/booking";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";

export type InquiryFormSheetProps = {
  open: boolean;
  companionId: string;
  companionDisplayName: string;
  city: CitySlug;
  experience: ExperienceSlug;
  onClose: () => void;
  onSubmitted: (inquiry: TravellerInquiryDetail) => void;
};

type ActionState = "idle" | "submitting" | "submitted" | "error";

const MIN_MESSAGE_LENGTH = 20;

export function InquiryFormSheet(props: InquiryFormSheetProps) {
  const { open, companionId, companionDisplayName, city, experience, onClose, onSubmitted } = props;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [scheduledFor, setScheduledFor] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Open / close the native dialog in response to the open prop.
  // showModal() throws if called on an already-open dialog, so we guard.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Reset the form whenever the modal re-opens so a previous submission
  // doesn't leak into the next inquiry.
  useEffect(() => {
    if (open) {
      setScheduledFor("");
      setLocation("");
      setMessage("");
      setPrivacyAcknowledged(false);
      setActionState("idle");
      setStatusMessage(null);
      setFieldErrors({});
    }
  }, [open]);

  // Native dialog fires `close` on Escape or form method=dialog submit.
  // Propagate that to the parent so its `open` state stays consistent.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      if (open) onClose();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Local validation first — avoid a round trip if we already know
    // required fields are missing. Server validates min length too.
    const nextErrors: Record<string, string> = {};
    if (scheduledFor.trim().length === 0) {
      nextErrors.scheduledFor = "Pick a date and time.";
    }
    if (location.trim().length === 0) {
      nextErrors.location = "Add a preferred meeting place.";
    }
    if (message.trim().length < MIN_MESSAGE_LENGTH) {
      nextErrors.message = `Share at least ${MIN_MESSAGE_LENGTH} characters about this trip.`;
    }
    if (!privacyAcknowledged) {
      nextErrors.privacyAcknowledged = "Acknowledge the privacy note to continue.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setActionState("error");
      setStatusMessage("Please complete the highlighted fields.");
      return;
    }

    setActionState("submitting");
    setStatusMessage(null);
    setFieldErrors({});

    const payload: TravellerInquiryRequest = {
      companionId,
      city,
      experience,
      scheduledFor: scheduledFor.trim(),
      location: location.trim(),
      message: message.trim(),
      privacyAcknowledged: true,
    };

    try {
      const response = await BookingService.createInquiry(payload);
      setActionState("submitted");
      setStatusMessage("Inquiry sent. Tirak will reach out via your inbox.");
      onSubmitted(response.inquiry);
    } catch (err) {
      setActionState("error");
      if (err instanceof BookingApiError) {
        setFieldErrors(err.fieldErrors || {});
        setStatusMessage(err.message || "Inquiry could not be sent. Try again.");
      } else {
        setStatusMessage("Inquiry could not be sent. Try again.");
      }
    }
  };

  const submitting = actionState === "submitting";

  return (
    <dialog ref={dialogRef} className="inquiry-form-sheet" aria-labelledby="inquiry-form-sheet-title">
      <header className="inquiry-form-sheet-header">
        <p className="eyebrow">Private inquiry</p>
        <h2 id="inquiry-form-sheet-title">Send a private inquiry to {companionDisplayName}</h2>
        <p>Tirak reviews every inquiry before it reaches the companion. You'll see updates in your inbox.</p>
      </header>

      <form className="inquiry-form-sheet-body" onSubmit={submit} noValidate>
        <Input
          label="Date and time"
          type="datetime-local"
          value={scheduledFor}
          onChange={(event) => setScheduledFor(event.target.value)}
          helperText="Pick when you'd like to meet — at least 2 hours from now."
          error={fieldErrors.scheduledFor}
          disabled={submitting}
        />

        <Input
          label="Preferred meeting place"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="e.g. a hotel lobby or a well-known cafe"
          helperText="Where would you like to meet? Tirak shares this with the companion if approved."
          error={fieldErrors.location}
          autoComplete="off"
          maxLength={200}
          disabled={submitting}
        />

        <Textarea
          label="Your message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Share what makes this trip meaningful and what you're hoping for…"
          helperText={`Keep it respectful and specific. Min ${MIN_MESSAGE_LENGTH} characters.`}
          error={fieldErrors.message}
          rows={5}
          disabled={submitting}
        />

        <Checkbox
          label="I understand this inquiry stays private to me and Tirak's review team until the companion accepts."
          checked={privacyAcknowledged}
          onChange={(event) => setPrivacyAcknowledged(event.target.checked)}
          error={fieldErrors.privacyAcknowledged}
          disabled={submitting}
        />

        <div className="inquiry-form-sheet-actions">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Sending..." : "Send inquiry"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
        </div>

        {statusMessage && (
          <p
            className={
              actionState === "error"
                ? "inquiry-form-sheet-status inquiry-form-sheet-status-error"
                : "inquiry-form-sheet-status"
            }
            role={actionState === "error" ? "alert" : "status"}
          >
            {statusMessage}
          </p>
        )}
      </form>
    </dialog>
  );
}
