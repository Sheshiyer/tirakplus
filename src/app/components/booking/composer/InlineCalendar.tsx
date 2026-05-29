/**
 * InlineCalendar — availability-gated month-grid date picker.
 *
 * P2.T3 (2026-05-28). Presentational + locally-stateful (owns only the
 * visible-month cursor; the selected date is controlled by the parent).
 *
 * Availability gating: the parent (T5) passes the FULL list of open ISO
 * dates (`availableDates`); this component buckets them by month internally
 * and disables every day not in the list. The coral filled disc marks the
 * selected day; "today" (computed in Asia/Bangkok) gets a subtle ring.
 *
 * Keyboard: each day and the month chevrons are native <button>s, so click
 * + Enter/Space work out of the box. Arrow-key roving is intentionally left
 * out of v1 (the spec marks it optional).
 */
import { useMemo, useState } from "react";

export type InlineCalendarProps = {
  /** ISO date strings (YYYY-MM-DD) the companion is open. */
  availableDates: string[];
  /** Currently selected ISO date, or null. */
  selectedDate: string | null;
  onSelectDate: (isoDate: string) => void;
  /**
   * Initial month relative to the current Bangkok month (0 = this month,
   * 1 = next month, ...). The component manages navigation from there via
   * the prev/next chevrons.
   */
  monthOffset?: number;
};

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Today's date as a YYYY-MM-DD string in Asia/Bangkok, regardless of the
 * viewer's local timezone. `en-CA` yields ISO-ordered parts.
 */
function bangkokTodayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Pad a 1-based month or a day number to a 2-char string. */
function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** Build a YYYY-MM-DD key from year + 0-based month + day. */
function isoKey(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

type DayCell = {
  day: number;
  iso: string;
  available: boolean;
  isToday: boolean;
  isSelected: boolean;
};

export function InlineCalendar({
  availableDates,
  selectedDate,
  onSelectDate,
  monthOffset = 0,
}: InlineCalendarProps) {
  const todayIso = useMemo(() => bangkokTodayIso(), []);

  // Anchor "this month" to Bangkok's current month so the grid matches the
  // timezone used for availability + today.
  const [todayYear, todayMonthIndex] = useMemo(() => {
    const [y, m] = todayIso.split("-").map(Number);
    return [y, m - 1] as const;
  }, [todayIso]);

  // Local cursor: months away from Bangkok's current month. Seeded from the
  // monthOffset prop, then driven by the chevrons.
  const [cursorOffset, setCursorOffset] = useState(monthOffset);

  const fastDateSet = useMemo(() => new Set(availableDates), [availableDates]);

  const view = useMemo(() => {
    // Normalise the cursor into a concrete year + 0-based month.
    const base = new Date(todayYear, todayMonthIndex + cursorOffset, 1);
    const year = base.getFullYear();
    const monthIndex = base.getMonth();
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const cells: (DayCell | null)[] = [];
    // Leading blanks so day 1 lands under its weekday column.
    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push(null);
    }
    let monthHasAvailability = false;
    for (let day = 1; day <= daysInMonth; day += 1) {
      const iso = isoKey(year, monthIndex, day);
      const available = fastDateSet.has(iso);
      if (available) monthHasAvailability = true;
      cells.push({
        day,
        iso,
        available,
        isToday: iso === todayIso,
        isSelected: iso === selectedDate,
      });
    }

    return {
      year,
      monthIndex,
      cells,
      monthHasAvailability,
      label: `${MONTH_LABELS[monthIndex]} ${year}`,
    };
  }, [todayYear, todayMonthIndex, cursorOffset, fastDateSet, todayIso, selectedDate]);

  return (
    <div className="composer-calendar" role="group" aria-label="Choose a date">
      <div className="composer-calendar__header">
        <button
          type="button"
          className="composer-calendar__nav"
          aria-label="Previous month"
          onClick={() => setCursorOffset((offset) => offset - 1)}
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="composer-calendar__month" aria-live="polite">
          {view.label}
        </p>
        <button
          type="button"
          className="composer-calendar__nav"
          aria-label="Next month"
          onClick={() => setCursorOffset((offset) => offset + 1)}
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="composer-calendar__weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="composer-calendar__weekday">
            {label}
          </span>
        ))}
      </div>

      <div className="composer-calendar__grid" role="grid">
        {view.cells.map((cell, index) => {
          if (!cell) {
            return <span key={`blank-${index}`} className="composer-calendar__blank" aria-hidden="true" />;
          }
          const classes = [
            "composer-calendar__day",
            cell.available ? "is-available" : "is-disabled",
            cell.isToday ? "is-today" : "",
            cell.isSelected ? "is-selected" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={cell.iso}
              type="button"
              role="gridcell"
              className={classes}
              disabled={!cell.available}
              aria-pressed={cell.isSelected}
              aria-label={cell.iso}
              onClick={() => cell.available && onSelectDate(cell.iso)}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {!view.monthHasAvailability ? (
        <p className="composer-calendar__empty">No open days this month — try next</p>
      ) : null}
    </div>
  );
}
