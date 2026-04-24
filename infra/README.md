# Infrastructure

Runtime and deployment configuration. Populated at Milestone M6 (core) and M8 (production hardening).

## Planned structure

```
infra/
|-- caddy/
|   +-- Caddyfile                  Reverse proxy, TLS (M8)
|-- postgres/
|   +-- init.sql                   Extensions, roles (M6)
|-- redis/
|   +-- redis.conf                 Optional tuning (M6)
|-- k8s/                           Kubernetes manifests (Phase 2)
|   |-- deployment.yaml
|   |-- service.yaml
|   +-- ingress.yaml
+-- scripts/
    |-- seed_data.sh               Wrapper around backend seed command (M6)
    |-- reset_db.sh                Drop and recreate local dev DB (M6)
    +-- benchmark.sh               Locust runner (M8)
```

## Status at 2026-04-24

Empty scaffold. Folder structure in place with .gitkeep markers.

## Deployment targets planned

Local: `docker compose up` (M6). Hosted: Fly.io or Render one-click (M8). Enterprise: Kubernetes manifests (Phase 2).

---

*Folder owner: devops subagent (M6 onward).*
