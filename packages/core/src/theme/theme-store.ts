// ============================================================
// ThemeStore — platform-agnostic theme state
// ============================================================

import type { ThemeMode, ResolvedThemeMode } from '@repo/types/theme';
import { colors } from '../constants/tokens';

type Listener = (mode: ThemeMode, resolved: ResolvedThemeMode) => void;

export interface ThemeStore {
  getMode(): ThemeMode;
  setMode(mode: ThemeMode): void;
  getResolved(systemTheme: ResolvedThemeMode): ResolvedThemeMode;
  resolve(mode: ThemeMode, systemTheme: ResolvedThemeMode): ResolvedThemeMode;
  subscribe(listener: Listener): () => void;
}

export function createThemeStore(initialMode: ThemeMode = 'system'): ThemeStore {
  let mode: ThemeMode = initialMode;
  const listeners = new Set<Listener>();

  return {
    getMode(): ThemeMode {
      return mode;
    },

    setMode(newMode: ThemeMode): void {
      if (mode === newMode) return;
      mode = newMode;
      // Notify with a default resolved; real resolved set by consumer
      const resolved: ResolvedThemeMode = mode === 'system' ? 'light' : mode;
      listeners.forEach((fn) => fn(mode, resolved));
    },

    getResolved(systemTheme: ResolvedThemeMode): ResolvedThemeMode {
      return this.resolve(mode, systemTheme);
    },

    resolve(m: ThemeMode, systemTheme: ResolvedThemeMode): ResolvedThemeMode {
      return m === 'system' ? systemTheme : m;
    },

    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Get color tokens for a resolved theme */
export function getThemeColors(resolved: ResolvedThemeMode) {
  return colors[resolved];
}

// Singleton — each app creates its own
