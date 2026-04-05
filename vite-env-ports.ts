import fs from 'node:fs';
import path from 'node:path';

/**
 * 从 scripts/dev-ports.env 注入 process.env（仅当对应键未设置时），
 * 便于直接运行 `vite` 或经 npm scripts 启动时端口一致。
 */
export function applyDevPortsFromFile(rootDir: string): void {
  const file = path.join(rootDir, 'scripts', 'dev-ports.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined || process.env[key] === '') {
      process.env[key] = val;
    }
  }
}

export function devPorts(rootDir: string) {
  applyDevPortsFromFile(rootDir);
  return {
    site: Number(process.env.REDWOOD_PORT_SITE || 5173),
    management: Number(process.env.REDWOOD_PORT_MANAGEMENT || 3001),
    api: Number(process.env.REDWOOD_PORT_API || 3000),
  };
}
