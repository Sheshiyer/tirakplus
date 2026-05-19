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
        <p>Manage session access, private visibility expectations, notifications, and account safety controls.</p>
      </div>

      <div className="account-panel">
        <div className="account-row">
          <div>
            <h2>Profile access</h2>
            <p>
              You are currently signed in as a <strong>{currentRole}</strong>. The other access path is available in this
              build so reviewed traveller and companion surfaces can be checked without creating duplicate accounts.
            </p>
          </div>
          <Button variant="secondary" onClick={handleSwitchRole} disabled={isLoading}>
            {isLoading ? "Switching..." : `Preview ${targetRole} access`}
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

        <div className="account-controls-grid" aria-label="Privacy and notification settings">
          {[
            ["Visibility", "Only reviewed profile and inquiry fields should become visible outside this account."],
            ["Notifications", "Inquiry and review updates should be sent only through approved contact channels."],
            ["Data requests", "Export, correction, and deletion requests need an admin-reviewed workflow before launch."],
            ["Safety reports", "Reports stay attached to restricted review records and should never appear in public copy."],
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
