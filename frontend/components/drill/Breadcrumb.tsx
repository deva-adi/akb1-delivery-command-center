"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { buildPortfolioUrl } from "@/lib/drill";

/**
 * Renders Portfolio > {Programme} > {Entity} from the current URL.
 * Each segment is a navigable link. Levels:
 *   Level 0: just "Portfolio" (no params)
 *   Level 1: "Portfolio > PEGASUS" (?p=PEGASUS)
 *   Level 2: "Portfolio > PEGASUS > {entity}" (route segment)
 *
 * Always shown; renders nothing (empty) when at Level 0 with no programme.
 */
export function Breadcrumb(): JSX.Element | null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const programme = searchParams.get("p");

  const portfolioHref = buildPortfolioUrl(pathname);

  const segments: { label: string; href: string }[] = [
    { label: "Portfolio", href: portfolioHref },
  ];

  if (programme) {
    const sp = new URLSearchParams({ p: programme });
    segments.push({ label: programme, href: `${portfolioHref}?${sp.toString()}` });
  }

  if (segments.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Drill breadcrumb" className="flex items-center gap-1.5 text-xs text-text-muted">
      {segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1;
        return (
          <span key={seg.href} className="flex items-center gap-1.5">
            {idx > 0 && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 12 12"
                fill="currentColor"
                className="w-3 h-3 text-text-subtle"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.97 2.47a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 0 1-1.06-1.06L8.44 7 4.97 3.53a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {isLast ? (
              <span className="text-text-primary font-medium">{seg.label}</span>
            ) : (
              <Link
                href={seg.href}
                className="hover:text-text-primary transition-colors"
              >
                {seg.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
