import { Outlet, Link, useLocation } from "react-router-dom";
import { TopNav } from "../components/navigation/TopNav";
import { BottomNav } from "../components/navigation/BottomNav";
import { Button } from "../components/ui/Button";
import { CompassIcon, ShieldIcon, CreditCardIcon, UserIcon } from "../components/navigation/Icons";
import { AssetRegistry } from "../registry/assets";

export function PublicShell() {
  const location = useLocation();
  const isMuseEntry = location.pathname === "/";
  const navLinks = [
    { href: "/", label: "Muse" },
    { href: "/overview", label: "Overview" },
    { href: "/cities/phuket", label: "Cities" },
    { href: "/experiences/nightlife", label: "Experiences" },
    { href: "/safety", label: "Safety" },
    { href: "/payments", label: "Payments" },
  ];

  const mobileNavItems = [
    { id: "discovery", label: "Discovery", href: "/discovery", icon: <CompassIcon /> },
    { id: "safety", label: "Safety", href: "/safety", icon: <ShieldIcon /> },
    { id: "payments", label: "Payments", href: "/payments", icon: <CreditCardIcon /> },
    { id: "login", label: "Log In", href: "/auth/login", icon: <UserIcon /> },
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
    </div>
  );
}
