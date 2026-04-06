#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SMOKE_SCRIPT="${ROOT_DIR}/infra/scripts/smoke.sh"
RUNTIME_RESET_SCRIPT="${ROOT_DIR}/infra/scripts/runtime-reset.sh"

USE_RUNTIME_RESET="${USE_RUNTIME_RESET:-1}"
RESET_NEXT="${RESET_NEXT:-0}"
RESET_START_SERVICES="${RESET_START_SERVICES:-1}"
RESET_WAIT_SECONDS="${RESET_WAIT_SECONDS:-2}"
WARMUP_SECONDS="${WARMUP_SECONDS:-2}"
RETRIES="${RETRIES:-3}"
RETRY_DELAY_SECONDS="${RETRY_DELAY_SECONDS:-1}"

run_step() {
  local label="$1"
  shift

  echo
  echo "[release-check] >>> ${label}"
  "$@"
  echo "[release-check] <<< ${label} (ok)"
}

require_cmd() {
  local cmd="$1"
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    echo "[release-check] comando ausente: ${cmd}" >&2
    exit 1
  fi
}

require_file() {
  local file="$1"
  if [[ ! -f "${file}" ]]; then
    echo "[release-check] arquivo ausente: ${file}" >&2
    exit 1
  fi
}

require_cmd pnpm
require_file "${SMOKE_SCRIPT}"
if [[ "${USE_RUNTIME_RESET}" == "1" ]]; then
  require_file "${RUNTIME_RESET_SCRIPT}"
fi

cd "${ROOT_DIR}"

echo "[release-check] raiz: ${ROOT_DIR}"
echo "[release-check] iniciando gate de pré-release..."

run_step "testes CI (pnpm test:ci)" pnpm test:ci
run_step "hardening integrado (pnpm verify:hardening)" pnpm verify:hardening

if [[ "${SKIP_SMOKE:-0}" == "1" ]]; then
  echo
  echo "[release-check] smoke pulado (SKIP_SMOKE=1)."
else
  if [[ "${USE_RUNTIME_RESET}" == "1" ]]; then
    run_step "saneamento operacional pre-smoke (runtime-reset)" env \
      START_SERVICES="${RESET_START_SERVICES}" \
      RESET_NEXT="${RESET_NEXT}" \
      WAIT_SECONDS="${RESET_WAIT_SECONDS}" \
      "${RUNTIME_RESET_SCRIPT}"
  fi

  run_step "smoke operacional (infra/scripts/smoke.sh)" env \
    WARMUP_SECONDS="${WARMUP_SECONDS}" \
    RETRIES="${RETRIES}" \
    RETRY_DELAY_SECONDS="${RETRY_DELAY_SECONDS}" \
    "${SMOKE_SCRIPT}"
fi

echo
echo "[release-check] PASS: gate de pré-release aprovado."
