import { Alert } from 'react-native';
import { normalizeError } from '@repo/api/errors';
import type { FeedbackPort } from '@repo/types';

export const mobileFeedback: FeedbackPort = {
  async toast(message) {
    Alert.alert('', message);
  },

  async confirm(options) {
    return new Promise<boolean>((resolve) => {
      Alert.alert(options.title ?? '', options.message, [
        {
          text: options.cancelText ?? 'Cancel',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: options.confirmText ?? 'OK',
          style: options.destructive ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ]);
    });
  },

  async error(error, fallbackMessage) {
    const normalized = normalizeError(error);
    Alert.alert('', normalized.message || fallbackMessage || 'Unknown error');
  },
};
