# 05_Deployment_Architecture.md
### AKB1 Delivery Command Center v1 | Deployment Architecture | Created: 2026-04-24

> Three deployment modes: local self-host via `docker compose up`, small hosted via Fly.io or Render, enterprise via Kubernetes. CDN and HTTP/2 enablers documented. Backup and disaster recovery policy.

---

## 1. Scope

Three shipping deployment modes plus ops playbooks. Mode choice depends on operator scale and comfort level. All three run the same Docker images produced by the CI build.

## 2. Mode 1: Local self-host (Phase 1 default)

### 2.1 Topology

```mermaid
flowchart TB
  Host[Host Machine<br/>macOS, Linux, Windows WSL2]
  subgraph Docker Compose Stack
    FE[frontend :3000]
    BE[backend :8000]
    PG[(postgres :5432)]
    RD[(redis :6379)]
  end
  Browser[http://localhost:3000]
  Browser --> FE
  FE -->|internal docker network| BE
  BE --> PG
  BE --> RD
```

### 2.2 Bring-up

```bash
git clone <private-url-until-v1> akb1-dcc
cd akb1-dcc
cp .env.example .env
docker compose up -d
make seed
open http://localhost:3000
```

End-to-end in under 10 minutes on a fresh host with Docker pre-installed.

### 2.3 Resource envelope

| Component | RAM | CPU | Disk |
|-----------|-----|-----|------|
| frontend | 256 MB | 0.25 | 300 MB image |
| backend | 512 MB | 0.5 | 450 MB image |
| postgres | 1 GB | 0.5 | 150 MB data at v1.0.0 |
| redis | 128 MB | 0.1 | ephemeral |
| **Total** | **~2 GB** | **~1.4 cores** | **~1 GB** |

Acceptable on any 8 GB laptop.

### 2.4 Local operations

| Task | Command |
|------|---------|
| Start | `docker compose up -d` |
| Stop | `docker compose down` |
| Reset data | `docker compose down -v && make seed` |
| View logs | `docker compose logs -f` |
| Exec psql | `docker compose exec postgres psql -U akb1 akb1_dcc` |
| Backup | `docker compose exec postgres pg_dump -U akb1 akb1_dcc > backup.sql` |

## 3. Mode 2: Small hosted (Fly.io or Render)

### 3.1 Topology

```mermaid
flowchart TB
  User --> CDN[Cloudflare CDN<br/>static assets]
  User --> Caddy[Caddy Phase 2<br/>TLS 1.3 HSTS CSP]
  Caddy -->|HTTP/2| FE2[frontend 2 replicas]
  FE2 --> BE2[backend 2 replicas]
  BE2 --> PG2[(Managed Postgres<br/>Fly Postgres or Render)]
  BE2 --> RD2[(Managed Redis<br/>Fly Redis or Upstash)]
  PG2 --> Backup[Daily automated backup]
```

### 3.2 Fly.io deployment

One-command deploy from the repo:

```bash
fly launch --name akb1-dcc-yourorg --region sin --vm-size shared-cpu-2x
fly postgres create --name akb1-dcc-db
fly redis create --name akb1-dcc-cache
fly secrets set JWT_SECRET=... NEXTAUTH_SECRET=... CSRF_SECRET=...
fly deploy
```

Estimated cost at 100 concurrent users: 10 to 20 USD per month.

### 3.3 Render deployment

`render.yaml` blueprint in repo (authored at M8). One click from Render dashboard. Managed Postgres and Redis included.

Estimated cost: 12 to 25 USD per month.

### 3.4 CDN enabler (D-015 severity-1 fix)

Cloudflare free tier in front of Next.js static assets (`/_next/static/*`, `/fonts/*`, `/public/*`). Configured via Cloudflare Page Rules:
- Edge cache TTL 1 year for immutable hashed assets
- Edge cache TTL 4 hours for HTML (bypass for authenticated routes)
- Brotli compression
- HTTP/2 enabled by default on Cloudflare

### 3.5 HTTP/2 via Caddy

Caddy sidecar container terminates TLS and serves HTTP/2 upstream to frontend and backend. HTTP/2 server push disabled (deprecated). Keepalive reduces connection overhead.

## 4. Mode 3: Enterprise Kubernetes (Phase 2)

### 4.1 Topology

```mermaid
flowchart TB
  Ingress[Ingress nginx or Traefik<br/>TLS HTTP/2]
  Ingress --> FE_K[frontend Deployment<br/>N replicas, HPA]
  Ingress --> BE_K[backend Deployment<br/>N replicas, HPA]
  BE_K --> PG_K[(Postgres<br/>CloudNativePG operator<br/>primary plus read replica)]
  BE_K --> RD_K[(Redis<br/>Bitnami chart)]
  PG_K --> Backup[Velero backup<br/>daily snapshot to S3]
```

