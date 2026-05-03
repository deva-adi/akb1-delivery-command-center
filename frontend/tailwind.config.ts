import type { Config } from "tailwindcss";

/**
 * Option D Executive Mid palette, locked per D-018 and reproduced from
 * Design Foundations rev 4 section 1. Semantic tokens land here as
 * tailwind utility classes (bg-surface, text-primary, etc.) so component
 * files never carry inline hex values per the M7 scaffold Q4 ruling.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-base": "#242D3D",
        "bg-surface": "#2E3849",
        "bg-surface-elevated": "#3A4454",
        "bg-surface-subtle": "#2A3446",
        "border-subtle": "#3A4454",
        "border-strong": "#4A5568",
        "text-primary": "#F1F5F9",
        "text-secondary": "#CBD5E1",
        "text-muted": "#A0AEC0",
        "text-subtle": "#718096",
        "accent-gold": "#F5B800",
        "status-red": "#EF4444",
        "status-amber": "#F59E0B",
        "status-green": "#10B981",
        "role-pm": "#3B82F6",
        "role-pm-soft": "#60A5FA",
        "role-fl": "#8B5CF6",
        "role-fl-soft": "#A78BFA",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontVariantNumeric: {
        tabular: "tabular-nums",
      },
    },
  },
  plugins: [],
};

export default config;
