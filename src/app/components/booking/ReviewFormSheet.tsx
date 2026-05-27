// ReviewFormSheet.tsx — Pass H Sub-pass H6.Task 6.
//
// Modal that lets a traveller post their 1-5 score + short comment after a
// session transitions to review_pending. Uses a native <dialog> for v1 to
// match InquiryFormSheet (H1.T8); Pass J will swap the wrapper for the
// BottomSheet primitive but the form internals stay the same.
//
// Two deliberate choices mirror earlier sub-passes:
//   1. No pre-selected score. We force the traveller to make an active
//      choice, the same way WindowSelectionView (H3.T5) gates submit on a
//      non-null selectedIndex and the H2.T6 decline form forces an explicit
//      reason category. Defaulting to 3 would bias every passive submission.
//   2. Comment is required (20-500 chars after trim). Server enforces the
//      same bounds, but we validate locally first so an obviously-too-short
//      comment doesn't burn a round trip.
//
// Reviews are immutable in v1, so this sheet is a one-shot — auto-close
// after a successful submit hands control back to the caller, which is
// expected to swap the surface to a read-only review summary (T7 scope).
// We deliberately do NOT wire this into a page here; T7 owns that.

import { FormEvent, useEffect, useRef, useState } from "react";
import type {
  ReviewRequest,
  TravellerInquiryDetail,
} from "../../../shared/contracts";
import { BookingApiError, BookingService } from "../../api/booking";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";

export type ReviewFormSheetProps = {
  open: boolean;
  inquiryId: string;
  companionDisplayName: string;
  onClose: () => void;
  onSubmitted: (inquiry: TravellerInquiryDetail) => void;
};

type ActionState = "idle" | "submitting" | "submitted" | "error";

const MIN_COMMENT_LENGTH = 20;
const MAX_COMMENT_LENGTH = 500;
const AUTO_CLOSE_MS = 1500;

// Human-readable label for each score, shown as a caption under the picker
// once the traveller has chosen. Mirrors the curated decline-reason copy in
// H2.T6 — short, neutral, no exclamation marks.
const SCORE_LABELS: Record<number, string> = {
  1: "Disappointing",
  2: "Below expectations",
  3: "Met expectations",
  4: "Great",
  5: "Outstanding",
};

const SCORE_OPTIONS = [1, 2, 3, 4, 5] as const;

