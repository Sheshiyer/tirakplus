// AgeConsentPage.tsx — P0 net-new surface.
//
// Pre-OTP gate that sits BEFORE /auth/start (role pick) and BEFORE
// /auth/verify (code entry). Required on every device once; persisted
// to localStorage via src/app/api/consent.ts so a returning user
// doesn't re-gate every visit.
//
// Layout follows the inspiration board (Mobile / Tablet / Desktop /
// Wide-Desktop frames at:
//   generated/web-reference-boards/gpt-image-2/age-consent-auth-responsive-board.png
//
//   - <1024px : single column stack of 3 AuthCardShells
//               (AgeGate, ConsentChecklist, email + CTA).
//   - >=1024px: 2-column grid — form column on left,
//               <PrivateAccessHero/> aside on right.
//
// On submit we writeConsent() then navigate to either `from` (if a
// guard bounced the user here) or /auth/start with `?email=` so
// AuthStart can pre-fill and skip step 1 of the OTP flow. The
// AuthStart redirect-guard + email-prefill is wired in a separate
// minimal edit to AuthStart.tsx (only useEffect + ?email pre-fill).

import { FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AgeGate } from "../components/auth/AgeGate";
import { AuthCardShell } from "../components/auth/AuthCardShell";
import { ConsentChecklist, type ConsentChecklistValue } from "../components/auth/ConsentChecklist";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { buildConsentRecord, writeConsent } from "../api/consent";
import { AssetRegistry } from "../registry/assets";

// Loose RFC-5322ish — same shape AuthStart and other forms use.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = {
  ageConfirmed: boolean;
  consentDiscretion: boolean;
  consentRespect: boolean;
  consentTerms: boolean;
  email: string;
};

const INITIAL_STATE: FormState = {
  ageConfirmed: false,
  consentDiscretion: false,
  consentRespect: false,
  consentTerms: false,
  email: "",
};

export function AgeConsentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);

  const fromLocation = (location.state as {
    from?: { pathname?: string; search?: string };
  } | null)?.from;
  const fromPath = fromLocation?.pathname
    ? `${fromLocation.pathname}${fromLocation.search ?? ""}`
    : undefined;

  const consentValue: ConsentChecklistValue = useMemo(
    () => ({
      consentDiscretion: form.consentDiscretion,
      consentRespect: form.consentRespect,
      consentTerms: form.consentTerms,
    }),
    [form.consentDiscretion, form.consentRespect, form.consentTerms],
  );

  const emailValid = EMAIL_REGEX.test(form.email.trim());
  const canContinue =
    form.ageConfirmed &&
    form.consentDiscretion &&
    form.consentRespect &&
    form.consentTerms &&
    emailValid;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canContinue) return;

    writeConsent(
      buildConsentRecord({
        ageConfirmed: form.ageConfirmed,
        consentDiscretion: form.consentDiscretion,
        consentRespect: form.consentRespect,
        consentTerms: form.consentTerms,
      }),
    );

    const email = form.email.trim();

    // If a guard kicked us here from /auth/start (or anywhere downstream),
    // honor that destination but still propagate the email so the user
    // doesn't have to re-type it. Otherwise default to /auth/start.
    const target = fromPath ?? "/auth/start";
    const targetUrl = new URL(target, window.location.origin);
    targetUrl.searchParams.set("email", email);
    const search = targetUrl.search;
    const pathname = targetUrl.pathname;

    navigate(
      { pathname, search },
      { replace: true, state: { email } },
    );
  };

  return (
    <section className="age-consent-page" aria-label="Age confirmation and consent">
      <div className="age-consent-page-inner">
        <header className="age-consent-brand-chip" aria-label="Tirak Plus">
          <img
            src={AssetRegistry.brand.logoWhite}
            alt=""
            className="age-consent-brand-mark"
            aria-hidden="true"
          />
          <span className="age-consent-brand-text">Tirak Plus</span>
        </header>

        <div className="age-consent-grid">
          <form
            className="age-consent-form-column"
            onSubmit={handleSubmit}
            aria-label="Confirm age and consent"
          >
            <AuthCardShell ariaLabel="Age gate card">
              <AgeGate
                confirmed={form.ageConfirmed}
                onChange={(next) => setForm((prev) => ({ ...prev, ageConfirmed: next }))}
              />
            </AuthCardShell>

            <AuthCardShell ariaLabel="Consent checklist card">
              <ConsentChecklist
                value={consentValue}
                onChange={(next) =>
                  setForm((prev) => ({
                    ...prev,
                    consentDiscretion: next.consentDiscretion,
                    consentRespect: next.consentRespect,
                    consentTerms: next.consentTerms,
                  }))
                }
              />
            </AuthCardShell>

            <AuthCardShell ariaLabel="Email and continue card">
              <p className="eyebrow age-consent-contact-eyebrow">Contact</p>
              <Input
                id="age-consent-email"
                type="email"
                label="Your email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                autoComplete="email"
                inputMode="email"
                required
              />

              <Button
                type="submit"
                variant="coral"
                fullWidth
                disabled={!canContinue}
                aria-disabled={!canContinue}
              >
                Continue
              </Button>

              <p className="age-consent-reassurance">
                Your acceptance is kept on this device only.
              </p>
            </AuthCardShell>
          </form>

          <PrivateAccessHero />
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------
// Right-side desktop-only hero — defined inline because it is purely
// presentational, never reused, and lives entirely inside this page's
// layout grid. Hidden on mobile via the .age-consent-aside CSS rule.
// --------------------------------------------------------------------

const HERO_BULLETS: { icon: React.ReactNode; label: string }[] = [
  {
    icon: <HeroIcon kind="check" />,
    label: "Curated companions, vetted in person",
  },
  {
    icon: <HeroIcon kind="lock" />,
    label: "End-to-end private channel",
  },
  {
    icon: <HeroIcon kind="card" />,
    label: "Discreet payment + records",
  },
  {
    icon: <HeroIcon kind="pin" />,
    label: "Bangkok-led, Thailand-wide",
  },
];

function PrivateAccessHero() {
  return (
    <aside className="age-consent-aside" aria-label="Private concierge access">
      <div className="private-access-hero">
        <p className="eyebrow private-access-eyebrow">Private access</p>
        <h2 className="private-access-title">Private concierge access</h2>
        <ul className="private-access-list">
          {HERO_BULLETS.map((bullet) => (
            <li key={bullet.label} className="private-access-item">
              <span className="private-access-icon" aria-hidden="true">
                {bullet.icon}
              </span>
              <span className="private-access-label">{bullet.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function HeroIcon({ kind }: { kind: "check" | "lock" | "card" | "pin" }) {
  switch (kind) {
    case "check":
      return (
        <svg viewBox="0 0 20 20" fill="none" focusable="false" aria-hidden="true">
          <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6.5 10.4l2.5 2.4 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "lock":
      return (
        <svg viewBox="0 0 20 20" fill="none" focusable="false" aria-hidden="true">
          <rect x="4.5" y="9" width="11" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 9V7a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "card":
      return (
        <svg viewBox="0 0 20 20" fill="none" focusable="false" aria-hidden="true">
          <rect x="3" y="5.5" width="14" height="9" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 8.8h14" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "pin":
      return (
        <svg viewBox="0 0 20 20" fill="none" focusable="false" aria-hidden="true">
          <path d="M10 17s5-4.6 5-9a5 5 0 10-10 0c0 4.4 5 9 5 9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="10" cy="8" r="1.7" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
  }
}
