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
        <h1>Account settings</h1>
        <p>Manage your profile, preferences, and roles.</p>
      </div>

      <div className="account-panel">
        <div className="account-row">
          <div>
            <h2>Profile context</h2>
            <p>
              You are currently viewing Tirak as a <strong>{currentRole}</strong>.
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
            <h2>Session</h2>
            <p>
              Signed in as {session.profile.email}
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
