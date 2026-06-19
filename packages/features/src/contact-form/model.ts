import { isEmail, isPhone, maxLength, required, validate } from '@repo/core/form';
import type { ClientPlatform, FeedbackPort } from '@repo/types';
import type { TranslateFn } from '@repo/types/i18n';
import { createMutationContext, type MutationContext } from '../shared/mutation';

export interface ContactFormDraft {
  name: string;
  phone: string;
  email: string;
  remark: string;
}

export interface ContactFormSubmitResult {
  ok: boolean;
  errors: Record<string, string>;
  mutation?: MutationContext;
}

export function createInitialContactFormDraft(): ContactFormDraft {
  return {
    name: '',
    phone: '',
    email: '',
    remark: '',
  };
}

export function validateContactFormDraft(
  draft: ContactFormDraft,
  t: TranslateFn,
) {
  return validate({
    name: {
      value: draft.name,
      rules: [
        required(t('validation.nameRequired')),
        maxLength(32, t('validation.nameTooLong')),
      ],
    },
    phone: {
      value: draft.phone,
      rules: [
        required(t('validation.phoneRequired')),
        isPhone(t('validation.phoneInvalid')),
      ],
    },
    email: {
      value: draft.email,
      rules: draft.email.trim().length > 0 ? [isEmail(t('validation.emailInvalid'))] : [],
    },
    remark: {
      value: draft.remark,
      rules: [maxLength(200, t('validation.remarkTooLong'))],
    },
  });
}

export async function submitContactFormAction(options: {
  platform: ClientPlatform;
  feedback: FeedbackPort;
  t: TranslateFn;
  draft: ContactFormDraft;
}): Promise<ContactFormSubmitResult> {
  const validation = validateContactFormDraft(options.draft, options.t);
  if (!validation.valid) {
    const firstError = Object.values(validation.errors)[0] ?? options.t('common.operationFailed');
    await options.feedback.error(firstError, firstError);
    return {
      ok: false,
      errors: validation.errors,
    };
  }

  const mutation = createMutationContext(options.platform, 'contact-form-submit');
  await options.feedback.toast(options.t('form.submitSuccess'), { kind: 'success' });
  return {
    ok: true,
    errors: {},
    mutation,
  };
}
