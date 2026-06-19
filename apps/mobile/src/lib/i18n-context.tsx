// ============================================================
// Mobile — i18n Context & useT hook
// ============================================================

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import { createTranslate } from '@repo/core/i18n';
import type { Locale } from '@repo/types/i18n';
import { mobileStorage } from './storage';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof createTranslate>;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'app_locale';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh-CN');

  // Hydrate from storage
  useEffect(() => {
    mobileStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'zh-CN' || saved === 'en-US') {
        setLocaleState(saved);
      }
    }).catch(() => {});
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    mobileStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const t = useMemo(() => createTranslate(locale), [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

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
