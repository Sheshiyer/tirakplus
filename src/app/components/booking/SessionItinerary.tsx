// SessionItinerary.tsx — Pass H Sub-pass H5.Task 4.
//
// Read-only display of the day-of details for a confirmed session. Used by
// both the traveller and the companion (the perspective prop swaps the
// labels on the contact + notes cards). Sits inside the H5 chain:
//
//   T3 SetDayOfDetailsForm   (companion: enter day-of details)
//   T4 SessionItinerary      (read-only display)              <- THIS
//   T5 TravellerInquiryDetailPage wiring (deferred)
//   T6 CompanionInquiryDetailPage wiring (deferred)
//
// Per the H5.T4 spec the component has NO visibility gate of its own — the
// parent (T5/T6) is responsible for computing the "24h before
// scheduledFor" mount gate. Once mounted, this component always renders
// whatever it's given; conditional sections (meeting point, contact,
// notes) only appear when the underlying field is present.
//
// All times display in Bangkok local time (Asia/Bangkok, UTC+7 year-round,
// no DST) to match the H3 sibling components ConfirmPlanView and
// WindowSelectionView.
//
// No useState, no BookingService — pure display.

import type {
  DateWindow,
  InquiryStatus,
} from "../../../shared/contracts";

export type SessionItineraryProps = {
  scheduledFor: string;              // ISO UTC
  durationMinutes?: number;
  selectedWindow: DateWindow;        // the confirmed window from H3
  meetingPoint?: string;
  contactNumber?: string;
  dayOfNotes?: string[];
  status: InquiryStatus;             // for conditional copy (scheduled vs live vs completed)
  perspective: "traveller" | "companion"; // for "Call companion" vs "Traveller contact" labeling
};

// "Saturday, 14 June at 18:00" in Asia/Bangkok local time. Same Intl
// pattern used by sendPlanConfirmedEmail and the ConfirmPlanView family;
// kept local here to keep the read-only component self-contained.
function formatScheduledFor(iso: string): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date(iso));
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  const day = get("day");
  const month = get("month");
  const time = `${get("hour")}:${get("minute")}`;
  return `${weekday}, ${day} ${month} at ${time}`;
}

// Renders a window as "Sat, 14 June · 18:00–20:00" in Asia/Bangkok local
// time. TODO(H3-followup): extract this + the matching helpers in
// ConfirmPlanView and WindowSelectionView into shared/booking-utils.ts so
// the booking surface stops carrying three copies of the same formatter.
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

// "1 hour 30 min" / "1 hour" / "45 min" — small affordance under the
// scheduled-time headline so the reader can sanity-check duration. Falls
// back to "duration TBD" when the inquiry hasn't set durationMinutes yet
// (shouldn't happen in date_confirmed onward, defensive only).
function formatDurationHours(minutes?: number): string {
  if (!minutes) return "duration TBD";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hour${h === 1 ? "" : "s"}`;
  return `${h} hour${h === 1 ? "" : "s"} ${m} min`;
}

// Header eyebrow adapts to lifecycle stage so the same component reads
// correctly pre-session ("Day-of details"), during ("Session live"), and
// after ("Session completed"). All other statuses (date_confirmed,
// payment_held, session_scheduled) collapse to the default since the
// 24h-mount gate in the parent guarantees we never render this for
// earlier statuses.
function eyebrowForStatus(status: InquiryStatus): string {
  if (status === "session_live") return "Session live";
  if (status === "session_completed") return "Session completed";
  return "Day-of details";
}

// iOS deep link — opens Apple Maps natively on iPhone and falls back to
// maps.apple.com on the web. encodeURIComponent handles spaces, commas,
// non-ASCII characters (Thai script) safely.
function appleMapsLink(address: string): string {
  return `http://maps.apple.com/?q=${encodeURIComponent(address)}`;
}

