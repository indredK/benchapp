// ============================================================
// Mobile — i18n Context & useT hook
// ============================================================

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createTranslate } from '@repo/core/i18n';
import { useLocaleState } from '@repo/core/hooks';
import { mobileStorage } from './storage';
import { localeStore } from './i18n';
import type { Locale } from '@repo/types/i18n';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: ReturnType<typeof createTranslate>;
  hydrated: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { locale, setLocale, hydrated } = useLocaleState({
    store: localeStore,
    storage: mobileStorage,
  });

  const t = useMemo(() => createTranslate(locale), [locale]);

  const value = useMemo(() => ({ locale, setLocale, t, hydrated }), [hydrated, locale, setLocale, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used within I18nProvider');
  return ctx.t;
}

export function useLocale() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useLocale must be used within I18nProvider');
  return { locale: ctx.locale, setLocale: ctx.setLocale };
}
