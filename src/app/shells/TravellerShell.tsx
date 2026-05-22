import { Outlet, Link } from "react-router-dom";
import { TopNav } from "../components/navigation/TopNav";
import { BottomNav } from "../components/navigation/BottomNav";
import { LayoutDashboardIcon, CompassIcon, CalendarIcon, MailIcon, ShieldIcon } from "../components/navigation/Icons";
import { FloatingMuseTrigger } from "../components/muse/FloatingMuseTrigger";

export function TravellerShell() {
  // Navigation for a logged-in traveller
  const navLinks = [
    { href: "/traveller/dashboard", label: "Board" },
    { href: "/traveller/discovery", label: "Discovery" },
    { href: "/traveller/inbox", label: "Inbox" },
    { href: "/traveller/plans", label: "Plans" },
    { href: "/traveller/safety", label: "Safety" },
  ];

  const mobileNavItems = [
    { id: "dashboard", label: "Board", href: "/traveller/dashboard", icon: <LayoutDashboardIcon /> },
    { id: "discovery", label: "Discovery", href: "/traveller/discovery", icon: <CompassIcon /> },
    { id: "plans", label: "Plans", href: "/traveller/plans", icon: <CalendarIcon /> },
    { id: "inbox", label: "Inbox", href: "/traveller/inbox", icon: <MailIcon /> },
    { id: "safety", label: "Safety", href: "/traveller/safety", icon: <ShieldIcon /> },
  ];

  return (
    <div className="app-shell member-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <TopNav
        logo={<Link to="/traveller/dashboard" className="brand-link">Tirak Plus</Link>}
        links={navLinks}
        theme="night"
      />
      <BottomNav items={mobileNavItems} />
      
      <main id="main-content" className="member-main" tabIndex={-1}>
        <Outlet />
      </main>
      <FloatingMuseTrigger />
    </div>
  );
}
