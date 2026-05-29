/**
 * LocationField — pin-iconed text input for the traveller's preferred
 * meeting place.
 *
 * P2.T3 (2026-05-28). Presentational + controlled. Feeds the composer's
 * `location` value (the traveller's PREFERENCE; the companion's confirmed
 * `meetingPoint` is a separate H5 field set day-of).
 *
 * The shared `Input` primitive renders a fixed label/helper/input/error
 * stack with no slot for a leading adornment, so this builds a styled
 * wrapper around a native input + inline pin SVG instead. Label + helper
 * markup mirror `Input`'s class names (`field`, `field-label`) so it
 * inherits the same dark-on-glass treatment.
 */
import { useId } from "react";

export type LocationFieldProps = {
  value: string;
  onChange: (next: string) => void;
  maxLength?: number;
  disabled?: boolean;
};

const PinIcon = (
  <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path
      d="M9 1.5a5 5 0 0 0-5 5c0 3.6 5 9.5 5 9.5s5-5.9 5-9.5a5 5 0 0 0-5-5Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <circle cx="9" cy="6.5" r="1.8" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

// Show the counter only when the traveller is within this many chars of
// the cap, so it stays out of the way until it actually matters.
const COUNTER_THRESHOLD = 40;

export function LocationField({
  value,
  onChange,
  maxLength = 200,
  disabled = false,
}: LocationFieldProps) {
  const inputId = useId();
  const remaining = maxLength - value.length;
  const showCount = value.length >= maxLength - COUNTER_THRESHOLD;
  const nearLimit = remaining <= 10;

  return (
    <div className="field composer-location-field">
      <label htmlFor={inputId} className="field-label">
        Where would you like to meet?
      </label>
      <div
        className={`composer-location-field__control${
          disabled ? " is-disabled" : ""
        }`}
      >
        <span className="composer-location-field__icon" aria-hidden="true">
          {PinIcon}
        </span>
        <input
          id={inputId}
          type="text"
          className="field-input composer-location-field__input"
          placeholder="Hotel lobby or restaurant"
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {showCount ? (
        <div
          className={`composer-location-field__count${
            nearLimit ? " is-near-limit" : ""
          }`}
          aria-live="polite"
        >
          {value.length} / {maxLength}
        </div>
      ) : null}
    </div>
  );
}
