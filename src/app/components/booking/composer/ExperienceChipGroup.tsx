/**
 * ExperienceChipGroup — the 5 ExperienceSlug values as single-select icon
 * chips for the inquiry composer.
 *
 * P2.T3 (2026-05-28). Presentational + controlled. Reuses the 5 existing
 * `ExperienceSlug` values (no new taxonomy). lucide-react is NOT installed,
 * so each chip carries a small inline SVG icon. Single-select: clicking the
 * active chip leaves it active (the composer owns clearing if it ever needs
 * to).
 */
import type { ReactNode } from "react";
import type { ExperienceSlug } from "../../../../shared/contracts";

export type ExperienceChipGroupProps = {
  selected: ExperienceSlug | null;
  onSelect: (slug: ExperienceSlug) => void;
};

type ExperienceOption = {
  slug: ExperienceSlug;
  label: string;
  icon: ReactNode;
};

// Moon + sparkle — nightlife.
const NightlifeIcon = (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M16 11.4A6 6 0 0 1 8.6 4a6 6 0 1 0 7.4 7.4Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M15 3.5v2.2M13.9 4.6h2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

// Palm island over a waterline — island explorer.
const IslandIcon = (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 11c0-2.8 2.1-5 4.8-5M10 11c0-2.8-2.1-5-4.8-5M10 11V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M6.5 14.5c3.2 1.4 3.8 1.4 7 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M2.5 16.8c2 1.3 3.4 1.3 5 .2 1.7 1.2 3.4 1.2 5 0 1.7 1.1 3 1 5-.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Boxing glove — Muay Thai night.
const MuayThaiIcon = (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M6 8.5c0-2.2 1.6-3.5 4-3.5h2.5A2.5 2.5 0 0 1 15 7.5v3a3 3 0 0 1-3 3H8.5A2.5 2.5 0 0 1 6 11V8.5Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M6 9.2H5A1.5 1.5 0 0 0 5 12.2h1M10 8.6v1.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

// Plate + fork & knife — private dining.
const DiningIcon = (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="11" cy="10" r="4.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M4 4v5M4 4c0 0-1 .3-1 2s1 2 1 2M4 9v7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

// Map pin with a compass dot — local guidance.
const GuidanceIcon = (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M10 2.5a5 5 0 0 0-5 5c0 3.6 5 10 5 10s5-6.4 5-10a5 5 0 0 0-5-5Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="m11.6 6 -.9 2.4 -2.3 .9 .9-2.4L11.6 6Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  { slug: "nightlife", label: "Nightlife", icon: NightlifeIcon },
  { slug: "island-explorer", label: "Island explorer", icon: IslandIcon },
  { slug: "muay-thai-night", label: "Muay Thai night", icon: MuayThaiIcon },
  { slug: "private-dining", label: "Private dining", icon: DiningIcon },
  { slug: "local-guidance", label: "Local guidance", icon: GuidanceIcon },
];

export function ExperienceChipGroup({ selected, onSelect }: ExperienceChipGroupProps) {
  return (
    <div
      className="composer-experience-group"
      role="radiogroup"
      aria-label="What kind of experience?"
    >
      {EXPERIENCE_OPTIONS.map((option) => {
        const isSelected = option.slug === selected;
        return (
          <button
            key={option.slug}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`composer-experience-chip${isSelected ? " is-selected" : ""}`}
            onClick={() => onSelect(option.slug)}
          >
            <span className="composer-experience-chip__icon" aria-hidden="true">
              {option.icon}
            </span>
            <span className="composer-experience-chip__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
