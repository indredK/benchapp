import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from './themed-text';
import { useT } from '@/lib/i18n-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export type EmptyStateProps = {
  title?: string;
  description?: string;
  /** Show retry button */
  onRetry?: () => void;
  /** Custom action button label */
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, onRetry, actionLabel, onAction }: EmptyStateProps) {
  const t = useT();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" themeColor="textSecondary">
        {title ?? t('common.noData')}
      </ThemedText>
      {description ? (
        <ThemedText type="small" themeColor="textTertiary" style={styles.desc}>
          {description}
        </ThemedText>
      ) : null}
      {onRetry ? (
        <TouchableOpacity
          style={[styles.btn, { borderColor: theme.brand }]}
          onPress={onRetry}>
          <ThemedText type="small" themeColor="textLink">
            {t('common.retry')}
          </ThemedText>
        </TouchableOpacity>
      ) : null}
      {onAction && actionLabel ? (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.brand }]}
          onPress={onAction}>
          <ThemedText type="small" style={{ color: theme.white }}>
            {actionLabel}
          </ThemedText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
    minHeight: 200,
  },
  desc: { textAlign: 'center' },
  btn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.sm,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
});
