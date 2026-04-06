import type { CSSProperties, ReactNode } from 'react';

export type PublicationProseProps = {
  children: ReactNode;
};

export function PublicationProse({ children }: PublicationProseProps) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 740,
        marginInline: 'auto',
        color: '#1f2937',
        fontSize: '1.07rem',
        lineHeight: 1.92,
      }}
    >
      {children}
    </div>
  );
}

export const proseHeadingStyle: CSSProperties = {
  margin: 0,
  color: '#0f172a',
  fontSize: '1.58rem',
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
};

export const proseParagraphStyle: CSSProperties = {
  margin: 0,
  color: '#253041',
  fontSize: '1.07rem',
  lineHeight: 1.95,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
};

export const proseListStyle: CSSProperties = {
  margin: 0,
  paddingLeft: '1.5rem',
  color: '#253041',
  lineHeight: 1.9,
  display: 'grid',
  gap: '0.5rem',
};
