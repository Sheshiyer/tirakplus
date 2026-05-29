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

import { useEffect, useMemo, useState } from "react";
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
      </div>
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
