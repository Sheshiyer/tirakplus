import { NavLink } from "react-router-dom";

export interface BottomNavProps {
  /** The navigation items for the bottom tab bar. */
  items: {
    id: string;
    label: string;
    href: string;
    icon?: React.ReactNode; // Optional: In DESIGN.md, it says "no decorative icons" for admin, but app mobile nav might have simple ones. We will default to text if missing.
  }[];
}

export function BottomNav({ items }: BottomNavProps) {
  return (
    <nav
      className="bottom-nav"
      aria-label="Mobile app navigation"
    >
      <ul className="bottom-nav-list">
        {items.map((item) => (
          <li key={item.id} className="bottom-nav-item">
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                `bottom-nav-link${isActive ? " bottom-nav-link-active" : ""}`
              }
            >
              {item.icon && (
                <span className="bottom-nav-icon">
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
