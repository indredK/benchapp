// ============================================================
// useLocaleState — domain hook: locale management
// ============================================================

import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import type { Locale } from '@repo/types/i18n';
import type { StorageAdapter } from '@repo/types';

interface LocaleStore {
  getState(): Locale;
  setState(next: Locale): void;
  subscribe(listener: (locale: Locale) => void): () => void;
}

export function useLocaleState(options: {
  /** The underlying store (e.g. from createAtomStore) */
  store: LocaleStore;
  /** Optional storage adapter for persistence */
  storage?: StorageAdapter;
  /** Storage key */
  storageKey?: string;
}) {
  const { store, storage, storageKey = 'app_locale' } = options;

  const locale = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  );

  const setLocale = useCallback(async (next: Locale) => {
    store.setState(next);
    if (storage) {
      await storage.setItem(storageKey, next).catch(() => {});
    }
  }, [store, storage, storageKey]);

  // Hydrate from storage on mount
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (!storage) {
      setHydrated(true);
      return;
    }
    storage.getItem(storageKey).then((saved) => {
      if (saved === 'zh-CN' || saved === 'en-US') {
        store.setState(saved);
      }
      setHydrated(true);
    }).catch(() => setHydrated(true));
  }, [storage, storageKey, store]);

  return { locale, setLocale, hydrated };
}
