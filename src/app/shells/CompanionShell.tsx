import { Outlet, Link } from "react-router-dom";
import { TopNav } from "../components/navigation/TopNav";
import { BottomNav } from "../components/navigation/BottomNav";
import { LayoutDashboardIcon, CalendarIcon, MailIcon, UserIcon, ShieldIcon } from "../components/navigation/Icons";
import { RoleChip } from "../components/navigation/RoleChip";
import { FloatingMuseTrigger } from "../components/muse/FloatingMuseTrigger";
import { InstallPrompt } from "../components/pwa/InstallPrompt";

export function CompanionShell() {
  // Navigation for a logged-in companion. "Board" matches the
  // traveller shell — same word for the same surface, so the product
  // doesn't feel like two different apps.
  const navLinks = [
    { href: "/companion/dashboard", label: "Board" },
    { href: "/companion/inbox", label: "Inbox" },
    { href: "/companion/plans", label: "Availability" },
    { href: "/companion/profile", label: "Profile" },
    { href: "/companion/safety", label: "Safety" },
  ];

  const mobileNavItems = [
    { id: "dashboard", label: "Board", href: "/companion/dashboard", icon: <LayoutDashboardIcon /> },
    { id: "plans", label: "Availability", href: "/companion/plans", icon: <CalendarIcon /> },
    { id: "inbox", label: "Inbox", href: "/companion/inbox", icon: <MailIcon /> },
    { id: "profile", label: "Profile", href: "/companion/profile", icon: <UserIcon /> },
    { id: "safety", label: "Safety", href: "/companion/safety", icon: <ShieldIcon /> },
  ];

  return (
    <div className="app-shell member-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <TopNav
        logo={<Link to="/companion/dashboard" className="brand-link">Tirak Plus</Link>}
        links={navLinks}
        action={<RoleChip />}
        theme="night"
      />
      <BottomNav items={mobileNavItems} />
      
      <main id="main-content" className="member-main" tabIndex={-1}>
        <Outlet />
      </main>
      <FloatingMuseTrigger />
      <InstallPrompt />
    </div>
  );
}
