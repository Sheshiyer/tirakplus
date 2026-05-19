import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../api/AuthContext";
import type { UserRole } from "../../shared/contracts";

export function AuthStart() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, verify, isLoading, error } = useAuth();
  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
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

  const handleDevAccess = async (role: Extract<UserRole, "traveller" | "companion">) => {
    const devEmail = role === "traveller" ? "dev.traveller@tirakplus.local" : "dev.companion@tirakplus.local";
    await verify(devEmail, "123456", role);
    navigate(role === "traveller" ? "/traveller/dashboard" : "/companion/dashboard", { replace: true });
  };

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <div className="auth-heading">
          <h1>Continue with Tirak Plus</h1>
          <p>
            {intendedRole === "companion"
              ? "Create or manage a reviewed companion profile with visibility controls."
              : "Enter the private traveller path after Muse has shaped the route."}
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
            {isLoading ? "Sending code..." : "Continue with email"}
          </Button>
        </form>

        <p className="auth-terms">
          By continuing, you accept the safety and privacy rules that keep introductions reviewed, respectful, and visibility-aware.
          {" "}<Link to="/safety">Review them before continuing</Link>.
        </p>

        <div className="auth-dev-panel" aria-label="Development access">
          <p className="meta">Development access</p>
          <div className="auth-dev-actions">
            <Button type="button" variant="secondary" onClick={() => void handleDevAccess("traveller")} disabled={isLoading}>
              Traveller QA
            </Button>
            <Button type="button" variant="secondary" onClick={() => void handleDevAccess("companion")} disabled={isLoading}>
              Companion QA
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
