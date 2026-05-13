import { Outlet, Link } from "react-router-dom";
import { TopNav } from "../components/navigation/TopNav";
import { BottomNav } from "../components/navigation/BottomNav";
import { Button } from "../components/ui/Button";
import { CompassIcon, ShieldIcon, CreditCardIcon, UserIcon } from "../components/navigation/Icons";

export function PublicShell() {
  const navLinks = [
    { href: "/cities/phuket", label: "Cities" },
    { href: "/experiences/nightlife", label: "Experiences" },
    { href: "/discovery", label: "Discovery" },
    { href: "/safety", label: "Safety" },
  ];

  const mobileNavItems = [
    { id: "discovery", label: "Discovery", href: "/discovery", icon: <CompassIcon /> },
    { id: "safety", label: "Safety", href: "/safety", icon: <ShieldIcon /> },
    { id: "payments", label: "Payments", href: "/payments", icon: <CreditCardIcon /> },
    { id: "login", label: "Log In", href: "/auth/login", icon: <UserIcon /> },
  ];

  return (
    <div className="app-shell public-shell">
      <TopNav
        logo={<Link to="/" className="brand-link">Tirak Plus</Link>}
        links={navLinks}
        action={
          <Button as={Link} to="/auth/login" variant="primary">
            Join / Log In
          </Button>
        }
        theme="porcelain"
      />
      <BottomNav items={mobileNavItems} />
      
      <main className="main-surface">
        <Outlet />
      </main>
    </div>
  );
}
