import * as React from 'react';

export type AdminSectionCardProps = {
  children: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  gap?: string;
  padding?: string;
  radius?: number;
  background?: string;
  border?: string;
  shadow?: string;
};

export function AdminSectionCard({
  children,
  title,
  description,
  actions,
  footer,
  gap = '1rem',
  padding = '1.25rem',
  radius = 24,
  background = '#ffffff',
  border = '1px solid #e4e7ec',
  shadow = '0 12px 32px rgba(16, 24, 40, 0.04)',
}: AdminSectionCardProps) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <section
      style={{
        display: 'grid',
        gap,
        padding,
        borderRadius: radius,
        background,
        border,
        boxShadow: shadow,
      }}
    >
      {hasHeader ? (
        <header
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'space-between',
            alignItems: 'start',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'grid',
              gap: '0.45rem',
              minWidth: 0,
            }}
          >
            {title ? (
              <h2
                style={{
                  margin: 0,
                  color: '#101828',
                  fontSize: '1.12rem',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </h2>
            ) : null}
            {description ? (
              <div
                style={{
                  margin: 0,
                  color: '#667085',
                  lineHeight: 1.6,
                  fontSize: '0.95rem',
                }}
              >
                {description}
              </div>
            ) : null}
          </div>

          {actions ? (
            <div
              style={{
                display: 'flex',
                gap: '0.65rem',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {actions}
            </div>
          ) : null}
        </header>
      ) : null}

      <div
        style={{
          display: 'grid',
          gap: '0.9rem',
        }}
      >
        {children}
      </div>

      {footer ? (
        <footer
          style={{
            borderTop: '1px solid #eaecf0',
            paddingTop: '0.95rem',
          }}
        >
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
