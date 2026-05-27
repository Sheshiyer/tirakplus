// AgeGate.tsx — P0 age-consent gate.
//
// Controlled 18+ confirmation toggle. Renders inside an AuthCardShell
// on the AgeConsentPage. The whole row (toggle pill + label) is a
// single clickable element so tapping anywhere — pill OR label —
// flips the switch. Keyboard accessible: focusable button with
// Enter/Space handled natively by <button>.
//
// Visual: eyebrow "AGE GATE" → pill switch (coral when on) + label
// "I am 18 years or older". No persistence here — parent owns state.
import React from "react";

export type AgeGateProps = {
  confirmed: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
};

export function AgeGate({ confirmed, onChange, disabled }: AgeGateProps) {
  const handleToggle = () => {
    if (disabled) return;
    onChange(!confirmed);
  };

  return (
    <div className="age-gate">
      <p className="eyebrow age-gate-eyebrow">Age gate</p>

      <button
        type="button"
        role="switch"
        aria-checked={confirmed}
        aria-label="I am 18 years or older"
        disabled={disabled}
        onClick={handleToggle}
        className={`age-gate-row${confirmed ? " is-on" : ""}`}
      >
        <span className={`age-gate-toggle${confirmed ? " is-on" : ""}`} aria-hidden="true">
          <span className="age-gate-toggle-thumb" />
        </span>
        <span className="age-gate-label">I am 18 years or older</span>
      </button>
    </div>
  );
}
