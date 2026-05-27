// ConsentChecklist.tsx — P0 age-consent gate.
//
// Controlled checklist of the 3 non-age consent acknowledgments.
// Renders inside an AuthCardShell on the AgeConsentPage. Each row
// is a single clickable button so tapping anywhere on the row
// (icon, label, sublabel, or custom checkbox) toggles. Keyboard
// accessible via the native <button>. The Terms + Privacy links
// inside the third row use stopPropagation so clicking them
// navigates without flipping the checkbox state.
//
// No lucide-react in package.json today — inline SVGs keep the
// dependency surface unchanged and avoid an extra build step.
import React from "react";
import { Link } from "react-router-dom";

export type ConsentChecklistValue = {
  consentDiscretion: boolean;
  consentRespect: boolean;
  consentTerms: boolean;
};

export type ConsentChecklistProps = {
  value: ConsentChecklistValue;
  onChange: (next: ConsentChecklistValue) => void;
  disabled?: boolean;
};

type RowKey = keyof ConsentChecklistValue;

type RowDef = {
  key: RowKey;
  icon: React.ReactNode;
  label: string;
  sublabel: React.ReactNode;
};

// Currency for screen readers: each row is a checkbox toggle.
// Author's note: copy is product-locked for P0 — see consent.ts
// CONSENT_STORAGE_KEY version bump if this changes materially.
const ROWS: RowDef[] = [
  {
    key: "consentDiscretion",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" className="consent-row-icon-svg">
        <path
          d="M12 2.5l8 3v6.4c0 4.2-2.7 7.9-8 9.6-5.3-1.7-8-5.4-8-9.6V5.5l8-3z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          fill="rgba(255,125,107,0.08)"
        />
        <path
          d="M9 12.2l2.2 2.2L15.5 10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    label: "Discreet by default",
    sublabel: "I will keep all interactions private.",
  },
  {
    key: "consentRespect",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" className="consent-row-icon-svg">
        <path
          d="M12 20.5s-7.5-4.4-7.5-10.2A4.3 4.3 0 0112 6.6a4.3 4.3 0 017.5 3.7c0 5.8-7.5 10.2-7.5 10.2z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          fill="rgba(255,125,107,0.08)"
        />
      </svg>
    ),
    label: "Mutual respect",
    sublabel: "Curated companionship — never transactional.",
  },
  {
    key: "consentTerms",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" className="consent-row-icon-svg">
        <path
          d="M6 3h9l3 3v15H6V3z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          fill="rgba(255,125,107,0.08)"
        />
        <path
          d="M14 3v4h4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9 12h6M9 15.5h6M9 19h4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    label: "Terms acknowledged",
    sublabel: (
      <>
        I agree to the{" "}
        <Link to="/terms" onClick={(e) => e.stopPropagation()}>
          Terms
        </Link>{" "}
        and{" "}
        <Link to="/privacy" onClick={(e) => e.stopPropagation()}>
          Privacy
        </Link>
        .
      </>
    ),
  },
];

export function ConsentChecklist({ value, onChange, disabled }: ConsentChecklistProps) {
  const toggle = (key: RowKey) => {
    if (disabled) return;
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="consent-checklist">
      <p className="eyebrow consent-checklist-eyebrow">Consent</p>

      <div className="consent-checklist-rows">
        {ROWS.map((row) => {
          const checked = value[row.key];
          return (
            <button
              key={row.key}
              type="button"
              role="checkbox"
              aria-checked={checked}
              aria-label={row.label}
              disabled={disabled}
              onClick={() => toggle(row.key)}
              className={`consent-row${checked ? " is-checked" : ""}`}
            >
              <span className="consent-row-icon" aria-hidden="true">
                {row.icon}
              </span>
              <span className="consent-row-copy">
                <span className="consent-row-label">{row.label}</span>
                <span className="consent-row-sublabel">{row.sublabel}</span>
              </span>
              <span
                className={`consent-checkbox${checked ? " is-checked" : ""}`}
                aria-hidden="true"
              >
                {checked ? (
                  <svg viewBox="0 0 16 16" fill="none" focusable="false">
                    <path
                      d="M3.5 8.5l3 3 6-6.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
