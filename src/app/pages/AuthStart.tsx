import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../api/AuthContext";
import { hasValidConsent } from "../api/consent";
import { AssetRegistry } from "../registry/assets";
import type { UserRole } from "../../shared/contracts";

type AuthRole = Extract<UserRole, "traveller" | "companion">;
type Step = "role" | "email";

export function AuthStart() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, isLoading, error } = useAuth();

  // Age-consent gate (P0). If the user hasn't accepted on this device,
  // bounce to /age-consent and capture the original destination so we
  // can return them here after consent. Runs only on mount — once
  // consent is accepted in localStorage the redirect won't re-fire on
  // re-renders.
  useEffect(() => {
    if (!hasValidConsent()) {
      navigate("/age-consent", {
        replace: true,
        state: { from: { pathname: "/auth/start", search: location.search } },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-fill from ?email=... — AgeConsentPage hands us the email so the
  // user doesn't have to retype it after consenting. State.email from
  // navigate({state}) takes precedence if both are present (covers SPA
  // navigation that intentionally doesn't expose email in the URL).
  const stateEmail = (location.state as { email?: string } | null)?.email;
  const queryEmail = searchParams.get("email") ?? "";
  const initialEmail = (stateEmail ?? queryEmail).trim();
  const [email, setEmail] = useState(initialEmail);

  const fromLocation = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const fromPath = fromLocation?.pathname ? `${fromLocation.pathname}${fromLocation.search ?? ""}` : undefined;

  // Honor explicit role hints (URL param ?role=…, or arriving from a
  // protected /companion/* path). If neither is present we make the
  // user pick explicitly — the dashboard the user lands on depends on
  // this choice, so it must be a deliberate selection, not inferred
  // from URL accident.
  const hintedRole: AuthRole | null =
    searchParams.get("role") === "companion" || fromPath?.startsWith("/companion")
      ? "companion"
      : searchParams.get("role") === "traveller" || fromPath?.startsWith("/traveller")
      ? "traveller"
      : null;

  // If we have a hinted role we always start at the email step. If we
  // also have a pre-filled email (from the age-consent handoff), we're
  // already deep enough into step 2 that the user just needs to confirm
  // and submit — no role re-pick required.
  const [step, setStep] = useState<Step>(hintedRole ? "email" : "role");
  const [role, setRole] = useState<AuthRole | null>(hintedRole);

  const handleRoleSelect = (chosen: AuthRole) => {
    setRole(chosen);
    setStep("email");
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && role) {
      try {
        await login(email);
        // Pass role to /auth/verify — verify() uses it both to set the
        // session profile.role AND to choose the dashboard to land on
        // (post-auth navigation in AuthVerify checks role).
        navigate("/auth/verify", { state: { email, role, from: fromPath } });
      } catch (err) {
        // Handle error if needed (T034)
      }
    }
  };

  // ---- STEP 1: Role selection ----------------------------------------
  if (step === "role") {
    return (
      <section className="auth-page public-business-page-immersive">
        <div className="auth-panel">
          <div className="auth-muse-card" aria-label="Muse private entry">
            <span className="auth-muse-orb" aria-hidden="true">
              <img src={AssetRegistry.muse.floating.idleStart} alt="" />
            </span>
            <div>
              <p className="eyebrow">Muse entry</p>
              <p>Pick your side first — your dashboard, tools, and messages all follow this choice.</p>
            </div>
          </div>

          <div className="auth-heading">
            <h1>How are you joining?</h1>
            <p>You can switch later from the account menu.</p>
          </div>

          <div className="auth-role-grid" role="group" aria-label="Choose your role">
            <button
              type="button"
              className="auth-role-card"
              data-role="traveller"
              onClick={() => handleRoleSelect("traveller")}
            >
              <p className="eyebrow">Traveller</p>
              <h2>I'm planning a Thailand trip</h2>
              <p>Find a private guide, save companion profiles, and keep your plans together.</p>
              <span className="auth-role-card-cta">Continue as traveller →</span>
            </button>

            <button
              type="button"
              className="auth-role-card"
              data-role="companion"
              onClick={() => handleRoleSelect("companion")}
            >
              <p className="eyebrow">Companion</p>
              <h2>I'm joining to host travellers</h2>
              <p>Set up your profile, manage availability, and review inquiries privately.</p>
              <span className="auth-role-card-cta">Continue as companion →</span>
            </button>
          </div>

          <p className="auth-terms">
            By continuing, you agree to keep messages respectful and plans private.
            {" "}<Link to="/safety">Read the safety notes</Link>.
          </p>
        </div>
      </section>
    );
  }

  // ---- STEP 2: Email entry (role is locked in) -----------------------
  return (
    <section className="auth-page public-business-page-immersive">
      <div className="auth-panel">
        <button
          type="button"
          className="auth-back-link"
          onClick={() => setStep("role")}
        >
          ← Change role
        </button>

        <div className="auth-muse-card" aria-label="Muse private entry">
          <span className="auth-muse-orb" aria-hidden="true">
            <img src={AssetRegistry.muse.floating.idleStart} alt="" />
          </span>
          <div>
            <p className="eyebrow">{role === "companion" ? "Companion entry" : "Traveller entry"}</p>
            <p>
              {role === "companion"
                ? "We will keep your profile, availability, and inquiries on this email."
                : "We will keep your trip context, saved profiles, and messages on this email."}
            </p>
          </div>
        </div>

        <div className="auth-heading">
          <h1>Enter privately</h1>
          <p>
            {role === "companion"
              ? "Open your profile, availability, and messages."
              : "Open your trip context, saved profiles, and messages."}
          </p>
        </div>

        <form onSubmit={handleContinue} className="auth-form">
          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          {error && (
            <p className="auth-error">
              {error.message || "Failed to send verification code."}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={!email || isLoading}
          >
            {isLoading ? "Sending code..." : "Send private code"}
          </Button>
        </form>

        <p className="auth-terms">
          By continuing, you agree to keep messages respectful and plans private.
          {" "}<Link to="/safety">Read the safety notes</Link>.
        </p>
      </div>
    </section>
  );
}