### 4.2 Manifests

`infra/k8s/*.yaml` provides Deployment, Service, Ingress, PersistentVolumeClaim, ConfigMap, Secret templates. Helm chart or Kustomize overlay as operator preference. Authored at M8 Phase 2 hardening.

### 4.3 Scaling strategy

Horizontal Pod Autoscaler (HPA) on frontend and backend, target CPU 70 percent, min 2 replicas, max 10. Postgres scales via read replica for GET-heavy workloads. Redis single node until 10K concurrent users, then clustered.

## 5. Configuration matrix

| Env var | Local | Hosted small | Hosted enterprise |
|---------|-------|--------------|-------------------|
| `DATABASE_URL` | `postgresql://akb1:...@postgres:5432/akb1_dcc` | Managed URL from platform | Kubernetes Secret |
| `REDIS_URL` | `redis://redis:6379/0` | Managed URL | K8s Secret |
| `JWT_SECRET` | `.env` file | Platform secret store | Vault |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://yourdomain.com` | `https://akb1.internal` |
| `FEATURE_LLM_POLISH` | `false` default | operator choice | operator choice |
| `FEATURE_AUDIT_LOG` | `true` always | `true` always | `true` always |

## 6. Backup and disaster recovery

| Mode | Backup strategy | RTO | RPO |
|------|----------------|-----|-----|
| Local | `pg_dump` to operator-chosen location, no automation | Hours | Days |
| Fly.io / Render | Platform automated daily snapshot, retained 7 days | Under 1 hour | 24 hours |
| Kubernetes | Velero daily to S3, retained 30 days | Under 4 hours | 24 hours |

Restore procedure documented in `docs/runbooks/restore.md` (authored at M8).

## 7. Observability (D-015 severity-1 fix)

Three pillars integrated from M6:

| Pillar | Tool | Where |
|--------|------|-------|
| Logs | Structured JSON to stdout | Captured by platform log collector (Fly logs, Render logs, K8s logging) |
| Metrics | Prometheus endpoint `/metrics` on backend | Scraped by Prometheus or platform equivalent |
| Tracing | OpenTelemetry hooks at API and DB boundaries | Sent to Honeycomb, Grafana Tempo, or self-hosted Jaeger |

Dashboards shipped as Grafana JSON in `infra/grafana/`. Authored at M8.

## 8. Zero-downtime deploy

| Mode | Strategy |
|------|----------|
| Local | Not applicable (dev workflow) |
| Fly.io / Render | Blue-green by default on both platforms. Configure `release_command` for migrations |
| Kubernetes | RollingUpdate strategy with `maxUnavailable: 0`, `maxSurge: 1`. Run migrations via Job before new pods come up |

Migration strategy: forward-only. Breaking schema changes deploy across two releases (add new column, deploy, backfill, deploy, drop old). Alembic tracks migration version.

## 9. Environments

| Environment | Purpose | Data |
|-------------|---------|------|
| Development | Developer laptop | Seed only |
| Preview (per PR) | PR review in Fly.io | Seed fresh per preview |
| Staging (Phase 2) | Pre-production on hosted infra | Seed plus volunteer fixtures |
| Production | Public hosted demo | Seed; real adopter data in adopter-owned deployments |

## 10. Cost model

| Deploy mode | Monthly cost (10 users) | At 100 concurrent | At 1000 concurrent |
|-------------|--------------------------|----------------------|---------------------|
| Local self-host | 0 | 0 | Not fit |
| Fly.io small | 12 USD | 20 USD | 80 USD |
| Render small | 15 USD | 25 USD | 100 USD |
| Kubernetes managed | 100 USD min | 250 USD | 800 USD |

Costs increase with data retention, backup, and observability tooling.

## 11. Release cadence

| Track | Cadence | Audience |
|-------|---------|----------|
| Main | On every merge to `main` (CI green) | Developers plus preview environments |
| Stable | Tagged releases weekly on green main | Adopters |
| Long-term-support | Yearly (v1.x.LTS) | Enterprises |

## 12. Acceptance criteria

Deployment architecture signed off when Adi approves the three modes, the CDN plus HTTP/2 enablers, and the backup plus DR policy. Reference `docker-compose.yml` and `fly.toml` delivered at M8.

---

*Owner: Claude. Signoff: Adi. Reviewed by devops subagent M5 onward.*
