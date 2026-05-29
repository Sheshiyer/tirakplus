/**
 * TimeSlotChips — preset time pills for the selected day.
 *
 * P2.T3 (2026-05-28). Presentational + controlled. The parent (T5) derives
 * `slots` from the selected day's availability window and passes them in as
 * 24h "HH:mm" strings; this renders them as selectable pills with a friendly
 * 12h display label. Until a date is picked the group is `disabled` and shows
 * a "Pick a date first" hint instead of pills.
 */

export type TimeSlotChipsProps = {
  slots: string[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
  disabled?: boolean;
};

/**
 * Render a 24h "HH:mm" string as a friendly 12h label, e.g. "19:00" -> "7:00 PM".
 * Falls back to the raw value if it doesn't parse, so a malformed slot is
 * never silently dropped.
 */
function formatSlotLabel(slot: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(slot.trim());
  if (!match) return slot;
  const hour = Number(match[1]);
  const minute = match[2];
  if (Number.isNaN(hour) || hour < 0 || hour > 23) return slot;
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
}

export function TimeSlotChips({
  slots,
  selectedSlot,
  onSelectSlot,
  disabled = false,
}: TimeSlotChipsProps) {
  if (disabled) {
    return (
      <div className="composer-time-slots is-disabled" aria-disabled="true">
        <p className="composer-time-slots__hint">Pick a date first</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="composer-time-slots is-empty">
        <p className="composer-time-slots__hint">No preset times for this day</p>
      </div>
    );
  }

  return (
    <div
      className="composer-time-slots"
      role="radiogroup"
      aria-label="Preferred start time"
    >
      {slots.map((slot) => {
        const isSelected = slot === selectedSlot;
        return (
          <button
            key={slot}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`composer-time-slot-chip${isSelected ? " is-selected" : ""}`}
            onClick={() => onSelectSlot(slot)}
          >
            {formatSlotLabel(slot)}
          </button>
        );
      })}
    </div>
  );
}
