import type { CSSProperties } from 'react';

import type { PublicPublicationDetail } from '@william-albarello/contracts';

import { PublicationBreadcrumbs } from './publication-breadcrumbs';

export type PublicationArticleHeaderProps = {
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

export function PublicationArticleHeader({
  publication,
}: PublicationArticleHeaderProps) {
  const publishedAt = formatDate(publication.publishedAt);
  const updatedAt = formatDate(publication.updatedAt);

  return (
    <header
      style={{
        display: 'grid',
        gap: '1rem',
        padding: '1.5rem',
        borderRadius: 24,
        background:
          'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)',
        border: '1px solid #e4e7ec',
        boxShadow: '0 12px 32px rgba(16, 24, 40, 0.05)',
      }}
    >
      <PublicationBreadcrumbs title={publication.title} />

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
      </div>

      <div
        style={{
          display: 'grid',
          gap: '0.85rem',
        }}
      >
        <h1
          style={{
            margin: 0,
            color: '#0f172a',
            fontSize: 'clamp(2rem, 4vw, 3.4rem)',
            lineHeight: 1.04,
            letterSpacing: '-0.04em',
            maxWidth: 860,
          }}
        >
          {publication.title}
        </h1>

        <p
          style={{
            margin: 0,
            color: '#475467',
            fontSize: '1.04rem',
            lineHeight: 1.8,
            maxWidth: 840,
          }}
        >
          {publication.summary}
        </p>
      </div>
    </header>
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
