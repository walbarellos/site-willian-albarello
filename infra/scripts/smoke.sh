#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3002}"
WEB_URL="${WEB_URL:-http://localhost:3000}"
ADMIN_URL="${ADMIN_URL:-http://localhost:3001}"

WARMUP_SECONDS="${WARMUP_SECONDS:-2}"
RETRIES="${RETRIES:-3}"
RETRY_DELAY_SECONDS="${RETRY_DELAY_SECONDS:-1}"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  local id="$1"
  local msg="$2"
  echo "[PASS] ${id} - ${msg}"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  local id="$1"
  local msg="$2"
  echo "[FAIL] ${id} - ${msg}"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

http_check() {
  local id="$1"
  local url="$2"
  local expected_status="$3"
  local outfile="${TMP_DIR}/${id}.body"
  local status attempt

  for ((attempt = 1; attempt <= RETRIES; attempt++)); do
    status="$(curl -sS -o "${outfile}" -w "%{http_code}" "${url}" || true)"

    if [[ "${status}" == "${expected_status}" ]]; then
      pass "${id}" "status ${status} (${url}) [tentativa ${attempt}/${RETRIES}]"
      return 0
    fi

    if (( attempt < RETRIES )); then
      sleep "${RETRY_DELAY_SECONDS}"
    fi
  done

  fail "${id}" "status esperado ${expected_status}, recebido ${status} (${url}) após ${RETRIES} tentativa(s)"
  return 1
}

echo "[smoke] API_URL=${API_URL}"
echo "[smoke] WEB_URL=${WEB_URL}"
echo "[smoke] ADMIN_URL=${ADMIN_URL}"
echo "[smoke] WARMUP_SECONDS=${WARMUP_SECONDS} RETRIES=${RETRIES} RETRY_DELAY_SECONDS=${RETRY_DELAY_SECONDS}"
echo

sleep "${WARMUP_SECONDS}"

# API: /health
if http_check "API-HEALTH" "${API_URL}/health" "200"; then
  if grep -q '"traceId"' "${TMP_DIR}/API-HEALTH.body"; then
    pass "API-HEALTH-TRACE" "meta.traceId presente"
  else
    fail "API-HEALTH-TRACE" "meta.traceId ausente em /health"
  fi
fi

# API: /ready
if http_check "API-READY" "${API_URL}/ready" "200"; then
  if grep -q '"traceId"' "${TMP_DIR}/API-READY.body"; then
    pass "API-READY-TRACE" "meta.traceId presente"
  else
    fail "API-READY-TRACE" "meta.traceId ausente em /ready"
  fi
fi

# Web: home
if http_check "WEB-HOME" "${WEB_URL}/" "200"; then
  if grep -qi "<html" "${TMP_DIR}/WEB-HOME.body"; then
    pass "WEB-HOME-HTML" "resposta HTML válida"
  else
    fail "WEB-HOME-HTML" "home respondeu sem HTML esperado"
  fi
fi

# Web: listagem pública
if http_check "WEB-PUBLICACOES" "${WEB_URL}/publicacoes" "200"; then
  if grep -qi "publica" "${TMP_DIR}/WEB-PUBLICACOES.body"; then
    pass "WEB-PUBLICACOES-CONTENT" "conteúdo de listagem identificado"
  else
    fail "WEB-PUBLICACOES-CONTENT" "conteúdo esperado não identificado na listagem"
  fi
fi

# Admin: login page
if http_check "ADMIN-LOGIN" "${ADMIN_URL}/painel/login" "200"; then
  if grep -qi "login" "${TMP_DIR}/ADMIN-LOGIN.body"; then
    pass "ADMIN-LOGIN-CONTENT" "conteúdo de login identificado"
  else
    fail "ADMIN-LOGIN-CONTENT" "conteúdo esperado não identificado na página de login"
  fi
fi

echo
echo "[smoke] resumo: PASS=${PASS_COUNT} FAIL=${FAIL_COUNT}"

if [[ "${FAIL_COUNT}" -gt 0 ]]; then
  exit 1
fi

echo "[smoke] ambiente utilizável para continuidade."
