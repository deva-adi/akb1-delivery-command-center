import Link from "next/link";
import { navForRole, type Role } from "@/lib/auth/role-nav";

interface RoleAwareNavProps {
  role: Role;
}

export function RoleAwareNav({ role }: RoleAwareNavProps): JSX.Element {
  const items = navForRole(role);
  return (
    <nav
      aria-label="Primary navigation"
      data-testid="role-aware-nav"
      data-role={role}
      className="border-t border-border-subtle bg-bg-surface"
    >
      <ul className="max-w-[1440px] mx-auto px-8 flex items-center gap-1">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className="inline-block px-4 py-3 text-sm text-text-secondary hover:text-text-primary border-b-2 border-transparent hover:border-accent-gold transition"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
