// ============================================================
// Mobile — Theme Context (light / dark / system)
// ============================================================

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import type { ThemeColor } from '@/constants/theme';
import { mobileStorage } from './storage';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  colors: typeof Colors.light;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'app_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const systemResolved: ResolvedTheme =
    systemScheme === 'dark' ? 'dark' : 'light';

  const [mode, setModeState] = useState<ThemeMode>('system');

  // Hydrate from storage
  useEffect(() => {
    mobileStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
    }).catch(() => {});
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    mobileStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const resolved: ResolvedTheme = mode === 'system' ? systemResolved : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolved,
      colors: Colors[resolved],
      setMode,
    }),
    [mode, resolved, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx.colors;
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
  return { mode: ctx.mode, resolved: ctx.resolved, setMode: ctx.setMode };
}
