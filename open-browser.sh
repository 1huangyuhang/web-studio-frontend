#!/usr/bin/env bash
# 使用 scripts/dev-ports.env 中的端口打开官网、管理端（及可选 API 文档）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
set -a
# shellcheck disable=SC1091
source "${ROOT}/scripts/dev-ports.env"
set +a

SITE="http://127.0.0.1:${REDWOOD_PORT_SITE}/"
MGMT="http://127.0.0.1:${REDWOOD_PORT_MANAGEMENT}/"
DOCS="http://127.0.0.1:${REDWOOD_PORT_API}/api-docs"

sleep "${REDWOOD_OPEN_BROWSER_DELAY:-2}"

open_urls() {
  if [[ "$(uname -s)" == "Darwin" ]]; then
    open "${SITE}" || true
    open "${MGMT}" || true
    if [[ "${REDWOOD_OPEN_API_DOCS:-}" == "1" ]]; then
      open "${DOCS}" || true
    fi
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "${SITE}" >/dev/null 2>&1 || true
    xdg-open "${MGMT}" >/dev/null 2>&1 || true
    if [[ "${REDWOOD_OPEN_API_DOCS:-}" == "1" ]]; then
      xdg-open "${DOCS}" >/dev/null 2>&1 || true
    fi
  else
    echo "请手动打开: ${SITE}  ${MGMT}"
  fi
}

if command -v cursor >/dev/null 2>&1; then
  cursor "${ROOT}" >/dev/null 2>&1 &
elif command -v code >/dev/null 2>&1; then
  code "${ROOT}" >/dev/null 2>&1 &
fi

open_urls
