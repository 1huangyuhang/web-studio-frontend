import { QueryClient } from '@tanstack/react-query';

let client: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (!client) {
    client = new QueryClient({
      defaultOptions: {
        queries: {
          /** 避免一切换窗口/点菜单失焦就整表 refetch + loading 闪动 */
          staleTime: 30 * 1000,
          gcTime: 5 * 60 * 1000,
          retry: 1,
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
        },
      },
    });
  }
  return client;
}
