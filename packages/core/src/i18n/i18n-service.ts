// ============================================================
// i18n core — translation service
// ============================================================

import type { Locale, Messages } from '@repo/types/i18n';
import zhCN from './messages/zh-CN';
import enUS from './messages/en-US';

const messages: Record<Locale, Messages> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export { messages };

/** Simple translation: t('common.ok') → '确定' */
export function createTranslate(currentLocale: Locale) {
  return function t(key: string, params?: Record<string, string | number>): string {
    const template = messages[currentLocale]?.[key] ?? messages['zh-CN']?.[key] ?? key;

    if (!params) return template;

    return template.replace(/\{(\w+)\}/g, (_, name: string) => {
      const val = params[name];
      return val !== undefined ? String(val) : `{${name}}`;
    });
  };
}

/** Interpolate params: "Hello, {name}" + {name: "World"} → "Hello, World" */
export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const val = params[name];
    return val !== undefined ? String(val) : `{${name}}`;
  });
}
