#!/usr/bin/env node
/**
 * 管理端联调快速检查：后端 /health、/api 列表接口、与 dev-ports 端口是否一致。
 * 用法：npm run check:management-api
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function readEnvPort(key, fallback) {
  const envPath = join(root, 'scripts', 'dev-ports.env');
  if (!existsSync(envPath)) return fallback;
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const m = t.match(new RegExp(`^${key}\\s*=\\s*(\\d+)\\s*$`));
    if (m) return Number(m[1]);
  }
  return fallback;
}

const apiPort =
  process.env.REDWOOD_PORT_API != null && process.env.REDWOOD_PORT_API !== ''
    ? Number(process.env.REDWOOD_PORT_API)
    : readEnvPort('REDWOOD_PORT_API', 3000);
const mgmtPort =
  process.env.REDWOOD_PORT_MANAGEMENT != null &&
  process.env.REDWOOD_PORT_MANAGEMENT !== ''
    ? Number(process.env.REDWOOD_PORT_MANAGEMENT)
    : readEnvPort('REDWOOD_PORT_MANAGEMENT', 3001);

const healthUrl = `http://127.0.0.1:${apiPort}/health`;
const healthReadyUrl = `http://127.0.0.1:${apiPort}/health/ready`;
const activitiesUrl = `http://127.0.0.1:${apiPort}/api/activities?page=1&pageSize=1`;
const siteAssetsUrl = `http://127.0.0.1:${apiPort}/api/site-assets`;
const siteAssetsListUrl = `http://127.0.0.1:${apiPort}/api/site-assets?omitImage=1`;
const statsSummaryUrl = `http://127.0.0.1:${apiPort}/api/stats/summary`;

console.log('--- 管理端 API 联调检查 ---\n');
console.log(
  `scripts/dev-ports.env（或环境变量）: REDWOOD_PORT_API=${apiPort}, REDWOOD_PORT_MANAGEMENT=${mgmtPort}`
);
console.log(
  `npm run dev:management 时浏览器应打开 ≈ http://localhost:${mgmtPort}，/api 将代理到 127.0.0.1:${apiPort}\n`
);

try {
  const res = await fetch(healthUrl, { signal: AbortSignal.timeout(3000) });
  const text = await res.text();
  if (!res.ok) {
    console.error(`后端 ${healthUrl} 返回 HTTP ${res.status}: ${text}`);
    process.exit(1);
  }
  console.log(
    `后端 ${healthUrl} → OK (${text.slice(0, 120)}${text.length > 120 ? '…' : ''})`
  );
  try {
    const readyRes = await fetch(healthReadyUrl, {
      signal: AbortSignal.timeout(5000),
    });
    const readyText = await readyRes.text();
    if (readyRes.ok) {
      console.log(
        `后端 ${healthReadyUrl} → OK (${readyText.slice(0, 120)}${readyText.length > 120 ? '…' : ''})`
      );
    } else {
      console.warn(
        `后端 ${healthReadyUrl} → HTTP ${readyRes.status}（数据库可能未就绪，部署探针会判失败）`
      );
    }
  } catch (e2) {
    console.warn(
      `后端 ${healthReadyUrl} 请求异常（可忽略若暂未连库）: ${String(e2?.message ?? e2)}`
    );
  }
} catch (e) {
  console.error(
    `后端 ${healthUrl} 不可达 → 管理端列表会报 HTTP 500/网络错误。请先启动: cd backend && npm run dev`
  );
  console.error(`  （并确认 backend/.env 中 PORT 与 REDWOOD_PORT_API=${apiPort} 一致）`);
  console.error(String(e?.message ?? e));
  process.exit(1);
}

const apiKey = process.env.API_KEY || 'default-api-key';

async function checkMgmtGet(label, url) {
  try {
    const res = await fetch(url, {
      headers: { 'x-api-key': apiKey },
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();
    const preview = text.slice(0, 280).replace(/\s+/g, ' ');
    console.log(`\n${label}`);
    console.log(`  GET ${url} → HTTP ${res.status}`);
    if (!res.ok) {
      console.log(`  响应片段: ${preview}${text.length > 280 ? '…' : ''}`);
      if (res.status === 401) {
        console.log(
          '  提示: 401 多为 API_KEY 与 backend/.env 中 API_KEY 不一致；或改用登录 JWT。'
        );
      }
      if (res.status >= 500) {
        console.log(
          '  提示: 5xx 多为数据库未迁移(P2021/P2022)或 Prisma 连库失败，请在后端终端看报错，并执行: cd backend && npx prisma migrate deploy'
        );
        console.log(
          '  提示: 站点素材全量列表含 BYTEA→Base64 时体积过大也可能 500；管理端应使用 ?omitImage=1（见下一条检查）。'
        );
      }
    }
  } catch (e) {
    console.error(`  ${label} 请求异常:`, String(e?.message ?? e));
  }
}

/** Dashboard 同源接口：失败则非零退出，便于 CI / 本地联调门禁 */
async function checkMgmtGetRequired(label, url) {
  let res;
  try {
    res = await fetch(url, {
      headers: { 'x-api-key': apiKey },
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    console.error(`\n${label} 请求失败（网络/超时）`);
    console.error(`  GET ${url}`);
    console.error(`  ${String(e?.message ?? e)}`);
    process.exit(1);
  }
  const text = await res.text();
  const preview = text.slice(0, 280).replace(/\s+/g, ' ');
  console.log(`\n${label}`);
  console.log(`  GET ${url} → HTTP ${res.status}`);
  if (!res.ok) {
    console.error(`  响应片段: ${preview}${text.length > 280 ? '…' : ''}`);
    if (res.status === 401) {
      console.error(
        '  提示: 401 多为 API_KEY 与 backend/.env 中 API_KEY 不一致。'
      );
    }
    if (res.status >= 500) {
      console.error(
        '  提示: 5xx 请检查数据库迁移与 DATABASE_URL；见 docs/management-api-troubleshooting.md'
      );
    }
    process.exit(1);
  }
}

await checkMgmtGetRequired('统计摘要（Dashboard 同源，必过）', statsSummaryUrl);
await checkMgmtGet('活动列表（与管理端报错同源）', activitiesUrl);
await checkMgmtGet('站点素材列表', siteAssetsUrl);
await checkMgmtGet('站点素材列表（omitImage，管理端实际使用）', siteAssetsListUrl);

console.log('\n检查结束。\n');
