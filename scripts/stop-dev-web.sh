#!/usr/bin/env bash
# 按 dev-ports.env 中的端口结束官网 / 管理端 Vite 监听进程
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
set -a
# shellcheck disable=SC1091
source "${ROOT}/scripts/dev-ports.env"
set +a

kill_port() {
  local p="$1"
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -tiTCP:"${p}" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "${pids}" ]]; then
      while read -r pid; do
        [[ -n "${pid}" ]] || continue
        kill "${pid}" 2>/dev/null || true
        echo "[stop-dev-web] 已结束监听端口 ${p} 的进程: ${pid}"
      done <<<"${pids}"
    fi
  fi
}

for pidfile in "${TMPDIR:-/tmp}/redwood-vite-site.pid" "${TMPDIR:-/tmp}/redwood-vite-management.pid"; do
  if [[ -f "${pidfile}" ]]; then
    pid="$(cat "${pidfile}" 2>/dev/null || true)"
    if [[ -n "${pid}" ]] && kill -0 "${pid}" 2>/dev/null; then
      kill "${pid}" 2>/dev/null || true
      echo "[stop-dev-web] 已结束 pid ${pid} (${pidfile})"
    fi
    rm -f "${pidfile}"
  fi
done

kill_port "${REDWOOD_PORT_SITE}"
kill_port "${REDWOOD_PORT_MANAGEMENT}"
echo "[stop-dev-web] 完成"
