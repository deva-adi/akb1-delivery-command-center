# Frontend

Next.js 14 application with App Router. Populated at Milestone M7.

## Planned structure

```
frontend/
|-- app/                           Next.js App Router
|   |-- layout.tsx
|   |-- page.tsx                   Landing
|   |-- (auth)/                    Login, role selector
|   +-- (tabs)/
|       |-- executive/page.tsx
|       |-- delivery-health/page.tsx
|       |-- ...                    One folder per tab (14 total)
|-- components/                    Reusable UI: Card, FilterBar, IntelligenceLayer, DrillHandle
|-- lib/                           API client, hooks, types
|-- public/                        Static assets
|-- tests/
|   |-- unit/                      Vitest
|   +-- e2e/                       Playwright
|-- package.json
+-- Dockerfile
```

## Status at 2026-04-24

Empty scaffold. Folder structure in place with .gitkeep markers. Real code lands at M7.

## Dependencies planned

Next.js 14, React 18, Tailwind CSS, Shadcn UI components, Recharts, NextAuth, SWR or TanStack Query, Vitest, Playwright, axe-core, Lucide icons.

---

*Folder owner: frontend-dev subagent (M7 onward).*
