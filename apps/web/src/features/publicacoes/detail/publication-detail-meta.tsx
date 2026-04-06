import type { CSSProperties } from 'react';

import type { PublicPublicationDetail } from '@william-albarello/contracts';

export type PublicationDetailMetaProps = {
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

export function PublicationDetailMeta({ publication }: PublicationDetailMetaProps) {
  const publishedAt = formatDate(publication.publishedAt);
  const updatedAt = formatDate(publication.updatedAt);
  const hasTags = publication.tags.length > 0;

  return (
    <section
      aria-label="Metadados da publicação"
      style={{
        display: 'grid',
        gap: '0.7rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.7rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {publishedAt ? <span style={metaBadgeStyle}>{publishedAt}</span> : null}

        {publication.readingTimeMinutes ? (
          <span
            style={{
              ...metaBadgeStyle,
              background: '#eef4ff',
              color: '#175cd3',
              border: '1px solid #c7d7fe',
            }}
          >
            {publication.readingTimeMinutes} min de leitura
          </span>
        ) : null}

        {updatedAt && updatedAt !== publishedAt ? (
          <span
            style={{
              ...metaBadgeStyle,
              background: '#f8fafc',
              color: '#475467',
              border: '1px solid #d0d5dd',
            }}
          >
            Atualizado em {updatedAt}
          </span>
        ) : null}

        {publication.category ? (
          <span
            style={{
              ...metaBadgeStyle,
              background: '#ecfdf3',
              color: '#027a48',
              border: '1px solid #abefc6',
            }}
          >
            {publication.category.name}
          </span>
        ) : null}
      </div>

      {hasTags ? (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          {publication.tags.map((tag) => (
            <span
              key={tag.id}
              style={{
                display: 'inline-flex',
                minHeight: 26,
                alignItems: 'center',
                paddingInline: '0.65rem',
                borderRadius: 999,
                background: '#f4f3ff',
                color: '#5925dc',
                border: '1px solid #d9d6fe',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

const metaBadgeStyle: CSSProperties = {
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
