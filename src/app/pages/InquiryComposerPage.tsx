// InquiryComposerPage.tsx — P2.T5 (2026-05-28).
//
// Full-page single-screen inquiry composer at
//   /traveller/companions/:companionId/inquire
//
// Replaces the old InquiryFormSheet / InquiryConversation <dialog> modal
// that CompanionProfilePage used to open. Assembles the P2.T3 primitives
// (CompanionInquiryCard, InlineCalendar, TimeSlotChips, ExperienceChipGroup,
// LocationField, DiscreetByDesignCard) + the P2.T4 MuseAssistedTextarea into
// one 3-zone layout. This task lays down the BASELINE/functional structure
// only — the holistic responsive 3-col polish is T6's job.
//
// Locked design decisions honoured here (2026-05-28):
//   - Calendar is a GENERIC future-date picker: every date from tomorrow
//     through +60 days is selectable. The companion's availabilityWindows
//     carry no dates, so they are surfaced as GUIDANCE TEXT beside the
//     calendar ("Aura is usually free: ...") rather than gating the grid.
//   - Time slots are a FIXED preset set, disabled until a date is picked.
//   - scheduledFor is built in Bangkok local time (permanent UTC+7, no DST).
//   - experience is user-selected via chips (was a URL prop in H1).
//
// Submit gating mirrors the server's validateInquiry + the dedicated
// scheduledFor / location / experience handler checks (worker/index.ts):
//   message  ≥ 24 chars after trim
//   location 1-200 chars after trim
//   experience selected
//   date + slot selected (→ scheduledFor)
//   privacyAcknowledged === true

import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type {
  CompanionProfile,
  ExperienceSlug,
  TravellerInquiryRequest,
} from "../../shared/contracts";
import { BookingApiError, BookingService } from "../api/booking";
import { ApiRequestError, TravellerService } from "../api/traveller";
import { CompanionInquiryCard } from "../components/booking/composer/CompanionInquiryCard";
import { DiscreetByDesignCard } from "../components/booking/composer/DiscreetByDesignCard";
import { ExperienceChipGroup } from "../components/booking/composer/ExperienceChipGroup";
import { InlineCalendar } from "../components/booking/composer/InlineCalendar";
import { LocationField } from "../components/booking/composer/LocationField";
import { MuseAssistedTextarea } from "../components/booking/composer/MuseAssistedTextarea";
import { TimeSlotChips } from "../components/booking/composer/TimeSlotChips";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonProfile } from "../components/ui/Skeleton";

// Fixed preset start times offered for every day (24h "HH:mm"). Evening-
// weighted to match the product's nightlife/dining lean. All are well over
// the server's 2h-lead requirement when paired with any tomorrow-or-later
// date, so a valid date+slot pick never trips INVALID_SCHEDULE.
const PRESET_TIME_SLOTS = ["18:00", "19:00", "20:00", "20:30", "21:30"];

// Generic calendar horizon: tomorrow through +60 days, all selectable.
const CALENDAR_HORIZON_DAYS = 60;

// Match the server's minimum message length (validateInquiry → 24).
const MESSAGE_MIN = 24;
const MESSAGE_MAX = 500;
const LOCATION_MAX = 200;

// Conversational ("Muse-led") presentation. The page DEFAULTS to a guided chat
// that collects the SAME fields one at a time, reusing the exact same primitives
// + field state + submit path as the structured form. The form is the always-
// available fallback ("switch to the full form"). No new endpoint or Muse-agent
// conversation is introduced — message drafting still flows through the bounded
// one-shot MuseAssistedTextarea, so the anti-injection gate is untouched.
const CONVO_STEPS = ["when", "experience", "where", "message", "privacy"] as const;
type ConvoStep = (typeof CONVO_STEPS)[number];
type Presentation = "conversation" | "form";

// Human labels per experience slug, used in the conversation's answer-recap
// bubble (the chip group renders its own labels in the affordance).
const EXPERIENCE_LABELS: Record<ExperienceSlug, string> = {
  nightlife: "A night out",
  "island-explorer": "An island day",
  "muay-thai-night": "A Muay Thai evening",
  "private-dining": "A private dinner",
  "local-guidance": "A local-guidance day",
};

