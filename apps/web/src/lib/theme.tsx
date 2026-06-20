// ============================================================
// Web — Theme Provider (CSS class-based)
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useThemeState } from '@repo/core/hooks';
import { createThemeStore } from '@repo/core/theme';
import { webStorage } from './storage';
import type { ThemeMode, ResolvedThemeMode } from '@repo/types/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  hydrated: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const themeStore = createThemeStore('system');

function subscribeSystemTheme(listener: () => void) {
  if (typeof window === 'undefined') return () => {};
  const matcher = window.matchMedia('(prefers-color-scheme: dark)');
  matcher.addEventListener('change', listener);
  return () => matcher.removeEventListener('change', listener);
}

function getSystemTheme(): ResolvedThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemTheme = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemTheme,
    () => 'light' as ResolvedThemeMode,
  );
  const { mode, resolved, setMode, hydrated } = useThemeState({
    store: themeStore,
    storage: webStorage,
    systemTheme,
  });

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', resolved === 'dark');
  }, [resolved]);

  const value = useMemo(
    () => ({ mode, resolved, setMode, hydrated }),
    [hydrated, mode, resolved, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
  return ctx;
}
