"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FilterChip } from "./FilterChip";

export interface ProgrammeListItem {
  programme_code: string;
  programme_name: string;
  health_state: string | null;
}

interface ProgrammeFilterBarProps {
  initialProgrammes: ProgrammeListItem[];
}

const FALLBACK_CODES = [
  "ANDROMEDA", "ATLAS", "DRACO", "HELIX", "LYRA",
  "ORION", "PEGASUS", "PHOENIX", "STELLAR", "VEGA",
];

/**
 * Programme filter dropdown rendered on all home/* tabs.
 * Selecting a programme sets ?p=CODE. Clearing removes the param.
 * Shows a gold chip when a programme is active.
 * Health-coloured dots from GET /api/v1/programmes via server-fetched prop.
 */
export function ProgrammeFilterBar({ initialProgrammes }: ProgrammeFilterBarProps): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("p");

  const options: ProgrammeListItem[] =
    initialProgrammes.length > 0
      ? [...initialProgrammes].sort((a, b) =>
          a.programme_code.localeCompare(b.programme_code),
        )
      : FALLBACK_CODES.map((code) => ({
          programme_code: code,
          programme_name: code,
          health_state: null,
        }));

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const next = new URLSearchParams(searchParams.toString());
    if (value === "") {
      next.delete("p");
    } else {
      next.set("p", value);
    }
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div
      data-testid="programme-filter-bar"
      className="flex items-center gap-3 mb-5"
    >
      <label htmlFor="programme-filter" className="text-text-muted text-xs font-medium whitespace-nowrap">
        Programme
      </label>
      <select
        id="programme-filter"
        value={active ?? ""}
        onChange={handleChange}
        className="bg-bg-surface border border-border-subtle rounded-md text-text-secondary text-xs px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent"
        aria-label="Select programme filter"
      >
        <option value="">All Programmes</option>
        {options.map((prog) => (
          <option key={prog.programme_code} value={prog.programme_code}>
            {prog.programme_code}
            {prog.health_state ? ` (${prog.health_state})` : ""}
          </option>
        ))}
      </select>

      {active && (
        <FilterChip label={active} paramKey="p" />
      )}
    </div>
  );
}
