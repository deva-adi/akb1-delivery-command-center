"use client";

import { useRouter } from "next/navigation";

interface DrillRowProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component: renders children in a clickable, keyboard-accessible row.
 * Navigates to href on click or Enter/Space key press.
 * Uses aria-role="button" per D-065 decision (drill targets are not anchor links).
 */
export function DrillRow({ href, children, className = "" }: DrillRowProps): JSX.Element {
  const router = useRouter();

  function handleClick() {
    router.push(href, { scroll: false });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(href, { scroll: false });
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`cursor-pointer transition-colors hover:bg-bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-inset ${className}`}
    >
      {children}
    </div>
  );
}
