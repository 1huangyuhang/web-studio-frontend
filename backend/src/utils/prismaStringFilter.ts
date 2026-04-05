import type { Prisma } from '@prisma/client';

/**
 * Prisma 的 `mode: 'insensitive'` 仅部分数据源支持（如 PostgreSQL、MySQL）。
 * SQLite 等会抛错导致列表接口 500；按连接串仅在支持时附加 mode。
 */
function caseInsensitiveMode(): Prisma.QueryMode | undefined {
  const url = (process.env['DATABASE_URL'] ?? '').trim();
  if (/^postgres(ql)?:/i.test(url) || /^mysql:/i.test(url)) {
    return 'insensitive';
  }
  return undefined;
}

export function prismaStringContains(q: string): Prisma.StringFilter {
  const mode = caseInsensitiveMode();
  return mode ? { contains: q, mode } : { contains: q };
}

export function prismaStringEquals(q: string): Prisma.StringFilter {
  const mode = caseInsensitiveMode();
  return mode ? { equals: q, mode } : { equals: q };
}
