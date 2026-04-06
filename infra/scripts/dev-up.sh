#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="${ROOT_DIR}/.tmp/dev-up"
RUNTIME_RESET_SCRIPT="${ROOT_DIR}/infra/scripts/runtime-reset.sh"

API_LOG="${LOG_DIR}/api.log"
WEB_LOG="${LOG_DIR}/web.log"
ADMIN_LOG="${LOG_DIR}/admin.log"

API_PORT="${API_PORT:-3002}"
WEB_PORT="${WEB_PORT:-3000}"
ADMIN_PORT="${ADMIN_PORT:-3001}"

AUTO_RESET="${AUTO_RESET:-1}"
RESET_NEXT="${RESET_NEXT:-0}"

API_PID=""
WEB_PID=""
ADMIN_PID=""

require_cmd() {
  local cmd="$1"
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    echo "[dev-up] comando ausente: ${cmd}" >&2
    exit 1
  fi
}

cleanup() {
  set +e
  echo
  echo "[dev-up] encerrando serviços..."

  if [[ -n "${ADMIN_PID}" ]] && kill -0 "${ADMIN_PID}" 2>/dev/null; then
    kill "${ADMIN_PID}" 2>/dev/null || true
  fi

  if [[ -n "${WEB_PID}" ]] && kill -0 "${WEB_PID}" 2>/dev/null; then
    kill "${WEB_PID}" 2>/dev/null || true
  fi

  if [[ -n "${API_PID}" ]] && kill -0 "${API_PID}" 2>/dev/null; then
    kill "${API_PID}" 2>/dev/null || true
  fi

  wait "${ADMIN_PID}" 2>/dev/null || true
  wait "${WEB_PID}" 2>/dev/null || true
  wait "${API_PID}" 2>/dev/null || true

  echo "[dev-up] finalizado."
}

start_service() {
  local name="$1"
  local command="$2"
  local logfile="$3"

  echo "[dev-up] subindo ${name}..."
  (
    cd "${ROOT_DIR}"
    exec ${command}
  ) >"${logfile}" 2>&1 &

  echo "$!"
}

require_cmd pnpm

if [[ "${AUTO_RESET}" == "1" ]]; then
  if [[ ! -x "${RUNTIME_RESET_SCRIPT}" ]]; then
    echo "[dev-up] runtime-reset ausente ou sem permissao de execucao: ${RUNTIME_RESET_SCRIPT}" >&2
    exit 1
  fi
fi

mkdir -p "${LOG_DIR}"

echo "[dev-up] raiz: ${ROOT_DIR}"
echo "[dev-up] logs: ${LOG_DIR}"
echo "[dev-up] portas: web=${WEB_PORT} admin=${ADMIN_PORT} api=${API_PORT}"

trap cleanup INT TERM EXIT

if [[ "${AUTO_RESET}" == "1" ]]; then
  echo "[dev-up] executando saneamento pre-start (runtime-reset)..."
  API_PORT="${API_PORT}" WEB_PORT="${WEB_PORT}" ADMIN_PORT="${ADMIN_PORT}" RESET_NEXT="${RESET_NEXT}" START_SERVICES=0 "${RUNTIME_RESET_SCRIPT}"
fi

API_PID="$(start_service "api (${API_PORT})" "pnpm dev:api" "${API_LOG}")"
WEB_PID="$(start_service "web (${WEB_PORT})" "pnpm dev:web" "${WEB_LOG}")"
ADMIN_PID="$(start_service "admin (${ADMIN_PORT})" "pnpm dev:admin" "${ADMIN_LOG}")"

sleep 2

for pair in \
  "api:${API_PID}:${API_LOG}" \
  "web:${WEB_PID}:${WEB_LOG}" \
  "admin:${ADMIN_PID}:${ADMIN_LOG}"; do
  IFS=":" read -r name pid logfile <<<"${pair}"
  if ! kill -0 "${pid}" 2>/dev/null; then
    echo "[dev-up] falha ao subir ${name}. Últimas linhas do log:" >&2
    tail -n 40 "${logfile}" >&2 || true
    exit 1
  fi
done

echo "[dev-up] serviços ativos:"
echo "  - web:   http://localhost:${WEB_PORT}"
echo "  - admin: http://localhost:${ADMIN_PORT}"
echo "  - api:   http://localhost:${API_PORT}"
echo
echo "[dev-up] logs:"
echo "  - ${API_LOG}"
echo "  - ${WEB_LOG}"
echo "  - ${ADMIN_LOG}"
echo
echo "[dev-up] pressione Ctrl+C para encerrar."

wait "${API_PID}" "${WEB_PID}" "${ADMIN_PID}"