// `tel:` URI scheme tolerates `+` and digits only — strip everything else
// (spaces, dashes, parens) before handing to the dialer so iOS/Android
// don't choke on a formatted string like "+66 (0)2 123 4567".
function telLink(num: string): string {
  return `tel:${num.replace(/[^\d+]/g, "")}`;
}

// Perspective-aware labels: the traveller sees the companion's contact
// info / notes and vice versa. Keeps the JSX below uncluttered.
function contactCardLabel(perspective: "traveller" | "companion"): string {
  return perspective === "traveller"
    ? "Companion contact"
    : "Traveller contact";
}

function notesCardLabel(perspective: "traveller" | "companion"): string {
  return perspective === "traveller"
    ? "Notes from your companion"
    : "Notes from your traveller";
}

// Always-visible safety reminders. Kept module-level (not props) because
// they're product-policy copy, not data — same wording for everyone.
const SAFETY_REMINDERS: string[] = [
  "Tirak holds the booking until your session completes.",
  "Report anything that feels off via the /traveller/safety page.",
  "Off-platform contact or payment requests stay off Tirak.",
];

export function SessionItinerary(props: SessionItineraryProps) {
  const {
    scheduledFor,
    durationMinutes,
    selectedWindow,
    meetingPoint,
    contactNumber,
    dayOfNotes,
    status,
    perspective,
  } = props;

  const eyebrow = eyebrowForStatus(status);
  const scheduledLabel = formatScheduledFor(scheduledFor);
  const durationLabel = formatDurationHours(durationMinutes);
  const windowLabel = formatWindowLabel(selectedWindow);

  const hasMeetingPoint =
    typeof meetingPoint === "string" && meetingPoint.trim().length > 0;
  const hasContact =
    typeof contactNumber === "string" && contactNumber.trim().length > 0;
  const hasNotes = Array.isArray(dayOfNotes) && dayOfNotes.length > 0;

  return (
    <section
      className="session-itinerary"
      aria-labelledby="session-itinerary-title"
    >
      <header className="session-itinerary-header">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="session-itinerary-title">{scheduledLabel}</h2>
        <p className="session-itinerary-subtitle">
          Bangkok local time · {durationLabel}
        </p>
      </header>

      {/* SCHEDULE card — always visible since selectedWindow is required. */}
      <div className="session-itinerary-card">
        <span className="session-itinerary-card-label">Window</span>
        <span className="session-itinerary-card-body">{windowLabel}</span>
        {selectedWindow.note && (
          <span className="session-itinerary-card-note">
            {selectedWindow.note}
          </span>
        )}
      </div>

      {/* MEETING POINT card — only when set. */}
      {hasMeetingPoint && (
        <div className="session-itinerary-card">
          <span className="session-itinerary-card-label">Meeting point</span>
          <span className="session-itinerary-card-body session-itinerary-card-body-multiline">
            {meetingPoint}
          </span>
          <a
            className="session-itinerary-link"
            href={appleMapsLink(meetingPoint as string)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Maps
          </a>
        </div>
      )}

      {/* CONTACT card — only when set; perspective swaps the label. */}
      {hasContact && (
        <div className="session-itinerary-card">
          <span className="session-itinerary-card-label">
            {contactCardLabel(perspective)}
          </span>
          <span className="session-itinerary-card-body">{contactNumber}</span>
          <a
            className="session-itinerary-call-button"
            href={telLink(contactNumber as string)}
          >
            Call
          </a>
        </div>
      )}

      {/* NOTES card — only when set + non-empty; perspective swaps label. */}
      {hasNotes && (
        <div className="session-itinerary-card">
          <span className="session-itinerary-card-label">
            {notesCardLabel(perspective)}
          </span>
          <ul className="session-itinerary-list">
            {(dayOfNotes as string[]).map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SAFETY card — always visible, muted rose-bronze accent. */}
      <div className="session-itinerary-card session-itinerary-card-safety">
        <span className="session-itinerary-card-label">Safety</span>
        <ul className="session-itinerary-list">
          {SAFETY_REMINDERS.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
