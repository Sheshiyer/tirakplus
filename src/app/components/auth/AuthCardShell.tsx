// AuthCardShell.tsx — P0 age-consent gate.
//
// Pure presentational wrapper used 3x on mobile (one per AgeGate /
// ConsentChecklist / email card) and composed inside the left form
// column on desktop. Lives in components/auth/ so the rest of the
// auth surface (and any future pre-OTP cards) can reuse the same
// glassmorphic shell without re-implementing the styling.
//
// All visual treatment lives in the `.auth-card-shell` rule in
// styles.css — keep this component dumb so a designer can re-skin
// the surface without touching React.
import React from "react";

export type AuthCardShellProps = {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
};

export function AuthCardShell({ children, className, ariaLabel }: AuthCardShellProps) {
  return (
    <section
      className={`auth-card-shell ${className ?? ""}`.trim()}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
}
