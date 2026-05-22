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
    <section className="account-page account-page-light">
      <div className="account-heading">
        <p className="eyebrow">Account and privacy</p>
        <h1>Account and privacy</h1>
        <p>Manage access, visibility, notifications, and safety controls.</p>
      </div>

      <div className="account-panel">
        <div className="account-row">
          <div>
            <h2>Access mode</h2>
            <p>
              You are signed in as a <strong>{currentRole}</strong>. This account can open traveller and companion tools
              without another login.
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
              Signed in as {session.profile.email}. Verification documents, exact route details, and payment prompts
              stay out of this account view.
            </p>
          </div>
          <Button variant="danger" onClick={handleLogout} disabled={isLoading}>
            {isLoading ? "Signing out..." : "Sign out"}
          </Button>
        </div>

        <div className="account-controls-grid" aria-label="Privacy and notification settings">
          {[
            ["Visibility", "Reviewed profile and inquiry details stay under your visibility controls."],
            ["Notifications", "Inquiry and review updates use approved contact channels."],
            ["Data requests", "Export, correction, and deletion requests are handled by the Tirak support team."],
            ["Safety reports", "Reports stay attached to review records and away from public pages."],
          ].map(([title, body]) => (
            <article className="account-control-card" key={title}>
              <span aria-hidden="true" />
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
