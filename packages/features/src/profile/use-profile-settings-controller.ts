import { useCallback, useMemo } from 'react';
import type { FeedbackPort } from '@repo/types';
import type { TranslateFn } from '@repo/types/i18n';
import { confirmLogout, createLanguageOptions, createThemeOptions } from './model';

export function useProfileSettingsController(options: {
  feedback: FeedbackPort;
  t: TranslateFn;
}) {
  const { feedback, t } = options;

  const languageOptions = useMemo(() => createLanguageOptions(t), [t]);
  const themeOptions = useMemo(() => createThemeOptions(t), [t]);

  const handleLogout = useCallback(async (onConfirm?: () => void | Promise<void>) => {
    return confirmLogout({ feedback, t, onConfirm });
  }, [feedback, t]);

  return {
    languageOptions,
    themeOptions,
    handleLogout,
  };
}
