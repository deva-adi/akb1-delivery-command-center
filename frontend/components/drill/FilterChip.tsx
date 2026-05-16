"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface FilterChipProps {
  label: string;
  paramKey: string;
}

export function FilterChip({ label, paramKey }: FilterChipProps): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleClear() {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(paramKey);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-gold text-bg-base text-xs font-semibold"
      data-testid={`filter-chip-${paramKey}`}
    >
      {label}
      <button
        type="button"
        aria-label={`Clear ${paramKey} filter`}
        onClick={handleClear}
        className="rounded-full hover:bg-bg-base/20 transition-colors p-0.5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 12 12"
          fill="currentColor"
          className="w-3 h-3"
          aria-hidden="true"
        >
          <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L6 4.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L7.06 6l2.72 2.72a.75.75 0 1 1-1.06 1.06L6 7.06 3.28 9.78a.75.75 0 0 1-1.06-1.06L4.94 6 2.22 3.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>
    </span>
  );
}
