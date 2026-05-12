"use client";

import { useRouter } from "next/navigation";

interface DrillDetailLayoutProps {
  title: string;
  backHref: string;
  backLabel?: string;
  children: React.ReactNode;
}

/**
 * Shell layout for Level 2 entity detail pages.
 * Provides: back button, entity title, two-column detail grid slot.
 */
export function DrillDetailLayout({
  title,
  backHref,
  backLabel = "Back",
  children,
}: DrillDetailLayoutProps): JSX.Element {
  const router = useRouter();

  function handleBack() {
    router.push(backHref, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm transition-colors"
          aria-label={backLabel}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25H13.25A.75.75 0 0 1 14 8Z"
              clipRule="evenodd"
            />
          </svg>
          {backLabel}
        </button>
      </div>

      <h1 className="text-text-primary text-xl font-semibold tracking-tight">{title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}
