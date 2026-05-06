# 03_Data_Flow_Diagrams.md
### AKB1 Delivery Command Center v1 | Data Flow Diagrams | Created: 2026-04-24

> Visualises ingest, transform, serve, cache invalidation, export, and snapshot flows. Revision 2 bakes in the cache epoch invalidation pattern from Intelligence Layer PRD section 8.

---

## 1. Scope

Five flow diagrams covering every path data takes through the system. Mermaid format so GitHub renders them natively when the repo flips public.

## 2. Ingest flow (seed generator)

Phase 1 is seed only. Real ingestion from Jira, Salesforce, Workday, ServiceNow is Phase 2 and out of v1.0.0 scope.

```mermaid
flowchart LR
  Dev[Developer] -->|make seed| Cmd[Python entry]
  Cmd --> RS[numpy.random.RandomState seed 20260424]
  RS --> Gen[Entity Generators]
  Gen --> P[programmes 10 rows]
  Gen --> Pe[people 300 rows]
  Gen --> Fm[financials_monthly 120 rows]
  Gen --> R[raid 150 rows]
  Gen --> A[actions ~40 rows]
  Gen --> D[decisions ~30 rows]
  Gen --> Sl[sla_metrics 60 rows]
  Gen --> V[vendors 25 plus engagements ~50]
  Gen --> C[change_requests 100 rows]
  Gen --> Cs[client_signals ~120 rows]
  Gen --> Ai[ai_tools 14 rows]
  Gen --> Op[opportunities ~70 rows]
  P --> DB[(Postgres)]
  Pe --> DB
  Fm --> DB
  R --> DB
  A --> DB
  D --> DB
  Sl --> DB
  V --> DB
  C --> DB
  Cs --> DB
  Ai --> DB
  Op --> DB
  DB --> Val[seed_validator.py]
  Val -->|pass| Out[Seed complete]
  Val -->|fail| Abort[Abort, log drift]
  DB -->|bump data_epoch| Cache[(Redis intelligence:data_epoch + 1)]
```

Seed determinism: byte-identical output across machines. Validator asserts row counts, state distribution, financial shape. Any drift fails CI.

## 3. Transform flow (API request lifecycle)

```mermaid
flowchart TB
  Req[Browser request GET /api/v1/executive/snapshot] --> MW1[Rate Limit middleware]
  MW1 -->|within budget| MW2[Auth middleware]
  MW2 -->|JWT valid| MW3[CSRF middleware state-changing only]
  MW3 --> MW4[RBAC dependency]
  MW4 -->|role allowed| Handler[Route Handler]
  Handler --> Cache{Cache hit?<br/>key: tab_id:filter_hash:role:epoch}
  Cache -->|yes under 15ms| Return1[Return cached]
  Cache -->|no| Service[Business Service]
  Service --> Q[Postgres Query]
  Q --> DB[(Tables)]
  DB --> Aggregate[Aggregation]
  Aggregate --> Intel[Intelligence Engine]
  Intel --> Rules[Rules-only computation]
  Rules -.->|FEATURE_LLM_POLISH=true| LLM[Sanitise plus LLM call]
  Rules --> IntelOut[IntelligenceResponse]
  IntelOut --> Store[Cache Store<br/>tab_id:filter_hash:role:epoch]
  Store --> Return2[Return fresh]
  MW1 -->|over budget| Reject429[429 Too Many Requests]
  MW2 -->|JWT invalid| Reject401[401 Unauthorized]
  MW3 -->|missing token| Reject403[403 CSRF Forbidden]
  MW4 -->|role insufficient| Reject403b[403 Role Forbidden]
```

## 4. Cache invalidation flow (D-017 severity-1 fix)

Cache key formula: `tab_id:filter_hash:role:data_epoch`. Epoch is monotonically increasing integer in Redis at key `intelligence:data_epoch`.

```mermaid
flowchart TB
  T1[Seed regeneration] -->|increment| Epoch
  T2[State-changing write<br/>scenario save, cr.reprice, etc.] -->|increment| Epoch
  T3[Midnight UTC tick] -->|increment daily| Epoch
  T4[POST /api/v1/intelligence/invalidate by admin] -->|increment| Epoch
  Epoch[Redis intelligence:data_epoch]
  Epoch --> CacheKey[All subsequent cache lookups use new epoch]
  CacheKey --> Miss[Old entries naturally miss]
  Miss --> Compute[Fresh computation]
  FilterChange[User changes filter on dashboard] -->|filter_hash changes| KeyChange[Different cache key]
  KeyChange --> Miss
```

