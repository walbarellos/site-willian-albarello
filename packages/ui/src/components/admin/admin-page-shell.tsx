import * as React from 'react';

export type AdminPageShellProps = {
  children: React.ReactNode;
  maxWidth?: number | string;
  padding?: string;
  contentGap?: string;
  align?: 'left' | 'center';
};

export function AdminPageShell({
  children,
  maxWidth = 1280,
  padding = '1.25rem 1rem 2rem',
  contentGap = '1.25rem',
  align = 'left',
}: AdminPageShellProps) {
  const resolvedMaxWidth =
    typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;

  return (
    <section
      style={{
        width: '100%',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: resolvedMaxWidth,
          margin: '0 auto',
          padding,
          display: 'grid',
          gap: contentGap,
          justifyItems: align === 'center' ? 'center' : 'stretch',
          alignContent: 'start',
        }}
      >
        {children}
      </div>
    </section>
  );
}
