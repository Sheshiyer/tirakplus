import { Link, type To, useLocation } from "react-router-dom";
import { AssetRegistry } from "../../registry/assets";
import type { MuseRouteKind, MuseRoleIntent } from "../../../shared/contracts";

type FloatingMuseTriggerProps = {
  to?: To;
};

type RouteMeta = {
  kind: MuseRouteKind;
  label: string;
  roleIntent: MuseRoleIntent;
};

function routeMetaForPath(pathname: string): RouteMeta {
  if (pathname.startsWith("/traveller/discovery")) {
    return { kind: "traveller-discovery", label: "Discovery", roleIntent: "traveller" };
  }
  if (pathname.startsWith("/traveller/companions")) {
    return { kind: "traveller-profile", label: "Profile", roleIntent: "traveller" };
  }
  if (pathname.startsWith("/traveller/inbox") || pathname.startsWith("/traveller/inquiries")) {
    return { kind: "traveller-inquiry", label: "Inbox", roleIntent: "traveller" };
  }
  if (pathname.startsWith("/traveller/plans")) {
    return { kind: "traveller-plan", label: "Plans", roleIntent: "traveller" };
  }
  if (pathname.startsWith("/traveller/safety")) {
    return { kind: "traveller-safety", label: "Safety", roleIntent: "traveller" };
  }
  if (pathname.startsWith("/traveller/account")) {
    return { kind: "account", label: "Account", roleIntent: "traveller" };
  }
  if (pathname.startsWith("/traveller")) {
    return { kind: "traveller-dashboard", label: "Board", roleIntent: "traveller" };
  }
  if (pathname.startsWith("/companion/onboarding")) {
    return { kind: "companion-onboarding", label: "Onboarding", roleIntent: "companion" };
  }
  if (pathname.startsWith("/companion/profile")) {
    return { kind: "companion-profile", label: "Profile", roleIntent: "companion" };
  }
  if (pathname.startsWith("/companion/inbox")) {
    return { kind: "companion-inbox", label: "Inbox", roleIntent: "companion" };
  }
  if (pathname.startsWith("/companion/plans")) {
    return { kind: "companion-plan", label: "Availability", roleIntent: "companion" };
  }
  if (pathname.startsWith("/companion/safety")) {
    return { kind: "companion-safety", label: "Safety", roleIntent: "companion" };
  }
  if (pathname.startsWith("/companion/account")) {
    return { kind: "account", label: "Account", roleIntent: "companion" };
  }
  if (pathname.startsWith("/companion")) {
    return { kind: "companion-dashboard", label: "Board", roleIntent: "companion" };
  }
  return { kind: "public", label: "Tirak Plus", roleIntent: "unknown" };
}

export function FloatingMuseTrigger({ to }: FloatingMuseTriggerProps) {
  const location = useLocation();
  const isMuseEntry = location.pathname === "/";

  if (isMuseEntry) return null;

  const routeMeta = routeMetaForPath(location.pathname);
  const params = new URLSearchParams({
    source: "floating",
    from: `${location.pathname}${location.search}`,
    kind: routeMeta.kind,
    label: routeMeta.label,
    role: routeMeta.roleIntent,
  });
  const destination = to ?? { pathname: "/", search: `?${params.toString()}` };

  return (
    <Link
      className="floating-muse-trigger"
      to={destination}
      aria-label={`Open Muse from ${routeMeta.label}`}
      data-muse-route-kind={routeMeta.kind}
    >
      <span className="floating-muse-trigger-stage" aria-hidden="true">
        <img className="floating-muse-trigger-idle-start" src={AssetRegistry.muse.floating.idleStart} alt="" />
        <img className="floating-muse-trigger-idle-end" src={AssetRegistry.muse.floating.idleEnd} alt="" />
        <img className="floating-muse-trigger-listen" src={AssetRegistry.muse.floating.listenStart} alt="" />
      </span>
      <span className="floating-muse-trigger-label">Muse</span>
    </Link>
  );
}