function museAsk(step: ConvoStep, companionName: string): string {
  switch (step) {
    case "when":
      return `Let's plan your time with ${companionName}. When would you like to meet? Pick a date and a start time.`;
    case "experience":
      return "What kind of time together are you hoping for?";
    case "where":
      return "Where feels right to meet? Somewhere public and easy — a hotel lobby or a well-known café works well.";
    case "message":
      return `Tell ${companionName} what makes this trip meaningful and what you're hoping for — I can help you draft it.`;
    case "privacy":
      return "One last thing — this inquiry stays private until the companion accepts. Acknowledge below and I'll send it.";
  }
}

type LoadState =
  | { status: "loading"; profile?: undefined; message?: undefined; unavailable?: undefined }
  | { status: "ready"; profile: CompanionProfile; message?: undefined; unavailable?: undefined }
  | { status: "error"; profile?: undefined; message: string; unavailable: boolean };

/** Today's date as YYYY-MM-DD in Asia/Bangkok, independent of viewer tz. */
function bangkokTodayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Every selectable ISO date (YYYY-MM-DD) from tomorrow through +horizon
 * days, computed in Bangkok local time. Built by stepping a UTC date
 * anchored at Bangkok noon so DST-free +7 arithmetic never slips a day.
 */
function buildAvailableDates(horizonDays: number): string[] {
  const todayIso = bangkokTodayIso();
  const [y, m, d] = todayIso.split("-").map(Number);
  // Anchor at 12:00Z so adding whole days never crosses a date boundary
  // under the +7 Bangkok offset.
  const anchor = Date.UTC(y, m - 1, d, 12, 0, 0);
  const dates: string[] = [];
  for (let offset = 1; offset <= horizonDays; offset += 1) {
    const day = new Date(anchor + offset * 24 * 60 * 60 * 1000);
    const iso = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(day);
    dates.push(iso);
  }
  return dates;
}

/**
 * Human label for a chosen date + slot, in Bangkok local time, used to seed
 * the Muse-assist context ("Sat 14 Jun, 19:00"). Returns null until both are
 * set.
 */
function scheduledForLabel(dateIso: string | null, slot: string | null): string | null {
  if (!dateIso || !slot) return null;
  const iso = `${dateIso}T${slot}:00+07:00`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")}, ${get("hour")}:${get("minute")}`;
}

/** Join availability labels into a readable run; "" when none. */
function joinAvailabilityLabels(profile: CompanionProfile): string {
  const labels = profile.availabilityWindows
    .map((w) => w.label?.trim())
    .filter((label): label is string => Boolean(label));
  return labels.join(", ");
}

