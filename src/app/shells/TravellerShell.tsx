import { Outlet, Link } from "react-router-dom";
import { TopNav } from "../components/navigation/TopNav";
import { BottomNav } from "../components/navigation/BottomNav";
import { CompassIcon, CalendarIcon, MailIcon, UserIcon } from "../components/navigation/Icons";

export function TravellerShell() {
  // Navigation for a logged-in traveller
  const navLinks = [
    { href: "/traveller/discovery", label: "Discovery" },
    { href: "/traveller/inbox", label: "Inbox" },
    { href: "/traveller/plans", label: "Plans" },
    { href: "/traveller/account", label: "Account" },
  ];

  const mobileNavItems = [
    { id: "discovery", label: "Discovery", href: "/traveller/discovery", icon: <CompassIcon /> },
    { id: "plans", label: "Plans", href: "/traveller/plans", icon: <CalendarIcon /> },
    { id: "inbox", label: "Inbox", href: "/traveller/inbox", icon: <MailIcon /> },
    { id: "account", label: "Account", href: "/traveller/account", icon: <UserIcon /> },
  ];

  return (
    <div className="app-shell member-shell">
      <TopNav
        logo={<Link to="/traveller/discovery" className="brand-link">TP</Link>}
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