export function ReviewFormSheet(props: ReviewFormSheetProps) {
  const { open, inquiryId, companionDisplayName, onClose, onSubmitted } = props;

  const dialogRef = useRef<HTMLDialogElement>(null);
  // null = no choice yet. Block submit until this becomes a number so the
  // traveller can't accidentally fire off a default score. See header note.
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
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
  // doesn't leak into the next attempt (e.g. user closes via Escape then
  // re-opens). Reviews are immutable so this branch is mostly defensive,
  // but consistency with InquiryFormSheet matters for muscle memory.
  useEffect(() => {
    if (open) {
      setScore(null);
      setComment("");
      setActionState("idle");
      setStatusMessage(null);
      setFieldErrors({});
    }
  }, [open]);

  // Native dialog fires `close` on Escape. Propagate that to the parent so
  // its `open` state stays consistent with what the dialog actually shows.
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

    // Local validation: avoid a server round trip when we already know
    // requirements aren't met. Server validates the same bounds.
    const nextErrors: Record<string, string> = {};
    if (score === null) {
      nextErrors.score = "Pick a score from 1 to 5.";
    }
    const trimmedComment = comment.trim();
    if (trimmedComment.length < MIN_COMMENT_LENGTH) {
      nextErrors.comment = `Share at least ${MIN_COMMENT_LENGTH} characters.`;
    } else if (trimmedComment.length > MAX_COMMENT_LENGTH) {
      nextErrors.comment = `Keep it under ${MAX_COMMENT_LENGTH} characters.`;
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

    const payload: ReviewRequest = {
      score: score as number,
      comment: trimmedComment,
    };

    try {
      const response = await BookingService.submitReview(inquiryId, payload);
      setActionState("submitted");
      setStatusMessage(response.message || "Review submitted. Thanks for sharing.");
      onSubmitted(response.inquiry);
      // Reviews are immutable; once it's in, the form has no further job.
      // Auto-close gives the user a moment to see the success line before
      // the caller swaps in the read-only summary surface (T7 scope).
      window.setTimeout(() => {
        onClose();
      }, AUTO_CLOSE_MS);
    } catch (err) {
      setActionState("error");
      if (err instanceof BookingApiError) {
        // Server surfaces score / comment errors here; we render the most
        // relevant ones inline (score caption + textarea helper) while the
        // general message goes in the status line.
        setFieldErrors(err.fieldErrors || {});
        setStatusMessage(err.message || "Could not submit review. Try again.");
      } else {
        setStatusMessage("Could not submit review. Try again.");
      }
    }
  };

  const submitting = actionState === "submitting";
  const submitted = actionState === "submitted";
  // Disable interaction while submitting or after success (success is
  // terminal because reviews are immutable; preventing further edits keeps
  // the form honest until auto-close fires).
  const locked = submitting || submitted;

  const trimmedLength = comment.trim().length;
  const commentOutOfRange =
    trimmedLength > 0 &&
    (trimmedLength < MIN_COMMENT_LENGTH || trimmedLength > MAX_COMMENT_LENGTH);
  // Counter copy: under-min gets a "{N} more needed" prompt so the user
  // knows what to do; in-range and over-max both show "{N}/500 characters".
  const commentCounterLabel =
    trimmedLength < MIN_COMMENT_LENGTH && trimmedLength > 0
      ? `${MIN_COMMENT_LENGTH - trimmedLength} more needed`
      : `${trimmedLength}/${MAX_COMMENT_LENGTH} characters`;

  const scoreError = fieldErrors.score;
  const commentError = fieldErrors.comment;

  return (
    <dialog
      ref={dialogRef}
      className="review-form-sheet"
      aria-labelledby="review-form-sheet-title"
    >
      <header className="review-form-sheet-header">
        <p className="eyebrow">Review</p>
        <h2 id="review-form-sheet-title">
          How was your time with {companionDisplayName}?
        </h2>
        <p>
          Your review stays anonymous via &ldquo;Traveller from {"{city}"}.&rdquo;
          Reviews are immutable once submitted.
        </p>
      </header>

      <form className="review-form-sheet-body" onSubmit={submit} noValidate>
        <fieldset className="review-form-score">
          <legend className="field-label">Score</legend>
          <div className="review-form-score-options" role="radiogroup" aria-label="Score from 1 to 5">
            {SCORE_OPTIONS.map((value) => (
              <label key={value} className="review-form-score-option">
                <input
                  type="radio"
                  name="review-score"
                  value={value}
                  checked={score === value}
                  disabled={locked}
                  onChange={() => {
                    setScore(value);
                    if (fieldErrors.score) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.score;
                        return next;
                      });
                    }
                  }}
                />
                <span className="number">{value}</span>
              </label>
            ))}
          </div>
          {score !== null && (
            <p className="review-form-score-label">{SCORE_LABELS[score]}</p>
          )}
          {scoreError && (
            <p className="field-error" role="alert">{scoreError}</p>
          )}
        </fieldset>

        <Textarea
          label="Tell other travellers about the experience"
          value={comment}
          onChange={(event) => {
            setComment(event.target.value);
            if (fieldErrors.comment) {
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.comment;
                return next;
              });
            }
          }}
          placeholder="Share what stood out, what worked, and what other travellers should know…"
          helperText={
            <span
              className={
                commentOutOfRange
                  ? "review-form-comment-counter review-form-comment-counter-out"
                  : "review-form-comment-counter"
              }
            >
              {commentCounterLabel}
            </span>
          }
          error={commentError}
          rows={5}
          maxLength={MAX_COMMENT_LENGTH}
          disabled={locked}
        />

        <div className="review-form-actions">
          <Button type="submit" variant="primary" disabled={locked}>
            {submitting ? "Submitting..." : submitted ? "Submitted" : "Submit review"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
        </div>

        {statusMessage && (
          <p
            className={
              actionState === "error"
                ? "review-form-status review-form-status-error"
                : "review-form-status"
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
