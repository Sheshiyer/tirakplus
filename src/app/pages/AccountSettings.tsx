import { useAuth } from "../api/AuthContext";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

export function AccountSettings() {
  const { session, logout, switchRole, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSwitchRole = async () => {
    if (session?.profile.role === "traveller") {
      await switchRole("companion");
      navigate("/companion");
    } else {
      await switchRole("traveller");
      navigate("/traveller");
    }
  };

  if (!session) return null;

  const currentRole = session.profile.role;
  const targetRole = currentRole === "traveller" ? "companion" : "traveller";

  return (
    <section className="account-page">
      <div className="account-heading">
        <p className="eyebrow">Account and privacy</p>
        <h1>Your protected Tirak Plus profile.</h1>
        <p>Manage the signed-in role, private session state, and visibility expectations used during development QA.</p>
      </div>

      <div className="account-panel">
        <div className="account-row">
          <div>
            <h2>Dev persona rail</h2>
            <p>
              You are currently viewing the protected app as a <strong>{currentRole}</strong>. Role switching is available
              here so traveller and companion flows can be QA-tested without creating throwaway accounts.
            </p>
          </div>
          <Button variant="secondary" onClick={handleSwitchRole} disabled={isLoading}>
            {isLoading ? "Switching..." : `Switch to ${targetRole}`}
          </Button>
        </div>

        {error && (
          <p className="auth-error">
            {error.message}
          </p>
        )}

        <div className="account-row account-row-last">
          <div>
            <h2>Private session</h2>
            <p>
              Signed in as {session.profile.email}. This screen should never expose verification documents, exact route
              details, or off-platform payment prompts.
            </p>
          </div>
          <Button variant="danger" onClick={handleLogout} disabled={isLoading}>
            {isLoading ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </div>
    </section>
  );
}
