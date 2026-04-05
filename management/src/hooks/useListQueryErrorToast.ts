import { useEffect, useRef } from 'react';
import { message } from 'antd';

/**
 * 列表 useQuery 报错时弹出一次提示，避免 error 引用变化或 StrictMode 导致重复 message / 连带重渲染闪动。
 */
export function useListQueryErrorToast(
  isError: boolean,
  error: unknown,
  messageKey: string,
  title: string
): void {
  const lastFingerprint = useRef<string | null>(null);

  useEffect(() => {
    if (!isError) {
      lastFingerprint.current = null;
      return;
    }
    const detail = error instanceof Error ? error.message : String(error ?? '');
    const fingerprint = `${messageKey}:${detail}`;
    if (lastFingerprint.current === fingerprint) return;
    lastFingerprint.current = fingerprint;
    message.error({
      key: messageKey,
      content: `${title}: ${detail}`,
    });
  }, [isError, error, messageKey, title]);
}
