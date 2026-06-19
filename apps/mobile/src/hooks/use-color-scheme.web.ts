import { useSyncExternalStore } from 'react';

const mediaQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function subscribe(callback: () => void) {
  if (!mediaQuery) return () => {};
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getSnapshot() {
  if (!mediaQuery) return 'light' as const;
  return mediaQuery.matches ? ('dark' as const) : ('light' as const);
}

function getServerSnapshot() {
  return 'light' as const;
}

/**
 * Web 端系统配色方案 hook。
 * 使用 useSyncExternalStore 避免 hydration 闪烁：
 * 首屏与服务端返回一致的 'light'，客户端挂载后立刻同步真实值。
 */
export function useColorScheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
