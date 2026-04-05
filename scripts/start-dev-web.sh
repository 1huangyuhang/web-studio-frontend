#!/usr/bin/env bash
# 启动官网 + 企业管理系统，并在本机打开浏览器；可选用 Cursor CLI 打开工作区。
# 端口统一在 scripts/dev-ports.env 配置。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck source=dev-ports.env
set -a
# shellcheck disable=SC1091
source "${ROOT}/scripts/dev-ports.env"
set +a

LOG_MAIN="${TMPDIR:-/tmp}/redwood-vite-site.log"
LOG_MGMT="${TMPDIR:-/tmp}/redwood-vite-management.log"

if [[ -z "${REDWOOD_SKIP_GIT_CHECKOUT:-}" ]]; then
  # 注意：Git 无法同时存在分支 develop 与 develop/dev（引用路径冲突），请用 develop 或 feature/dev。
  _BRANCH="${REDWOOD_GIT_BRANCH:-develop}"
  if git show-ref --verify --quiet "refs/heads/${_BRANCH}"; then
    git checkout "${_BRANCH}" || true
  elif git show-ref --verify --quiet "refs/remotes/origin/${_BRANCH}"; then
    git checkout -B "${_BRANCH}" "origin/${_BRANCH}" || true
  else
    echo "[start-dev-web] 未找到分支 ${_BRANCH}，跳过 git checkout（可设置 REDWOOD_GIT_BRANCH 或 REDWOOD_SKIP_GIT_CHECKOUT=1）"
  fi
fi

if command -v lsof >/dev/null 2>&1; then
  for p in "${REDWOOD_PORT_SITE}" "${REDWOOD_PORT_MANAGEMENT}"; do
    if lsof -iTCP:"${p}" -sTCP:LISTEN -t >/dev/null 2>&1; then
      echo "[start-dev-web] 端口 ${p} 已被占用，请先结束对应进程或修改 scripts/dev-ports.env"
      exit 1
    fi
  done
fi

echo "[start-dev-web] 官网 http://127.0.0.1:${REDWOOD_PORT_SITE}/  |  管理端 http://127.0.0.1:${REDWOOD_PORT_MANAGEMENT}/"
echo "[start-dev-web] API 代理 -> http://127.0.0.1:${REDWOOD_PORT_API} （需自行启动 backend）"

nohup npm run dev >>"${LOG_MAIN}" 2>&1 &
echo $! >"${TMPDIR:-/tmp}/redwood-vite-site.pid"

nohup npm run dev:management >>"${LOG_MGMT}" 2>&1 &
echo $! >"${TMPDIR:-/tmp}/redwood-vite-management.pid"

sleep 2

if command -v cursor >/dev/null 2>&1; then
  cursor "${ROOT}" >/dev/null 2>&1 &
elif command -v code >/dev/null 2>&1; then
  code "${ROOT}" >/dev/null 2>&1 &
fi

if [[ "$(uname -s)" == "Darwin" ]]; then
  open "http://127.0.0.1:${REDWOOD_PORT_SITE}/"
  open "http://127.0.0.1:${REDWOOD_PORT_MANAGEMENT}/"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://127.0.0.1:${REDWOOD_PORT_SITE}/" >/dev/null 2>&1 || true
  xdg-open "http://127.0.0.1:${REDWOOD_PORT_MANAGEMENT}/" >/dev/null 2>&1 || true
fi

echo "[start-dev-web] 日志: ${LOG_MAIN} , ${LOG_MGMT}"
echo "[start-dev-web] 停止: npm run dev:web:stop  或 bash scripts/stop-dev-web.sh"
