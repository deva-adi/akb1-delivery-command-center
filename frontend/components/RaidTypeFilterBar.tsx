"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const TYPES = ["Risk", "Assumption", "Issue", "Dependency"] as const;

interface Props {
  activeType: string | null;
}

export function RaidTypeFilterBar({ activeType }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(type: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (next.get("type") === type) {
      next.delete("type");
    } else {
      next.set("type", type);
    }
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="flex items-center gap-2 mb-4" data-testid="raid-type-filter">
      <span className="text-text-muted text-xs font-medium whitespace-nowrap">Type</span>
      {TYPES.map((t) => (
        <button
          key={t}
          type="button"
          aria-pressed={activeType === t}
          onClick={() => handleSelect(t)}
          className={`px-3 py-1 text-xs rounded-md border transition-colors ${
            activeType === t
              ? "bg-accent-gold text-bg-base border-accent-gold font-semibold"
              : "bg-bg-surface text-text-muted border-border-subtle hover:border-border-strong hover:text-text-secondary"
          }`}
          data-testid={`type-tab-${t}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
