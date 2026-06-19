// ============================================================
// MiniApp — Theme hook (light / dark / system)
// ============================================================

import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { useThemeState } from '@repo/core/hooks';
import type { ResolvedThemeMode } from '@repo/types/theme';
import { miniappStorage } from '@/lib/storage';
import { themeStore } from '@/lib/theme';

function resolveSystemTheme(): ResolvedThemeMode {
  try {
    const sysInfo = Taro.getSystemInfoSync();
    return sysInfo.theme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function useMiniappSystemTheme(): ResolvedThemeMode {
  const [systemTheme, setSystemTheme] = useState<ResolvedThemeMode>(resolveSystemTheme);

  useEffect(() => {
    const anyTaro = Taro as typeof Taro & {
      onThemeChange?: (listener: (res: { theme: string }) => void) => void;
      offThemeChange?: (listener: (res: { theme: string }) => void) => void;
    };
    const listener = (res: { theme: string }) => {
      setSystemTheme(res.theme === 'dark' ? 'dark' : 'light');
    };
    anyTaro.onThemeChange?.(listener);
    return () => anyTaro.offThemeChange?.(listener);
  }, []);

  return systemTheme;
}

export function useTheme() {
  const systemTheme = useMiniappSystemTheme();

  return useThemeState({
    store: themeStore,
    storage: miniappStorage,
    systemTheme,
  });
}
