/**
 * 管理端 HTTP API 与 Socket.IO 的基址策略：
 * - 开发：HTTP 固定 `/api`，由 Vite 代理到后端（见仓库根目录 vite.config.management.ts）。
 * - 生产：若设置 VITE_API_BASE_URL，axios 使用该完整根路径；否则仍用同源 `/api`（需 Nginx 反代）。
 */

const MGMT_DEV_PORTS = new Set(['3001', '3002']);

function trimEnv(s: string | undefined): string | undefined {
  const t = s?.trim();
  return t || undefined;
}

/** axios baseURL：开发恒为 /api；生产可在设置 VITE_API_BASE_URL 时直连后端 */
export function getManagementApiBaseURL(): string {
  if (import.meta.env.DEV) {
    return '/api';
  }
  const raw = trimEnv(import.meta.env.VITE_API_BASE_URL);
  if (raw) {
    return raw.replace(/\/$/, '');
  }
  return '/api';
}

/**
 * Socket.IO 连接的 HTTP(S) 源（不含 path）。服务端挂在 httpServer 根路径，与 /api 前缀无关。
 */
export function getManagementSocketHttpOrigin(): string {
  const raw = trimEnv(import.meta.env.VITE_API_BASE_URL);
  if (raw) {
    try {
      const withProto = raw.includes('://') ? raw : `https://${raw}`;
      const u = new URL(withProto);
      if (import.meta.env.DEV && MGMT_DEV_PORTS.has(u.port)) {
        console.warn(
          '[management] VITE_API_BASE_URL 的端口像前端 dev（3001/3002），WebSocket 可能连错；请指向后端（与 backend/.env 的 PORT 或 REDWOOD_PORT_API 一致）'
        );
      }
      return `${u.protocol}//${u.host}`;
    } catch {
      if (import.meta.env.DEV) {
        console.warn(
          '[management] 无法解析 VITE_API_BASE_URL，WebSocket 回退到开发默认端口'
        );
      }
    }
  }
  if (import.meta.env.DEV) {
    const p =
      typeof import.meta.env.VITE_DEV_API_PORT === 'string' &&
      import.meta.env.VITE_DEV_API_PORT.trim() !== ''
        ? import.meta.env.VITE_DEV_API_PORT.trim()
        : '3000';
    return `http://127.0.0.1:${p}`;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
}

export function getManagementSocketUrl(): string {
  return getManagementSocketHttpOrigin().replace(/^http/, 'ws');
}

/**
 * 存活探测 URL：开发用同源 `/health`，走 Vite 代理到 `REDWOOD_PORT_API`；
 * 生产用后端 HTTP 源（与 Socket 一致）。
 */
export function getManagementHealthProbeUrl(): string {
  if (import.meta.env.DEV) {
    return '/health';
  }
  return `${getManagementSocketHttpOrigin().replace(/\/$/, '')}/health`;
}

/** 告警文案用的人类可读探测目标 */
export function formatManagementHealthProbeLabel(): string {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return `${window.location.origin}/health（由 Vite 代理至后端，与 /api 同源目标）`;
  }
  return `${getManagementSocketHttpOrigin()}/health`;
}
