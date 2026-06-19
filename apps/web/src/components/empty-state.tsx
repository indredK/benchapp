import { useT } from '../lib/i18n';

export type EmptyStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, onRetry, actionLabel, onAction }: EmptyStateProps) {
  const t = useT();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      gap: '16px',
      minHeight: 200,
      textAlign: 'center',
    }}>
      <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
        {title ?? t('common.noData')}
      </p>
      {description ? (
        <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)', maxWidth: 320 }}>
          {description}
        </p>
      ) : null}
      {onRetry ? (
        <button
          className="btn btn--secondary"
          onClick={onRetry}
          style={{ marginTop: 8 }}>
          {t('common.retry')}
        </button>
      ) : null}
      {onAction && actionLabel ? (
        <button
          className="btn btn--primary"
          onClick={onAction}
          style={{ marginTop: 8 }}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
