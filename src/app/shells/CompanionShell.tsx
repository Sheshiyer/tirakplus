import { Outlet, Link } from "react-router-dom";
import { TopNav } from "../components/navigation/TopNav";
import { BottomNav } from "../components/navigation/BottomNav";
import { LayoutDashboardIcon, CalendarIcon, MailIcon, UserIcon, ShieldIcon } from "../components/navigation/Icons";

export function CompanionShell() {
  // Navigation for a logged-in companion
  const navLinks = [
    { href: "/companion/dashboard", label: "Dashboard" },
    { href: "/companion/inbox", label: "Inbox" },
    { href: "/companion/plans", label: "Availability" },
    { href: "/companion/profile", label: "Profile" },
    { href: "/companion/safety", label: "Safety" },
  ];

  const mobileNavItems = [
    { id: "dashboard", label: "Dashboard", href: "/companion/dashboard", icon: <LayoutDashboardIcon /> },
    { id: "plans", label: "Avail.", href: "/companion/plans", icon: <CalendarIcon /> },
    { id: "inbox", label: "Inbox", href: "/companion/inbox", icon: <MailIcon /> },
    { id: "profile", label: "Profile", href: "/companion/profile", icon: <UserIcon /> },
    { id: "safety", label: "Safety", href: "/companion/safety", icon: <ShieldIcon /> },
  ];

  return (
    <div className="app-shell member-shell">
      <TopNav
        logo={<Link to="/companion/dashboard" className="brand-link">TP Companion</Link>}
        links={navLinks}
        theme="porcelain"
      />
      <BottomNav items={mobileNavItems} />
      
      <main className="member-main">
        <Outlet />
      </main>
    </div>
  );
}
