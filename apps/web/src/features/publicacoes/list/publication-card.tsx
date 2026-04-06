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
  const href = buildPublicationDetailHref(item.slug);
  const previewImageUrl = item.previewImageUrl?.trim();

  return (
    <article
      style={{
        borderRadius: 20,
        background: '#ffffff',
        border: '1px solid #e4e7ec',
        boxShadow: '0 10px 30px rgba(16, 24, 40, 0.04)',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
      }}
    >
      <Link
        href={href}
        aria-label={`Abrir publicação: ${item.title}`}
        style={{
          display: 'grid',
          gap: '0.9rem',
          padding: '1.25rem',
          color: 'inherit',
          textDecoration: 'none',
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
          {previewImageUrl ? (
            <div
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                border: '1px solid #d0d5dd',
                background: '#f8fafc',
                aspectRatio: '16 / 9',
              }}
            >
              <img
                src={previewImageUrl}
                alt=""
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          ) : null}

          <h3
            style={{
              margin: 0,
              color: '#101828',
              fontSize: '1.12rem',
              lineHeight: 1.28,
            }}
          >
            {item.title}
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
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 40,
              color: '#175cd3',
              fontWeight: 700,
            }}
          >
            Ler publicação
          </span>
        </div>
      </Link>
    </article>
  );
}
