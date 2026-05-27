import { Outlet, Link, useLocation } from "react-router-dom";
import { TopNav } from "../components/navigation/TopNav";
import { BottomNav } from "../components/navigation/BottomNav";
import { Button } from "../components/ui/Button";
import { CompassIcon, MuseIcon, ShieldIcon, UserIcon } from "../components/navigation/Icons";
import { AssetRegistry } from "../registry/assets";

export function PublicShell() {
  const location = useLocation();
  const isMuseEntry = location.pathname === "/";
  const navLinks = [
    { href: "/", label: "Muse" },
    { href: "/discovery", label: "Discovery" },
    { href: "/safety", label: "Safety" },
    { href: "/auth/login", label: "Login" },
  ];

  const mobileNavItems = [
    { id: "muse", label: "Muse", href: "/", icon: <MuseIcon /> },
    { id: "discovery", label: "Discovery", href: "/discovery", icon: <CompassIcon /> },
    { id: "safety", label: "Safety", href: "/safety", icon: <ShieldIcon /> },
    { id: "login", label: "Login", href: "/auth/login", icon: <UserIcon /> },
  ];

  return (
    <div className="app-shell public-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <TopNav
        logo={
          <Link to="/" className="brand-link brand-link-with-mark">
            <img src={AssetRegistry.brand.tirakPlusMuseIcon192} alt="" aria-hidden="true" />
            <span>Tirak Plus</span>
          </Link>
        }
        links={navLinks}
        action={
          <Button as={Link} to="/auth/login" variant="primary">
            Join / Log In
          </Button>
        }
        theme={isMuseEntry ? "night" : "porcelain"}
      />
      <BottomNav items={mobileNavItems} />
      
      <main id="main-content" className="main-surface" tabIndex={-1}>
        <Outlet />
      </main>
      {/* FloatingMuseTrigger intentionally NOT mounted on PublicShell.
          Public/auth/muse-entry surfaces already have prominent Muse
          entry points; a floating trigger here is redundant. The floater
          only renders inside logged-in shells (TravellerShell, CompanionShell). */}

      {!isMuseEntry && (
        <footer className="public-footer" aria-label="Public footer">
          <Link to="/" className="public-footer-brand">
            <img src={AssetRegistry.brand.tirakPlusMuseIcon192} alt="" aria-hidden="true" />
            <span>Tirak Plus</span>
          </Link>
          <nav aria-label="Legal and support links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/cookies">Cookies</Link>
            <Link to="/support">Support</Link>
            <Link to="/safety">Safety</Link>
          </nav>
        </footer>
      )}
    </div>
  );
}
