// ============================================================
// useThemeState — domain hook: theme management
// ============================================================

import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import type { ThemeMode, ResolvedThemeMode } from '@repo/types/theme';
import type { StorageAdapter } from '@repo/types';

interface ThemeStoreLike {
  getMode(): ThemeMode;
  setMode(mode: ThemeMode): void;
  resolve(mode: ThemeMode, systemTheme: ResolvedThemeMode): ResolvedThemeMode;
  subscribe(listener: (mode: ThemeMode, resolved: ResolvedThemeMode) => void): () => void;
}

export function useThemeState(options: {
  store: ThemeStoreLike;
  storage?: StorageAdapter;
  storageKey?: string;
  /** System theme from platform hook (e.g. useColorScheme) */
  systemTheme: ResolvedThemeMode;
}) {
  const { store, storage, storageKey = 'app_theme', systemTheme } = options;

  const mode = useSyncExternalStore(
    (cb) => store.subscribe((m) => cb(m)),
    store.getMode,
    store.getMode,
  );

  const resolved = store.resolve(mode, systemTheme);

  const setMode = useCallback(async (next: ThemeMode) => {
    store.setMode(next);
    if (storage) {
      await storage.setItem(storageKey, next).catch(() => {});
    }
  }, [store, storage, storageKey]);

  // Hydrate from storage
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (!storage) {
      setHydrated(true);
      return;
    }
    storage.getItem(storageKey).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        store.setMode(saved);
      }
      setHydrated(true);
    }).catch(() => setHydrated(true));
  }, [storage, storageKey, store]);

  return { mode, resolved, setMode, hydrated };
}

export { ThemeMode, ResolvedThemeMode };