export function InquiryComposerPage() {
  const { companionId } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState<LoadState>({ status: "loading" });

  // Composer field state.
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [experience, setExperience] = useState<ExperienceSlug | null>(null);
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);

  // Presentation: Muse-led conversation (default) vs the full structured form
  // (fallback). Both write to the SAME field state above and submit via the
  // SAME handleSubmit, so switching presentation never loses entries.
  const [presentation, setPresentation] = useState<Presentation>("conversation");
  const [convoStep, setConvoStep] = useState(0);

  // Submit state.
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Generic calendar horizon — stable per mount.
  const availableDates = useMemo(() => buildAvailableDates(CALENDAR_HORIZON_DAYS), []);

  useEffect(() => {
    if (!companionId) {
      setState({ status: "error", unavailable: true, message: "This inquiry link is missing a companion." });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    TravellerService.getProfile(companionId)
      .then((profile) => {
        if (cancelled) return;
        setState({ status: "ready", profile });
        // Seed the experience chip with the companion's primary tag so the
        // form is one fewer click for the common case; the traveller can
        // still change it.
        setExperience((current) => current ?? profile.experienceTags[0] ?? null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const unavailable = error instanceof ApiRequestError && (error.status === 404 || error.status === 423);
        setState({
          status: "error",
          unavailable,
          message: error instanceof Error ? error.message : "This profile is unavailable.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [companionId]);

  if (state.status === "loading") {
    return (
      <section className="inquiry-composer-page inquiry-composer-page--loading">
        <SkeletonProfile />
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="inquiry-composer-page inquiry-composer-page--error">
        <FeedbackState
          variant={state.unavailable ? "empty" : "error"}
          title={state.unavailable ? "This companion can't take inquiries" : "Composer could not load"}
          description={state.message}
          actionLabel="Back to discovery"
          onAction={() => navigate("/traveller/discovery")}
        />
      </section>
    );
  }

  const { profile } = state;
  const profileHref = `/traveller/companions/${profile.id}`;

  // Availability guidance copy (decision: labels as guidance, not gates).
  const availabilityRun = joinAvailabilityLabels(profile);
  const availabilityGuidance = availabilityRun
    ? `${profile.displayName} is usually free: ${availabilityRun}.`
    : `Send a flexible request — ${profile.displayName} will confirm a time.`;

  const whenLabel = scheduledForLabel(selectedDate, selectedSlot);

  const trimmedLocation = location.trim();
  const trimmedMessage = message.trim();

  const canSubmit =
    Boolean(selectedDate) &&
    Boolean(selectedSlot) &&
    Boolean(experience) &&
    trimmedLocation.length >= 1 &&
    trimmedLocation.length <= LOCATION_MAX &&
    trimmedMessage.length >= MESSAGE_MIN &&
    privacyAcknowledged &&
    !submitting;

  const handleSelectDate = (iso: string) => {
    setSelectedDate(iso);
    // Clearing the slot on date change forces a fresh, intentional pick and
    // keeps scheduledFor coherent.
    setSelectedSlot(null);
    if (fieldErrors.scheduledFor) clearFieldError("scheduledFor");
  };

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit || !experience || !selectedDate || !selectedSlot) return;

    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    // Build the ISO datetime in Bangkok local time (permanent UTC+7, no DST),
    // then normalise to UTC ISO for the wire.
    const scheduledFor = new Date(`${selectedDate}T${selectedSlot}:00+07:00`).toISOString();

    const payload: TravellerInquiryRequest = {
      companionId: profile.id,
      city: profile.city,
      experience,
      scheduledFor,
      location: trimmedLocation,
      message: trimmedMessage,
      privacyAcknowledged: true,
    };

    try {
      const response = await BookingService.createInquiry(payload);
      navigate(`/traveller/inbox/${response.inquiry.id}`);
    } catch (error) {
      if (error instanceof BookingApiError) {
        setSubmitError(error.message || "We couldn't send your inquiry. Try again.");
        if (error.fieldErrors) setFieldErrors(error.fieldErrors);
      } else {
        setSubmitError("We couldn't send your inquiry. Try again.");
      }
      setSubmitting(false);
    }
  };

  // --- Conversation-mode helpers. All read the shared field state above. ---
  const stepComplete = (step: ConvoStep): boolean => {
    switch (step) {
      case "when":
        return Boolean(selectedDate && selectedSlot);
      case "experience":
        return Boolean(experience);
      case "where":
        return trimmedLocation.length >= 1 && trimmedLocation.length <= LOCATION_MAX;
      case "message":
        return trimmedMessage.length >= MESSAGE_MIN;
      case "privacy":
        return privacyAcknowledged;
    }
  };

  // First step the traveller hasn't satisfied yet — used when switching back
  // from the form so they resume rather than re-answering filled steps.
  const firstIncompleteStep = (): number => {
    const idx = CONVO_STEPS.findIndex((step) => !stepComplete(step));
    return idx === -1 ? CONVO_STEPS.length - 1 : idx;
  };

  const advanceConvo = () => {
    // Read the index inside the updater so a rapid double-click can't overshoot
    // past the final step (each click would otherwise stack on a stale index).
    setConvoStep((i) => (i < CONVO_STEPS.length - 1 && stepComplete(CONVO_STEPS[i]) ? i + 1 : i));
  };

  const goToForm = () => setPresentation("form");
  const goToConversation = () => {
    setConvoStep(firstIncompleteStep());
    setPresentation("conversation");
  };

  const answerSummary = (step: ConvoStep): string => {
    switch (step) {
      case "when":
        return whenLabel ? `${whenLabel} · Bangkok` : "—";
      case "experience":
        return experience ? EXPERIENCE_LABELS[experience] : "—";
      case "where":
        return trimmedLocation || "—";
      case "message":
        return trimmedMessage.length > 90 ? `${trimmedMessage.slice(0, 90)}…` : trimmedMessage;
      case "privacy":
        return "I understand — please send it.";
    }
  };

  // The active step's input affordance — the SAME primitives the form uses,
  // surfaced one at a time.
  const renderConvoAffordance = (step: ConvoStep) => {
    switch (step) {
      case "when":
        return (
          <>
            <InlineCalendar
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />
            <div className="inquiry-composer-slots">
              <p className="field-label">Preferred start time</p>
              <TimeSlotChips
                slots={PRESET_TIME_SLOTS}
                selectedSlot={selectedSlot}
                onSelectSlot={(slot) => {
                  setSelectedSlot(slot);
                  if (fieldErrors.scheduledFor) clearFieldError("scheduledFor");
                }}
                disabled={!selectedDate}
              />
              {whenLabel ? (
                <p className="inquiry-composer-when-summary" aria-live="polite">
                  {whenLabel} · Bangkok local time
                </p>
              ) : null}
            </div>
            {fieldErrors.scheduledFor ? (
              <p className="field-error" role="alert">{fieldErrors.scheduledFor}</p>
            ) : null}
          </>
        );
      case "experience":
        return (
          <>
            <ExperienceChipGroup
              selected={experience}
              onSelect={(slug) => {
                setExperience(slug);
                if (fieldErrors.experience) clearFieldError("experience");
              }}
            />
            {fieldErrors.experience ? (
              <p className="field-error" role="alert">{fieldErrors.experience}</p>
            ) : null}
          </>
        );
      case "where":
        return (
          <>
            <LocationField
              value={location}
              onChange={(next) => {
                setLocation(next);
                if (fieldErrors.location) clearFieldError("location");
              }}
              maxLength={LOCATION_MAX}
            />
            {fieldErrors.location ? (
              <p className="field-error" role="alert">{fieldErrors.location}</p>
            ) : null}
          </>
        );
      case "message":
        return (
          <>
            <MuseAssistedTextarea
              value={message}
              onChange={(next) => {
                setMessage(next);
                if (fieldErrors.message) clearFieldError("message");
              }}
              companionName={profile.displayName}
              companionId={profile.id}
              experience={experience}
              scheduledForLabel={whenLabel}
              maxLength={MESSAGE_MAX}
            />
            {trimmedMessage.length > 0 && trimmedMessage.length < MESSAGE_MIN ? (
              <p className="inquiry-composer-hint" aria-live="polite">
                Add at least {MESSAGE_MIN - trimmedMessage.length} more character
                {MESSAGE_MIN - trimmedMessage.length === 1 ? "" : "s"} so {profile.displayName} has context.
              </p>
            ) : null}
            {fieldErrors.message ? (
              <p className="field-error" role="alert">{fieldErrors.message}</p>
            ) : null}
          </>
        );
      case "privacy":
        return (
          <div className="inquiry-composer-convo__privacy">
            <label className="inquiry-composer-privacy">
              <input
                type="checkbox"
                checked={privacyAcknowledged}
                onChange={(event) => {
                  setPrivacyAcknowledged(event.target.checked);
                  if (fieldErrors.privacyAcknowledged) clearFieldError("privacyAcknowledged");
                }}
              />
              <span>
                I'll keep this discreet and respectful. Details are shared only after {profile.displayName} accepts.
              </span>
            </label>
            {fieldErrors.privacyAcknowledged ? (
              <p className="field-error" role="alert">{fieldErrors.privacyAcknowledged}</p>
            ) : null}
            {submitError ? (
              <p className="inquiry-composer-submit-error" role="alert">{submitError}</p>
            ) : null}
          </div>
        );
    }
  };

  const activeStep = CONVO_STEPS[convoStep];
  const isFinalStep = activeStep === "privacy";

  const conversationView = (
    <div className="inquiry-composer-convo">
      <p className="inquiry-composer-convo__progress" aria-live="polite">
        {isFinalStep ? "Final step" : `Step ${convoStep + 1} of ${CONVO_STEPS.length}`}
      </p>
      <div className="inquiry-composer-convo__thread">
        {CONVO_STEPS.slice(0, convoStep + 1).map((stepId, i) => (
          <Fragment key={stepId}>
            <article className="muse-message muse-message-muse">
              <p>{museAsk(stepId, profile.displayName)}</p>
            </article>
            {i < convoStep ? (
              <article className="muse-message muse-message-user">
                <p>{answerSummary(stepId)}</p>
              </article>
            ) : (
              <div className="inquiry-composer-convo__affordance">{renderConvoAffordance(stepId)}</div>
            )}
          </Fragment>
        ))}
      </div>
      <div className="inquiry-composer-convo__actions">
        {isFinalStep ? (
          <Button
            type="button"
            variant="coral"
            fullWidth
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
          >
            {submitting ? "Sending…" : "Send Inquiry"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="coral"
            fullWidth
            onClick={advanceConvo}
            disabled={!stepComplete(activeStep)}
          >
            Continue
          </Button>
        )}
        <button type="button" className="inquiry-composer-convo__switch" onClick={goToForm}>
          Switch to the full form
        </button>
      </div>
      <p className="inquiry-composer-submit-footnote">Your inquiry is private and confidential</p>
    </div>
  );

  return (
    <section className="inquiry-composer-page" aria-labelledby="inquiry-composer-title">
      <header className="inquiry-composer-topbar">
        <Link to={profileHref} className="inquiry-composer-back" aria-label={`Back to ${profile.displayName}'s profile`}>
          <BackChevron />
        </Link>
        <div className="inquiry-composer-topbar__title">
          <p className="eyebrow">Private inquiry</p>
          <h1 id="inquiry-composer-title">Plan your time with {profile.displayName}</h1>
        </div>
        <span className="inquiry-composer-topbar__spacer" aria-hidden="true" />
      </header>

      {presentation === "conversation" ? (
        conversationView
      ) : (
      <>
      <div className="inquiry-composer-mode-switch">
        <button type="button" className="inquiry-composer-mode-switch__btn" onClick={goToConversation}>
          Prefer a guided chat? Talk it through with Muse
        </button>
      </div>
      <div className="inquiry-composer-layout">
        {/* Left/sidebar zone — who you're reaching + privacy reassurance. */}
        <aside className="inquiry-composer-rail inquiry-composer-rail--left" aria-label="Companion summary">
          <CompanionInquiryCard profile={profile} />
          <DiscreetByDesignCard />
        </aside>

        {/* Center zone — the actual composer fields. */}
        <div className="inquiry-composer-main">
          <section className="inquiry-composer-block" aria-labelledby="composer-when-heading">
            <p className="eyebrow">When</p>
            <h2 id="composer-when-heading">Pick a date &amp; time</h2>
            <p className="inquiry-composer-availability" role="note">
              {availabilityGuidance}
            </p>
            <InlineCalendar
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />
            <div className="inquiry-composer-slots">
              <p className="field-label">Preferred start time</p>
              <TimeSlotChips
                slots={PRESET_TIME_SLOTS}
                selectedSlot={selectedSlot}
                onSelectSlot={(slot) => {
                  setSelectedSlot(slot);
                  if (fieldErrors.scheduledFor) clearFieldError("scheduledFor");
                }}
                disabled={!selectedDate}
              />
              {whenLabel ? (
                <p className="inquiry-composer-when-summary" aria-live="polite">
                  {whenLabel} · Bangkok local time
                </p>
              ) : null}
              {fieldErrors.scheduledFor ? (
                <p className="field-error" role="alert">{fieldErrors.scheduledFor}</p>
              ) : null}
            </div>
          </section>

          <section className="inquiry-composer-block" aria-labelledby="composer-experience-heading">
            <p className="eyebrow">Experience</p>
            <h2 id="composer-experience-heading">What kind of time together?</h2>
            <ExperienceChipGroup
              selected={experience}
              onSelect={(slug) => {
                setExperience(slug);
                if (fieldErrors.experience) clearFieldError("experience");
              }}
            />
            {fieldErrors.experience ? (
              <p className="field-error" role="alert">{fieldErrors.experience}</p>
            ) : null}
          </section>

          <section className="inquiry-composer-block" aria-labelledby="composer-location-heading">
            <p className="eyebrow">Where</p>
            <h2 id="composer-location-heading">Your preferred meeting place</h2>
            <LocationField
              value={location}
              onChange={(next) => {
                setLocation(next);
                if (fieldErrors.location) clearFieldError("location");
              }}
              maxLength={LOCATION_MAX}
            />
            {fieldErrors.location ? (
              <p className="field-error" role="alert">{fieldErrors.location}</p>
            ) : null}
          </section>

          <section className="inquiry-composer-block" aria-labelledby="composer-message-heading">
            <p className="eyebrow">Message</p>
            <h2 id="composer-message-heading">Your first message</h2>
            <MuseAssistedTextarea
              value={message}
              onChange={(next) => {
                setMessage(next);
                if (fieldErrors.message) clearFieldError("message");
              }}
              companionName={profile.displayName}
              companionId={profile.id}
              experience={experience}
              scheduledForLabel={whenLabel}
              maxLength={MESSAGE_MAX}
            />
            {trimmedMessage.length > 0 && trimmedMessage.length < MESSAGE_MIN ? (
              <p className="inquiry-composer-hint" aria-live="polite">
                Add at least {MESSAGE_MIN - trimmedMessage.length} more character
                {MESSAGE_MIN - trimmedMessage.length === 1 ? "" : "s"} so {profile.displayName} has context.
              </p>
            ) : null}
            {fieldErrors.message ? (
              <p className="field-error" role="alert">{fieldErrors.message}</p>
            ) : null}
          </section>
        </div>

        {/* Right rail — session recap + privacy/safety. Only rendered at the
            desktop/wide widths the board shows it (CSS hides it <1024px); the
            same details live in the form + sticky bar on smaller frames. */}
        <aside className="inquiry-composer-rail inquiry-composer-rail--right" aria-label="Session summary and privacy">
          <div className="inquiry-composer-aside-card">
            <p className="eyebrow">Session</p>
            <h3>Your plan so far</h3>
            <dl>
              <div className="inquiry-composer-session-row">
                <dt>When</dt>
                <dd className={whenLabel ? undefined : "is-empty"}>
                  {whenLabel ? whenLabel : "Pick a date & time"}
                </dd>
              </div>
              <div className="inquiry-composer-session-row">
                <dt>Duration</dt>
                <dd>3 hours</dd>
              </div>
              <div className="inquiry-composer-session-row">
                <dt>Where</dt>
                <dd className={trimmedLocation ? undefined : "is-empty"}>
                  {trimmedLocation ? trimmedLocation : "Add a meeting place"}
                </dd>
              </div>
            </dl>
          </div>
          <div className="inquiry-composer-aside-card">
            <p className="eyebrow">Privacy &amp; safety</p>
            <h3>Discreet by design</h3>
            <p>
              Your contact details and exact meeting point stay hidden until
              {" "}{profile.displayName} accepts. Inquiries are private and
              confidential.
            </p>
          </div>
        </aside>
      </div>

      {/* Sticky submit bar — coral primary CTA + explicit privacy confirm. */}
      <div className="inquiry-composer-submit-bar" role="region" aria-label="Send inquiry">
        <label className="inquiry-composer-privacy">
          <input
            type="checkbox"
            checked={privacyAcknowledged}
            onChange={(event) => {
              setPrivacyAcknowledged(event.target.checked);
              if (fieldErrors.privacyAcknowledged) clearFieldError("privacyAcknowledged");
            }}
          />
          <span>
            I'll keep this discreet and respectful. Details are shared only after {profile.displayName} accepts.
          </span>
        </label>
        {fieldErrors.privacyAcknowledged ? (
          <p className="field-error" role="alert">{fieldErrors.privacyAcknowledged}</p>
        ) : null}
        {submitError ? (
          <p className="inquiry-composer-submit-error" role="alert">{submitError}</p>
        ) : null}
        <Button
          type="button"
          variant="coral"
          fullWidth
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
        >
          {submitting ? "Sending…" : "Send Inquiry"}
        </Button>
        <p className="inquiry-composer-submit-footnote">
          Your inquiry is private and confidential
        </p>
      </div>
      </>
      )}
    </section>
  );
}

// Inline back chevron — mirrors CompanionProfilePage's glyph so the topbar
// reads consistently across the two surfaces. lucide-react isn't installed.
function BackChevron() {
  return (
    <svg viewBox="0 0 20 20" fill="none" focusable="false" aria-hidden="true">
      <path d="M12.5 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
