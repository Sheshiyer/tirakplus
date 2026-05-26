import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../api/AuthContext";
import { AssetRegistry } from "../registry/assets";
import type { UserRole } from "../../shared/contracts";

export function AuthStart() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, isLoading, error } = useAuth();
  const fromLocation = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const fromPath = fromLocation?.pathname ? `${fromLocation.pathname}${fromLocation.search ?? ""}` : undefined;
  const intendedRole: Extract<UserRole, "traveller" | "companion"> =
    searchParams.get("role") === "companion" || fromPath?.startsWith("/companion") ? "companion" : "traveller";

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await login(email);
        navigate("/auth/verify", { state: { email, role: intendedRole, from: fromPath } });
      } catch (err) {
        // Handle error if needed (T034)
      }
    }
  };

  return (
    <section className="auth-page public-business-page-immersive">
      <div className="auth-panel">
        <div className="auth-muse-card" aria-label="Muse private entry">
          <span className="auth-muse-orb" aria-hidden="true">
            <img src={AssetRegistry.muse.floating.idleStart} alt="" />
          </span>
          <div>
            <p className="eyebrow">Muse entry</p>
            <p>Use one private code to keep your trip, profile, and messages together.</p>
          </div>
        </div>
        <div className="auth-heading">
          <h1>Enter privately</h1>
          <p>
            {intendedRole === "companion"
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
