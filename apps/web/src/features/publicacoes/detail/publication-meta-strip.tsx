import type { CSSProperties } from 'react';

import type { PublicPublicationDetail } from '@william-albarello/contracts';

export type PublicationMetaStripProps = {
  publication: PublicPublicationDetail;
};

function formatDate(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}

export function PublicationMetaStrip({ publication }: PublicationMetaStripProps) {
  const publishedAt = formatDate(publication.publishedAt);
  const updatedAt = formatDate(publication.updatedAt);

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.65rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {publishedAt ? <span style={chipStyle}>{publishedAt}</span> : null}

      {publication.readingTimeMinutes ? (
        <span
          style={{
            ...chipStyle,
            background: '#eef4ff',
            color: '#175cd3',
            border: '1px solid #c7d7fe',
          }}
        >
          {publication.readingTimeMinutes} min de leitura
        </span>
      ) : null}

      {updatedAt && updatedAt !== publishedAt ? (
        <span style={chipStyle}>Atualizado em {updatedAt}</span>
      ) : null}

      {publication.category ? (
        <span
          style={{
            ...chipStyle,
            background: '#ecfdf3',
            color: '#027a48',
            border: '1px solid #abefc6',
          }}
        >
          {publication.category.name}
        </span>
      ) : null}
    </div>
  );
}

const chipStyle: CSSProperties = {
  display: 'inline-flex',
  minHeight: 30,
  alignItems: 'center',
  paddingInline: '0.8rem',
  borderRadius: 999,
  background: '#f2f4f7',
  color: '#475467',
  border: '1px solid #d0d5dd',
  fontSize: '0.84rem',
  fontWeight: 700,
};
