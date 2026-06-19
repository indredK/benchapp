// ============================================================
// Web — i18n Provider
// ============================================================

import { createContext, useContext, useMemo, useEffect, type ReactNode } from 'react';
import { createTranslate } from '@repo/core/i18n';
import { useLocaleState } from '@repo/core/hooks';
import { createAtomStore } from '@repo/core/store';
import { webStorage } from './storage';
import type { Locale } from '@repo/types/i18n';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: ReturnType<typeof createTranslate>;
  hydrated: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const localeAtom = createAtomStore<Locale>('zh-CN');
const localeStore = {
  getState: () => localeAtom.getState(),
  setState: (next: Locale) => localeAtom.setState(next),
  subscribe: localeAtom.subscribe,
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const { locale, setLocale, hydrated } = useLocaleState({
    store: localeStore,
    storage: webStorage,
  });

  const t = useMemo(() => createTranslate(locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale === 'zh-CN' ? 'zh-CN' : 'en';
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, hydrated }}>
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
