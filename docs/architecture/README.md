# Architecture
### AKB1 Delivery Command Center v1

Seven architecture documents. Created during Milestone M3.

## File list (planned)

| # | File | Scope | Status |
|---|------|-------|--------|
| 00 | 00_Enterprise_Architecture_Overview.md | System context, component diagram, deployment topology | Planned |
| 01 | 01_ADR_Tech_Stack.md | Architecture Decision Record for Next.js plus FastAPI plus Postgres plus Redis plus Docker | Planned |
| 02 | 02_Data_Flow_Diagrams.md | Ingest, transform, serve flows with seed generator included | Planned |
| 03 | 03_Security_Architecture.md | Phase 1 local auth, Phase 2 OAuth plus RLS plus audit log plus rate limit plus HTTPS | Planned |
| 04 | 04_Deployment_Architecture.md | Local docker compose, hosted Fly.io or Render, Phase 2 Kubernetes manifests | Planned |
| 05 | 05_Multi_Agent_Dev_Strategy.md | Nine subagent roster, delegation pattern, regression gates per agent | Planned |
| 06 | 06_Performance_Benchmark_Plan.md | Locust test plan at 100, 500, 1000 concurrent, target response times | Planned |

## Diagrams

Diagrams written in Mermaid inline in Markdown, rendered natively by GitHub when repo flips public. No external image files.

## Constraints

Every architecture decision that changes cost, stack, or deployment target must be recorded in DECISION_LOG.md. Architecture documents reference the decision log entry by ID.

---

*Folder owner: Claude. Populated during Milestone M3.*
