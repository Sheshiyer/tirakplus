import { Link } from "react-router-dom";
import { useAuth } from "../../api/AuthContext";

/**
 * RoleChip — small "you are here" pill in the top nav slot.
 *
 * Surfaces the active session role (Traveller / Companion) so the user
 * always knows which side of the product they're in. Tapping the chip
 * routes to /<role>/account where they can switch or sign out — the
 * existing AccountSettings page handles both flows already.
 *
 * Renders nothing if there's no active session (e.g. during the brief
 * loading window before AuthContext hydrates). The shells that mount
 * this are protected routes, so a session is always present once a
 * page actually renders.
 */
export function RoleChip() {
  const { session } = useAuth();
  if (!session) return null;

  const role = session.profile.role;
  const accountHref = role === "companion" ? "/companion/account" : "/traveller/account";
  const label = role === "companion" ? "Companion" : "Traveller";

  return (
    <Link
      to={accountHref}
      className="role-chip"
      data-role={role}
      aria-label={`Signed in as ${label}. Open account.`}
    >
      <span className="role-chip-dot" aria-hidden="true" />
      <span className="role-chip-label">{label}</span>
    </Link>
  );
}
