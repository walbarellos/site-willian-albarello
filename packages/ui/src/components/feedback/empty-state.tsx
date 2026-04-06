import * as React from 'react';

export type EmptyStateProps = {
  title: string;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: 'neutral' | 'info';
  align?: 'left' | 'center';
  compact?: boolean;
};

export function EmptyState({
  title,
  subtitle,
  description,
  action,
  icon,
  tone = 'neutral',
  align = 'left',
  compact = false,
}: EmptyStateProps) {
  const palette =
    tone === 'info'
      ? {
          background: '#f8fbff',
          border: '1px solid #d5e3ff',
          title: '#175cd3',
          body: '#1d4ed8',
          subtitle: '#175cd3',
        }
      : {
          background: '#ffffff',
          border: '1px solid #e4e7ec',
          title: '#101828',
          body: '#475467',
          subtitle: '#667085',
        };

  return (
    <section
      role="status"
      style={{
        display: 'grid',
        gap: compact ? '0.7rem' : '0.85rem',
        padding: compact ? '1rem' : '1.25rem',
        borderRadius: 24,
        background: palette.background,
        border: palette.border,
        boxShadow: '0 12px 32px rgba(16, 24, 40, 0.04)',
        textAlign: align === 'center' ? 'center' : 'left',
        justifyItems: align === 'center' ? 'center' : 'stretch',
      }}
    >
      {icon ? (
        <div
          aria-hidden="true"
          style={{
            color: palette.subtitle,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gap: '0.35rem',
        }}
      >
        <h2
          style={{
            margin: 0,
            color: palette.title,
            fontSize: compact ? '1rem' : '1.05rem',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h2>

        {subtitle ? (
          <div
            style={{
              color: palette.subtitle,
              lineHeight: 1.5,
              fontSize: '0.86rem',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              fontWeight: 700,
            }}
          >
            {subtitle}
          </div>
        ) : null}

        {description ? (
          <div
            style={{
              color: palette.body,
              lineHeight: 1.7,
              fontSize: compact ? '0.9rem' : '0.94rem',
            }}
          >
            {description}
          </div>
        ) : null}
      </div>

      {action ? (
        <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: align === 'center' ? 'center' : 'flex-start',
            }}
        >
          {action}
        </div>
      ) : null}
    </section>
  );
}
