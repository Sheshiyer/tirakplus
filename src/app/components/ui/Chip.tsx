/**
 * Chip — small reusable pill for status / location / verification labels.
 *
 * P1.T1 (2026-05-28). Used by CompanionProfilePage hero chip row
 * (`city` + `verified`) and ready for adoption on other surfaces
 * (inquiry composer, plan summary, etc.) where compact metadata pills
 * are needed.
 *
 * Variants:
 *   default   — pearl-on-glass, neutral
 *   verified  — green tinted, for trust labels
 *   location  — coral tinted, for place/city
 *   muted     — low-emphasis, secondary metadata
 *
 * Icons are optional and rendered as siblings (you bring the SVG).
 * Sizing/padding are intrinsic so chips compose naturally in flex rows.
 */
import type { ReactNode } from "react";

export type ChipVariant = "default" | "verified" | "location" | "muted";

export type ChipProps = {
  children: ReactNode;
  variant?: ChipVariant;
  icon?: ReactNode;
  className?: string;
};

export function Chip({ children, variant = "default", icon, className = "" }: ChipProps) {
  const classes = ["chip", `chip-${variant}`, className].filter(Boolean).join(" ");
  return (
    <span className={classes}>
      {icon ? (
        <span className="chip-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="chip-label">{children}</span>
    </span>
  );
}
