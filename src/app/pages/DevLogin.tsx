/**
 * DevLogin — QA-only direct-session entry page.
 *
 * Renders two big buttons that hit GET /api/dev/login?role=… which
 * creates a session cookie and 302-redirects to the role's dashboard.
 * The worker endpoint refuses to fire when ENVIRONMENT==="production",
 * so this page becomes a no-op (404) the moment we promote to prod.
 *
 * Use this for QA walkthroughs of the logged-in screens without
 * sitting through the OTP loop. Fixed dev accounts:
 *   dev.traveller@tirak.app  → /traveller
 *   dev.companion@tirak.app  → /companion
 */
export function DevLogin() {
  return (
    <section className="auth-page public-business-page-immersive">
      <div className="auth-panel">
        <div className="auth-heading">
          <p className="eyebrow">QA shortcut</p>
          <h1>Pick a test role</h1>
          <p>
            Direct session for QA — skips email and OTP. Both accounts are wired
            to the same cookie + CSRF flow as a real verified user, so every
            downstream guard, mutation, and role check behaves exactly like
            production. Disabled the moment <code>ENVIRONMENT</code> flips to
            production.
          </p>
        </div>

        <div className="auth-role-grid">
          <a className="auth-role-card" href="/api/dev/login?role=traveller">
            <p className="eyebrow">Traveller</p>
            <h2>Open as dev.traveller@tirak.app</h2>
            <p>
              Lands on <code>/traveller</code> dashboard. Saved profiles,
              inbox, plans, safety, account — all walkable.
            </p>
            <span className="auth-role-card-cta">Sign in as traveller →</span>
          </a>

          <a className="auth-role-card" href="/api/dev/login?role=companion">
            <p className="eyebrow">Companion</p>
            <h2>Open as dev.companion@tirak.app</h2>
            <p>
              Lands on <code>/companion</code> dashboard. Onboarding, profile
              manager, inbox, availability, safety, account.
            </p>
            <span className="auth-role-card-cta">Sign in as companion →</span>
          </a>
        </div>

        <p className="auth-terms">
          <strong>Not for production.</strong> This route is for QA + dev
          walkthroughs only and refuses to fire when{" "}
          <code>env.ENVIRONMENT === "production"</code>.
        </p>
      </div>
    </section>
  );
}
