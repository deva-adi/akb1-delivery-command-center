import Link from "next/link";
import type { PersonItem } from "@/lib/capability";
import { BAND_LABELS } from "@/lib/workforce";

interface Props {
  people: PersonItem[];
  activeBand: string;
  clearBandHref: string;
}

export function PeopleListPanel({ people, activeBand, clearBandHref }: Props): JSX.Element {
  const bandLabel = BAND_LABELS[activeBand] ?? activeBand;

  return (
    <div data-testid="people-list-panel">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-text-primary text-sm font-semibold">
            {activeBand}: {bandLabel}
          </h3>
          <span className="text-text-muted text-xs font-mono" data-testid="people-list-count">
            {people.length} {people.length === 1 ? "person" : "people"}
          </span>
        </div>
        <Link
          href={clearBandHref}
          className="text-text-muted text-xs hover:text-text-primary transition-colors underline underline-offset-2"
          data-testid="clear-band-link"
        >
          Clear band filter
        </Link>
      </div>

      {people.length === 0 ? (
        <div
          className="py-8 text-center text-text-subtle text-sm"
          data-testid="people-list-empty"
        >
          No people found for this filter combination.
        </div>
      ) : (
        <table className="w-full text-sm" data-testid="people-list-table">
          <thead>
            <tr className="text-text-muted text-[10px] uppercase tracking-wider border-b border-border-subtle">
              <th className="text-left pb-2 font-medium">Full name</th>
              <th className="text-left pb-2 font-medium">Role</th>
              <th className="text-left pb-2 font-medium">Band</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {people.map((p) => (
              <tr
                key={p.person_id}
                className="hover:bg-border-subtle/20 transition"
                data-testid={`person-row-${p.person_id}`}
              >
                <td className="py-2 text-text-primary">{p.full_name}</td>
                <td className="py-2 text-text-secondary text-xs">{p.role}</td>
                <td className="py-2 text-text-muted font-mono text-xs">
                  {p.band ?? "n/a"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
