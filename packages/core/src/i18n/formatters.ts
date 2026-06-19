// ============================================================
// i18n formatters — date / number / currency
// ============================================================

import type { Locale } from '@repo/types/i18n';

const localeMap: Record<Locale, string> = {
  'zh-CN': 'zh-CN',
  'en-US': 'en-US',
};

export function formatDate(
  date: Date | number | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Intl.DateTimeFormat(localeMap[locale] ?? 'zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  }).format(d);
}

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(localeMap[locale] ?? 'zh-CN', options).format(value);
}

export function formatCurrency(
  value: number,
  currency: string,
  locale: Locale,
): string {
  return new Intl.NumberFormat(localeMap[locale] ?? 'zh-CN', {
    style: 'currency',
    currency,
  }).format(value);
}
