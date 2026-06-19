// ============================================================
// MiniApp — i18n hook
// ============================================================

import { useMemo } from 'react';
import { createTranslate } from '@repo/core/i18n';
import { useLocaleState } from '@repo/core/hooks';
import { miniappStorage } from '@/lib/storage';
import { localeStore } from '@/lib/i18n';

export function useI18n() {
  const { locale, setLocale, hydrated } = useLocaleState({
    store: localeStore,
    storage: miniappStorage,
  });

  const t = useMemo(() => createTranslate(locale), [locale]);

  return { locale, setLocale, hydrated, t };
}
