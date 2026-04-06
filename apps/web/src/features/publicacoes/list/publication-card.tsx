import Link from 'next/link';

import type { PublicPublicationListItem } from '@william-albarello/contracts';

import { buildPublicationDetailHref } from '../../../lib/routes';

export type PublicationCardProps = {
  item: PublicPublicationListItem;
};

function formatDate(date?: string): string | null {
  if (!date) {
    return null;
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}

export function PublicationCard({ item }: PublicationCardProps) {
  const publishedAt = formatDate(item.publishedAt);

  return (
    <article
      style={{
        display: 'grid',
        gap: '0.9rem',
        padding: '1.25rem',
        borderRadius: 20,
        background: '#ffffff',
        border: '1px solid #e4e7ec',
        boxShadow: '0 10px 30px rgba(16, 24, 40, 0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.65rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {publishedAt ? (
          <span
            style={{
              display: 'inline-flex',
              minHeight: 28,
              alignItems: 'center',
              paddingInline: '0.7rem',
              borderRadius: 999,
              background: '#f2f4f7',
              color: '#475467',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            {publishedAt}
          </span>
        ) : null}

        {item.readingTimeMinutes ? (
          <span
            style={{
              display: 'inline-flex',
              minHeight: 28,
              alignItems: 'center',
              paddingInline: '0.7rem',
              borderRadius: 999,
              background: '#eef4ff',
              color: '#175cd3',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            {item.readingTimeMinutes} min
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: 'grid',
          gap: '0.65rem',
        }}
      >
        <h3
          style={{
            margin: 0,
            color: '#101828',
            fontSize: '1.12rem',
            lineHeight: 1.28,
          }}
        >
          <Link
            href={buildPublicationDetailHref(item.slug)}
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {item.title}
          </Link>
        </h3>

        <p
          style={{
            margin: 0,
            color: '#475467',
            lineHeight: 1.75,
          }}
        >
          {item.summary}
        </p>
      </div>

      <div>
        <Link
          href={buildPublicationDetailHref(item.slug)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 40,
            color: '#175cd3',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          Ler publicação
        </Link>
      </div>
    </article>
  );
}
