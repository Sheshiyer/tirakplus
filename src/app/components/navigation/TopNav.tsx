import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

export interface TopNavProps {
  /** The text or image element for the logo mark. */
  logo: ReactNode;
  /** Links to display in the center of the navigation rail. */
  links: { href: string; label: string }[];
  /** The primary action button to display on the right. */
  action?: ReactNode;
  /** Background theme: 'porcelain' (light) or 'night' (dark). Defaults to 'porcelain'. */
  theme?: "porcelain" | "night";
}

export function TopNav({ logo, links, action, theme = "porcelain" }: TopNavProps) {
  return (
    <nav
      className={`top-nav top-nav-${theme}`}
      aria-label="Primary"
    >
      <div className="top-nav-logo">
        {logo}
      </div>

      <div className="top-nav-links">
        {links.map((link) => (
          <NavLink
            key={link.href}
            to={link.href}
            className={({ isActive }) =>
              `top-nav-link${isActive ? " top-nav-link-active" : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="top-nav-action">{action}</div>
    </nav>
  );
}
