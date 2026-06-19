import type { FeedbackPort } from '@repo/types';
import type { Locale } from '@repo/types/i18n';
import type { ThemeMode } from '@repo/types/theme';
import type { TranslateFn } from '@repo/types/i18n';

export interface SelectionOption<T extends string> {
  key: T;
  label: string;
}

export function createLanguageOptions(t: TranslateFn): SelectionOption<Locale>[] {
  return [
    { key: 'zh-CN', label: t('language.zhCN') },
    { key: 'en-US', label: t('language.enUS') },
  ];
}

export function createThemeOptions(t: TranslateFn): SelectionOption<ThemeMode>[] {
  return [
    { key: 'light', label: t('theme.light') },
    { key: 'dark', label: t('theme.dark') },
    { key: 'system', label: t('theme.system') },
  ];
}

export async function confirmLogout(options: {
  feedback: FeedbackPort;
  t: TranslateFn;
  onConfirm?: () => void | Promise<void>;
}) {
  const confirmed = await options.feedback.confirm({
    title: options.t('settings.logout'),
    message: options.t('profile.logoutConfirm'),
    confirmText: options.t('settings.logout'),
    cancelText: options.t('common.cancel'),
    destructive: true,
  });

  if (confirmed) {
    await options.onConfirm?.();
  }

  return confirmed;
}
