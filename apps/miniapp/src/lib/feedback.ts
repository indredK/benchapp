import Taro from '@tarojs/taro';
import { normalizeError } from '@repo/api/errors';
import type { FeedbackPort } from '@repo/types';

export const miniappFeedback: FeedbackPort = {
  async toast(message, options) {
    await Taro.showToast({
      title: message,
      icon: options?.kind === 'success' ? 'success' : 'none',
    });
  },

  async confirm(options) {
    const result = await Taro.showModal({
      title: options.title ?? '',
      content: options.message,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
    });

    return result.confirm;
  },

  async error(error, fallbackMessage) {
    const normalized = normalizeError(error);
    await Taro.showToast({
      title: normalized.message || fallbackMessage || 'Unknown error',
      icon: 'none',
    });
  },
};
