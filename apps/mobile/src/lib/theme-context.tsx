// ============================================================
// Mobile — Theme Context (light / dark / system)
// ============================================================

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeState } from '@repo/core/hooks';
import { Colors } from '@/constants/theme';
import { mobileStorage } from './storage';
import { themeStore } from './theme';
import type { ThemeMode, ResolvedThemeMode } from '@repo/types/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedThemeMode;
  colors: (typeof Colors)[ResolvedThemeMode];
  setMode: (mode: ThemeMode) => Promise<void>;
  hydrated: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const systemResolved: ResolvedThemeMode =
    systemScheme === 'dark' ? 'dark' : 'light';

  const { mode, resolved, setMode, hydrated } = useThemeState({
    store: themeStore,
    storage: mobileStorage,
    systemTheme: systemResolved,
  });

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolved,
      colors: Colors[resolved],
      setMode,
      hydrated,
    }),
    [hydrated, mode, resolved, setMode],
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
