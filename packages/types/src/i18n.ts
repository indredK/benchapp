// ============================================================
// i18n type definitions
// ============================================================

/** Supported locale identifiers */
export type Locale = 'zh-CN' | 'en-US';

/** i18n state shape */
export interface I18nState {
  locale: Locale;
  fallbackLocale: Locale;
}

/** Message key → translated template */
export type Messages = Record<string, string>;

/** All locale messages */
export type LocaleMessages = Record<Locale, Messages>;

/** Translation function type */
export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

/** i18n service interface */
export interface I18nService {
  getLocale(): Locale;
  setLocale(locale: Locale): void;
  t(key: string, params?: Record<string, string | number>): string;
  subscribe(listener: (locale: Locale) => void): () => void;
}
