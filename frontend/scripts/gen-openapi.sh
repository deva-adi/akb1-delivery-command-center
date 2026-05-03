#!/usr/bin/env bash
# Regenerate frontend/openapi.json from the live FastAPI app, then run
# openapi-typescript to produce frontend/lib/api-client/schema.ts.
#
# CLAUDE.md hard rule: OpenAPI spec generated from FastAPI is diffed
# against PRD in CI. Pass --check to fail on diff (CI mode); omit to
# overwrite (developer mode).
#
# Usage:
#   bash scripts/gen-openapi.sh
#   bash scripts/gen-openapi.sh --check

set -euo pipefail

CHECK_MODE=0
if [[ "${1:-}" == "--check" ]]; then
  CHECK_MODE=1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="$(cd "${FRONTEND_DIR}/../backend" && pwd)"

OPENAPI_JSON="${FRONTEND_DIR}/openapi.json"
SCHEMA_TS="${FRONTEND_DIR}/lib/api-client/schema.ts"

VENV_ACTIVATE="${BACKEND_DIR}/.venv/bin/activate"
if [[ ! -f "${VENV_ACTIVATE}" ]]; then
  echo "backend venv missing at ${VENV_ACTIVATE}" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "${VENV_ACTIVATE}"

TMP_OPENAPI="$(mktemp)"
trap 'rm -f "${TMP_OPENAPI}"' EXIT

(
  cd "${BACKEND_DIR}"
  python -c "from app.main import app; import json,sys; json.dump(app.openapi(), sys.stdout, indent=2)"
) > "${TMP_OPENAPI}"

if [[ "${CHECK_MODE}" == "1" ]]; then
  if ! diff -q "${OPENAPI_JSON}" "${TMP_OPENAPI}" >/dev/null; then
    echo "OpenAPI drift: ${OPENAPI_JSON} is stale relative to backend." >&2
    echo "Run: bash scripts/gen-openapi.sh" >&2
    diff -u "${OPENAPI_JSON}" "${TMP_OPENAPI}" >&2 || true
    exit 1
  fi
  echo "OpenAPI snapshot matches backend"
else
  cp "${TMP_OPENAPI}" "${OPENAPI_JSON}"
  echo "Wrote ${OPENAPI_JSON}"
fi

(
  cd "${FRONTEND_DIR}"
  npx --no-install openapi-typescript "${OPENAPI_JSON}" -o "${SCHEMA_TS}"
)

if [[ "${CHECK_MODE}" == "1" ]]; then
  if ! git -C "${FRONTEND_DIR}" diff --quiet -- "${SCHEMA_TS}"; then
    echo "Generated schema.ts is stale; commit the regenerated file." >&2
    exit 1
  fi
fi

echo "Wrote ${SCHEMA_TS}"
