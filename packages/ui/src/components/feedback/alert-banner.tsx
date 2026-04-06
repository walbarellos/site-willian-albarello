import * as React from 'react';

export type AlertBannerTone =
| 'info'
| 'success'
| 'warning'
| 'danger'
| 'neutral';

export type AlertBannerProps = {
  title?: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  tone?: AlertBannerTone;
  action?: React.ReactNode;
  compact?: boolean;
  role?: 'alert' | 'status';
};

const toneMap: Record<
AlertBannerTone,
{
    background: string;
    border: string;
    title: string;
    body: string;
}
> = {
    info: {
        background: '#f8fbff',
        border: '1px solid #d5e3ff',
        title: '#175cd3',
        body: '#1d4ed8',
    },
    success: {
        background: '#ecfdf3',
        border: '1px solid #abefc6',
        title: '#067647',
        body: '#067647',
    },
    warning: {
        background: '#fff6ed',
        border: '1px solid #fed7aa',
        title: '#9a3412',
        body: '#9a3412',
    },
    danger: {
        background: '#fef3f2',
        border: '1px solid #fecdca',
        title: '#b42318',
        body: '#b42318',
    },
    neutral: {
        background: '#ffffff',
        border: '1px solid #e4e7ec',
        title: '#101828',
        body: '#475467',
    },
};

export function AlertBanner({
  title,
  subtitle,
  children,
  tone = 'neutral',
  action,
  compact = false,
  role,
}: AlertBannerProps) {
  const palette = toneMap[tone];
  const isAssertive = tone === 'danger' || tone === 'warning';
  const resolvedRole = role ?? (isAssertive ? 'alert' : 'status');
  const padding = compact ? '0.8rem 0.9rem' : '1rem 1.1rem';
  const bodyFontSize = compact ? '0.9rem' : '0.94rem';

  return (
    <div
      role={resolvedRole}
      aria-live={resolvedRole === 'alert' ? 'assertive' : 'polite'}
      style={{
        display: 'grid',
        gap: '0.7rem',
        padding,
        borderRadius: 18,
        background: palette.background,
        border: palette.border,
      }}
    >
      {title || subtitle ? (
        <header
          style={{
            display: 'grid',
            gap: '0.3rem',
          }}
        >
          {title ? (
            <h2
              style={{
                margin: 0,
                color: palette.title,
                fontSize: compact ? '0.95rem' : '1rem',
                lineHeight: 1.2,
              }}
            >
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <div
              style={{
                color: palette.body,
                lineHeight: 1.45,
                fontSize: '0.85rem',
                opacity: 0.9,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </header>
      ) : null}

      <div
        style={{
          color: palette.body,
          lineHeight: 1.65,
          fontSize: bodyFontSize,
        }}
      >
        {children}
      </div>

      {action ? (
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          {action}
        </div>
      ) : null}
    </div>
  );
}
