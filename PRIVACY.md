# PRIVACY.md
### AKB1 Delivery Command Center v1 | Privacy Policy | Placeholder authored 2026-04-24

> Full privacy policy authored at M3. This file exists to establish the zero-telemetry principle at repo creation time.

---

## Core principle

**Zero telemetry by default.**

AKB1 Delivery Command Center does not send usage data, analytics, or telemetry to any external service. All data stays on the host running the application.

## What this means in practice

No analytics SDKs. No usage tracking. No crash reporting to third-party services. No phone-home behaviour. No anonymous identifiers sent anywhere.

## Logs

Application logs are written to the local filesystem only. They contain operational information (requests, responses, errors) required for debugging and audit. Logs are never transmitted outside the host.

## External service calls

The application calls external services only when the operator explicitly configures them:

LiteLLM proxy at `localhost:4000` or a configured remote, for intelligence layer LLM calls. OpenAI-compatible API if the operator configures `OPENAI_API_KEY`. No other external calls are made by the application code.

## Phase 2 hosted deployment

If the operator deploys a public instance, the hosted instance may collect standard web server logs (IP addresses, request paths, timestamps). These are required for operation and security, not tracking. The operator is responsible for disclosing what their hosted instance collects.

## Data locality

All application data is stored in the Postgres instance the operator controls. No data leaves that instance unless the operator explicitly configures an external service.

---

*Full policy authored at M3. Last updated: 2026-04-24.*
