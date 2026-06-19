import { View, Text } from '@tarojs/components';
import { useI18n } from '@/hooks/use-i18n';
import './index.scss';

export type EmptyStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, onRetry, actionLabel, onAction }: EmptyStateProps) {
  const { t } = useI18n();

  return (
    <View className="empty-state">
      <Text className="empty-state__title">{title ?? t('common.noData')}</Text>
      {description ? <Text className="empty-state__desc">{description}</Text> : null}
      {onRetry ? (
        <View className="empty-state__btn empty-state__btn--retry" onClick={onRetry}>
          <Text className="empty-state__btn-text">{t('common.retry')}</Text>
        </View>
      ) : null}
      {onAction && actionLabel ? (
        <View className="empty-state__btn empty-state__btn--action" onClick={onAction}>
          <Text className="empty-state__btn-text empty-state__btn-text--action">{actionLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}
