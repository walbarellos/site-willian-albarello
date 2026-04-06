#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="${ROOT_DIR}/.tmp/dev-up"

API_PORT="${API_PORT:-3002}"
WEB_PORT="${WEB_PORT:-3000}"
ADMIN_PORT="${ADMIN_PORT:-3001}"

START_SERVICES="${START_SERVICES:-0}"
RESET_NEXT="${RESET_NEXT:-0}"
WAIT_SECONDS="${WAIT_SECONDS:-2}"

API_LOG="${LOG_DIR}/api.log"
WEB_LOG="${LOG_DIR}/web.log"
ADMIN_LOG="${LOG_DIR}/admin.log"

log() {
  echo "[runtime-reset] $*"
}

require_cmd() {
  local cmd="$1"
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    echo "[runtime-reset] comando ausente: ${cmd}" >&2
    exit 1
  fi
}

collect_pids_from_port() {
  local port="$1"

  if ! command -v ss >/dev/null 2>&1; then
    return 0
  fi

  ss -ltnp "sport = :${port}" 2>/dev/null \
    | sed -nE 's/.*pid=([0-9]+).*/\1/p' \
    | sort -u
}

kill_pid_if_running() {
  local pid="$1"

  if [[ -z "${pid}" ]]; then
    return 0
  fi

  if ! kill -0 "${pid}" 2>/dev/null; then
    return 0
  fi

  kill "${pid}" 2>/dev/null || true
}

force_kill_pid_if_running() {
  local pid="$1"

  if [[ -z "${pid}" ]]; then
    return 0
  fi

  if ! kill -0 "${pid}" 2>/dev/null; then
    return 0
  fi

  kill -9 "${pid}" 2>/dev/null || true
}

stop_known_patterns() {
  # Limpa processos típicos de dev deste repositório.
  pkill -f "pnpm dev:api" 2>/dev/null || true
  pkill -f "pnpm dev:web" 2>/dev/null || true
  pkill -f "pnpm dev:admin" 2>/dev/null || true
  pkill -f "next dev -p ${WEB_PORT}" 2>/dev/null || true
  pkill -f "next dev -p ${ADMIN_PORT}" 2>/dev/null || true
}

stop_listeners_by_port() {
  local ports=("${WEB_PORT}" "${ADMIN_PORT}" "${API_PORT}")
  local pids=()
  local port pid

  for port in "${ports[@]}"; do
    while IFS= read -r pid; do
      [[ -n "${pid}" ]] && pids+=("${pid}")
    done < <(collect_pids_from_port "${port}")
  done

  if [[ "${#pids[@]}" -eq 0 ]]; then
    log "nenhum listener encontrado nas portas ${WEB_PORT}/${ADMIN_PORT}/${API_PORT}."
    return 0
  fi

  log "encerrando listeners nas portas-alvo: ${pids[*]}"
  for pid in "${pids[@]}"; do
    kill_pid_if_running "${pid}"
  done

  sleep 1

  for pid in "${pids[@]}"; do
    force_kill_pid_if_running "${pid}"
  done
}

clean_local_state() {
  mkdir -p "${LOG_DIR}"
  rm -f "${API_LOG}" "${WEB_LOG}" "${ADMIN_LOG}" 2>/dev/null || true

  if [[ "${RESET_NEXT}" == "1" ]]; then
    log "limpando caches .next de web/admin (RESET_NEXT=1)."
    rm -rf "${ROOT_DIR}/apps/web/.next" "${ROOT_DIR}/apps/admin/.next"
  fi
}

start_services() {
  local api_pid web_pid admin_pid

  require_cmd pnpm
  mkdir -p "${LOG_DIR}"

  log "iniciando api/web/admin..."
  (
    cd "${ROOT_DIR}"
    nohup pnpm dev:api >"${API_LOG}" 2>&1 &
    api_pid="$!"
    nohup pnpm dev:web >"${WEB_LOG}" 2>&1 &
    web_pid="$!"
    nohup pnpm dev:admin >"${ADMIN_LOG}" 2>&1 &
    admin_pid="$!"
    echo "${api_pid}:${web_pid}:${admin_pid}"
  )
}

main() {
  require_cmd sed
  require_cmd sort

  log "raiz: ${ROOT_DIR}"
  log "iniciando saneamento operacional..."

  stop_known_patterns
  stop_listeners_by_port
  clean_local_state

  if [[ "${START_SERVICES}" == "1" ]]; then
    local pids
    pids="$(start_services)"
    sleep "${WAIT_SECONDS}"
    log "stack reiniciado (api:web:admin pids=${pids})."
    log "logs em ${LOG_DIR}."
  else
    log "saneamento concluido sem restart (START_SERVICES=0)."
    log "para reiniciar automaticamente, use START_SERVICES=1."
  fi
}

main "$@"
