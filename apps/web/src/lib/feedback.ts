import { normalizeError } from '@repo/api/errors';
import type { FeedbackPort } from '@repo/types';

export const webFeedback: FeedbackPort = {
  async toast(message) {
    window.alert(message);
  },

  async confirm(options) {
    const message = options.title ? `${options.title}\n\n${options.message}` : options.message;
    return window.confirm(message);
  },

  async error(error, fallbackMessage) {
    const normalized = normalizeError(error);
    window.alert(normalized.message || fallbackMessage || 'Unknown error');
  },
};
