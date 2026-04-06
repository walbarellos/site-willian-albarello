import * as React from 'react';

export type AdminSupportBlockProps = {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  compact?: boolean;
  role?: 'note' | 'status' | 'alert';
};

const toneMap = {
    neutral: {
        background: '#ffffff',
        border: '1px solid #e4e7ec',
        title: '#101828',
        body: '#475467',
    },
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
} as const;

export function AdminSupportBlock({
  title,
  subtitle,
  children,
  tone = 'neutral',
  compact = false,
  role = 'note',
}: AdminSupportBlockProps) {
  const palette = toneMap[tone];
  const padding = compact ? '0.8rem 0.9rem' : '1rem 1.1rem';
  const bodyFontSize = compact ? '0.9rem' : '0.94rem';

  return (
    <aside
      role={role}
      style={{
        display: 'grid',
        gap: '0.65rem',
        padding,
        borderRadius: 18,
        background: palette.background,
        border: palette.border,
      }}
    >
      <header
        style={{
          display: 'grid',
          gap: '0.3rem',
        }}
      >
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

      <div
        style={{
          color: palette.body,
          lineHeight: 1.7,
          fontSize: bodyFontSize,
        }}
      >
        {children}
      </div>
    </aside>
  );
}
