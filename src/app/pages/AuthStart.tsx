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

  const handleDevAccess = async (role: Extract<UserRole, "traveller" | "companion">) => {
    const devEmail = role === "traveller" ? "dev.traveller@tirakplus.local" : "dev.companion@tirakplus.local";
    const fallbackPath = role === "traveller" ? "/traveller/dashboard" : "/companion/dashboard";
    const targetPath =
      fromPath && fromPath.startsWith(role === "traveller" ? "/traveller" : "/companion") ? fromPath : fallbackPath;
    await verify(devEmail, "123456", role);
    navigate(targetPath, { replace: true });
  };

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <div className="auth-heading">
          <h1>Sign in to continue</h1>
          <p>
            {intendedRole === "companion"
              ? "Sign in to manage your profile, availability, and messages."
              : "Sign in to keep your trip context, saved profiles, and messages private."}
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
          By continuing, you agree to keep messages respectful and to use Tirak Plus for private, safety-aware plans.
          {" "}<Link to="/safety">Read the safety notes</Link>.
        </p>

        <div className="auth-dev-panel" aria-label="Sample account access">
          <p className="meta">Sample account</p>
          <div className="auth-dev-actions">
            <Button type="button" variant="secondary" onClick={() => void handleDevAccess("traveller")} disabled={isLoading}>
              Traveller sample
            </Button>
            <Button type="button" variant="secondary" onClick={() => void handleDevAccess("companion")} disabled={isLoading}>
              Companion sample
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