Old cache entries remain in Redis until TTL expiry (60 min safety net) or LRU eviction. They never get served again because the epoch has moved on.

## 5. Serve flow (frontend to backend)

```mermaid
flowchart LR
  Browser[Browser Next.js client] -->|GET /executive| Edge[CDN Phase 2]
  Edge -->|cache miss| FE[Next.js server]
  FE -->|fetch /api/v1/executive/snapshot| API[FastAPI]
  API -->|JSON| FE
  FE -->|SSR html plus React island data| Edge
  Edge -->|cache html 60s Phase 2| Browser
  Browser -->|hydrate| React[React Interactive]
  React -->|subsequent filter change| FE
  FE -->|API call| API
```

Cache cascade: CDN for static and SSR HTML (Phase 2), Redis for API responses (Phase 1 and 2), browser for hydrated React state. Three layers of caching, each with explicit invalidation.

## 6. Export flow

```mermaid
flowchart TB
  UserClick[User clicks Export on chart] --> UI[Frontend collects current payload]
  UI -->|POST /api/v1/exports/xlsx| API
  API --> RBAC{Role allows export?}
  RBAC -->|no| Deny[403]
  RBAC -->|yes| Audit[audit_log.write export.generate]
  Audit --> Builder[openpyxl Excel builder]
  Builder --> File[xlsx byte stream]
  File -->|streaming response| UserDownload[Browser download]
  Audit -->|Steerco Pack path| PPT[python-pptx builder]
  PPT --> SlideTemplate[5-slide template]
  SlideTemplate --> FilterState[Inject filter state in footer]
  FilterState --> PPTFile[pptx byte stream]
  PPTFile --> UserDownload
```

Every export writes an audit_log row. No server-side persistence of the generated file. If operator needs retention, they re-export.

## 7. Snapshot flow (history PRD 21)

```mermaid
flowchart TB
  Cron[Sunday 23:59 UTC cron] --> Job[snapshot_job.py]
  Job --> Loop[For each tab_id in all 15 tabs]
  Loop --> Primary[For each primary filter slice]
  Primary --> Compute[Compute KPI payload plus intelligence drivers]
  Compute --> Serialise[jsonb serialise]
  Serialise --> Insert[INSERT kpi_snapshots tab_id, filter_hash, payload, captured_at]
  Insert --> Dedup[ON CONFLICT do nothing]
  Dedup --> Loop
  Loop -->|complete| Anomaly[Anomaly detection week over week]
  Anomaly -->|threshold breach| Notify[notifications.insert anomaly_*]
  Anomaly --> Done[Snapshot run complete]
  UserSelect[User picks past date in UI] --> Query[GET /api/v1/history/{tab_id}/as-of/{date}]
  Query --> Lookup[SELECT from kpi_snapshots]
  Lookup -->|found| Render[Render historical view with banner]
  Lookup -->|not found| Fallback[Nearest prior snapshot with note]
```

Snapshot job is idempotent via `(tab_id, filter_hash, captured_at)` unique constraint. Retention 52 weeks minimum per Security PRD data retention policy.

## 8. Error propagation

```mermaid
flowchart TB
  Req[Any incoming request]
  Req --> Try[Handler tries]
  Try -->|success| Success[200 OK]
  Try -->|validation error| E400[400 with Pydantic error detail]
  Try -->|auth failure| E401[401 Unauthorized]
  Try -->|role failure| E403[403 Forbidden]
  Try -->|not found| E404[404 Not Found]
  Try -->|rate limit| E429[429 with Retry-After header]
  Try -->|DB error| E500a[500 Internal, log, notify system event]
  Try -->|LLM timeout| Fallback[rules-only response, mark stale]
  Try -->|cache miss plus DB error| E503[503 Service Unavailable retry in N]
  E400 & E401 & E403 & E404 & E429 & E500a & E503 --> Log[Structured JSON log]
  Log --> Prom[Prometheus error counter increment]
  Log --> Trace[OpenTelemetry span marks error]
  E500a --> Audit[audit_log.system_error optional]
```

## 9. Non-functional envelope

Every flow in this document is bounded by the performance targets in Master PRD section 4. If a flow does not fit the envelope, the flow is redesigned, not the envelope relaxed.

---

*Owner: Claude. Signoff: Adi. Diagrams render natively on GitHub when repo flips public.*
