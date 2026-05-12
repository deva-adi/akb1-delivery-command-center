/**
 * Drill interactivity utilities (M10-1).
 *
 * Pure functions are safe to import from any component.
 * useProgrammeFilter is a React hook: call it only from Client Components.
 */

import { useSearchParams } from "next/navigation";

/**
 * Pure helper: extract the programme filter from a URLSearchParams instance.
 * Used in tests and in Client Components that already hold a searchParams ref.
 */
export function getProgrammeParam(params: URLSearchParams): string | null {
  return params.get("p");
}

/**
 * React hook: returns the current ?p= value from the URL, or null.
 * Must be called from a Client Component.
 */
export function useProgrammeFilter(): string | null {
  const params = useSearchParams();
  return params.get("p");
}

/**
 * Build a URL from a base path and an explicit param map.
 * Keys with null values are omitted. Existing params are NOT carried over
 * from the current URL -- the caller must pass them explicitly if needed.
 *
 * buildDrillUrl('/home/executive', { p: 'PEGASUS' })
 *   => '/home/executive?p=PEGASUS'
 *
 * buildDrillUrl('/home/executive', { p: null })
 *   => '/home/executive'
 */
export function buildDrillUrl(
  base: string,
  params: Record<string, string | null>,
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null) {
      sp.set(key, value);
    }
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Return a drill-through URL: navigate to targetTab carrying only ?p= if set.
 * Other tab-specific params (type, severity, sla, etc.) are not carried across.
 *
 * buildDrillThroughUrl('delivery-health', new URLSearchParams('p=PEGASUS&type=Risk'))
 *   => '/home/delivery-health?p=PEGASUS'
 */
export function buildDrillThroughUrl(
  targetTab: string,
  currentParams: URLSearchParams,
): string {
  const programme = currentParams.get("p");
  const target = `/home/${targetTab}`;
  return programme ? `${target}?p=${encodeURIComponent(programme)}` : target;
}

/**
 * Strip all search params from the current path, returning the Level 0 URL.
 *
 * buildPortfolioUrl('/home/executive?p=PEGASUS&type=Risk')
 *   => '/home/executive'
 */
export function buildPortfolioUrl(currentPath: string): string {
  const idx = currentPath.indexOf("?");
  return idx >= 0 ? currentPath.slice(0, idx) : currentPath;
}
