import { useCallback, useMemo, useState } from 'react';
import type { ClientPlatform, FeedbackPort } from '@repo/types';
import type { TranslateFn } from '@repo/types/i18n';
import {
  createInitialContactFormDraft,
  submitContactFormAction,
  type ContactFormDraft,
} from './model';
import { createSingleFlightExecutor } from '../shared/mutation';

export function useContactFormController(options: {
  platform: ClientPlatform;
  feedback: FeedbackPort;
  t: TranslateFn;
}) {
  const { platform, feedback, t } = options;
  const [draft, setDraft] = useState<ContactFormDraft>(createInitialContactFormDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const executor = useMemo(() => createSingleFlightExecutor(), []);

  const updateField = useCallback(<K extends keyof ContactFormDraft>(key: K, value: ContactFormDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setDraft(createInitialContactFormDraft());
    setErrors({});
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      return await executor('submit', async () => {
        const result = await submitContactFormAction({
          platform,
          feedback,
          t,
          draft,
        });

        setErrors(result.errors);
        return result.ok;
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [draft, executor, feedback, platform, t]);

  return {
    draft,
    errors,
    isSubmitting,
    setName: (value: string) => updateField('name', value),
    setPhone: (value: string) => updateField('phone', value),
    setEmail: (value: string) => updateField('email', value),
    setRemark: (value: string) => updateField('remark', value),
    handleReset,
    handleSubmit,
  };
}
