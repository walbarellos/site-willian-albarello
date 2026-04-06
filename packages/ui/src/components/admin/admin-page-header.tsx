import * as React from 'react';

export type AdminPageHeaderBadge = {
  label: string;
};

export type AdminPageHeaderMeta = {
  label: string;
  value: React.ReactNode;
  tone?: 'default' | 'info' | 'success' | 'warning' | 'danger';
};

export type AdminPageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  eyebrow?: AdminPageHeaderBadge | string;
  meta?: AdminPageHeaderMeta[];
  actions?: React.ReactNode;
  align?: 'left' | 'center';
  titleMaxWidth?: number | string;
};

export function AdminPageHeader({
  title,
  description,
  eyebrow,
  meta,
  actions,
  align = 'left',
  titleMaxWidth = 760,
}: AdminPageHeaderProps) {
  const normalizedEyebrow =
    typeof eyebrow === 'string'
      ? {
          label: eyebrow,
        }
      : eyebrow;

  const resolvedTitleMaxWidth =
    typeof titleMaxWidth === 'number' ? `${titleMaxWidth}px` : titleMaxWidth;

  return (
    <header
      style={{
        display: 'grid',
        gap: '1rem',
        justifyItems: align === 'center' ? 'center' : 'stretch',
        textAlign: align === 'center' ? 'center' : 'left',
      }}
    >
      {normalizedEyebrow ? (
        <span
          style={{
            display: 'inline-flex',
            width: 'fit-content',
            minHeight: 30,
            alignItems: 'center',
            paddingInline: '0.8rem',
            borderRadius: 999,
            background: '#eef4ff',
            color: '#175cd3',
            fontSize: '0.82rem',
            fontWeight: 800,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          {normalizedEyebrow.label}
        </span>
      ) : null}

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'start',
          flexWrap: 'wrap',
          width: '100%',
          ...(align === 'center'
            ? {
                justifyContent: 'center',
              }
            : {}),
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '0.5rem',
            minWidth: 0,
            maxWidth: resolvedTitleMaxWidth,
            justifyItems: align === 'center' ? 'center' : 'start',
          }}
        >
          <h1
            style={{
              margin: 0,
              color: '#101828',
              fontSize: 'clamp(1.9rem, 3vw, 2.7rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
            }}
          >
            {title}
          </h1>

          {description ? (
            <div
              style={{
                margin: 0,
                color: '#475467',
                lineHeight: 1.75,
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
              gap: '0.75rem',
              flexWrap: 'wrap',
              ...(align === 'center'
                ? {
                    justifyContent: 'center',
                  }
                : {}),
            }}
          >
            {actions}
          </div>
        ) : null}
      </div>

      {meta && meta.length > 0 ? (
        <div
          style={{
            display: 'flex',
            gap: '0.85rem',
            flexWrap: 'wrap',
            width: '100%',
            ...(align === 'center'
              ? {
                  justifyContent: 'center',
                }
              : {}),
          }}
        >
          {meta.map((item, index) => {
            const tone = item.tone ?? 'default';
            const palette =
              tone === 'info'
                ? { bg: '#eef4ff', border: '#d5e3ff', label: '#175cd3', value: '#1d4ed8' }
                : tone === 'success'
                  ? { bg: '#ecfdf3', border: '#abefc6', label: '#067647', value: '#067647' }
                  : tone === 'warning'
                    ? { bg: '#fff6ed', border: '#fed7aa', label: '#9a3412', value: '#9a3412' }
                    : tone === 'danger'
                      ? { bg: '#fef3f2', border: '#fecdca', label: '#b42318', value: '#b42318' }
                      : { bg: '#f8fafc', border: '#eaecf0', label: '#667085', value: '#101828' };

            return (
              <div
                key={`${item.label}-${index}`}
                style={{
                  display: 'grid',
                  gap: '0.2rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 18,
                  background: palette.bg,
                  border: `1px solid ${palette.border}`,
                  minWidth: 220,
                }}
              >
                <span
                  style={{
                    color: palette.label,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}
                >
                  {item.label}
                </span>

                <strong
                  style={{
                    color: palette.value,
                    fontSize: '1rem',
                    lineHeight: 1.2,
                  }}
                >
                  {item.value}
                </strong>
              </div>
            );
          })}
        </div>
      ) : null}
    </header>
  );
}
