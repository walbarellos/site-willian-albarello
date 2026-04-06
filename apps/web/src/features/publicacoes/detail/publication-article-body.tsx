import Link from 'next/link';
import type { CSSProperties } from 'react';

import { EmptyState as FeedbackEmptyState } from '@william-albarello/ui';

import type { PublicPublicationDetail } from '@william-albarello/contracts';

import {
  buildPublicationDetailHref,
  WEB_PUBLIC_ROUTES,
} from '../../../lib/routes';

type ContentBlock =
  | { type: 'heading'; value: string }
  | { type: 'list'; items: string[] }
  | { type: 'paragraph'; value: string };

export type PublicationArticleBodyProps = {
  publication: PublicPublicationDetail;
};

function normalizeTextContent(content: string): string {
  return content.replace(/\r\n/g, '\n').trim();
}

function parseContentBlocks(content: string): ContentBlock[] {
  const normalized = normalizeTextContent(content);

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block): ContentBlock => {
      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const firstLine = lines[0];

      if (lines.length === 1 && firstLine && /^##\s+/.test(firstLine)) {
        return {
          type: 'heading',
          value: firstLine.replace(/^##\s+/, '').trim(),
        };
      }

      if (lines.length > 0 && lines.every((line) => /^-\s+/.test(line))) {
        return {
          type: 'list',
          items: lines.map((line) => line.replace(/^-\s+/, '').trim()),
        };
      }

      return {
        type: 'paragraph',
        value: lines.join(' '),
      };
    });
}

function EmptyContentState({
  publication,
}: Readonly<{
  publication: PublicPublicationDetail;
}>) {
  return (
    <FeedbackEmptyState
      title="Conteúdo ainda não disponível"
      description="Esta publicação já está visível na camada pública, mas o corpo textual ainda não foi disponibilizado para leitura."
      action={
        <div
          style={{
            display: 'flex',
            gap: '0.85rem',
            flexWrap: 'wrap',
          }}
        >
          <Link href={WEB_PUBLIC_ROUTES.publications} style={secondaryActionStyle}>
            Ver outras publicações
          </Link>

          <Link
            href={buildPublicationDetailHref(publication.slug)}
            style={secondaryActionStyle}
          >
            Atualizar esta página
          </Link>
        </div>
      }
    />
  );
}

export function PublicationArticleBody({
  publication,
}: PublicationArticleBodyProps) {
  const blocks = parseContentBlocks(publication.content);

  if (blocks.length === 0) {
    return <EmptyContentState publication={publication} />;
  }

  return (
    <article
      aria-labelledby="publication-article-title"
      style={{
        display: 'grid',
        gap: '1.5rem',
        padding: '1.5rem',
        borderRadius: 24,
        background: '#ffffff',
        border: '1px solid #e4e7ec',
        boxShadow: '0 12px 32px rgba(16, 24, 40, 0.04)',
      }}
    >
      <div
        id="publication-article-title"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
        }}
      >
        Conteúdo da publicação
      </div>

      <div
        style={{
          display: 'grid',
          gap: '1.1rem',
        }}
      >
        {blocks.map((block, index) => {
          if (block.type === 'heading') {
            return (
              <h2
                key={`heading-${index}`}
                style={{
                  margin: 0,
                  color: '#101828',
                  fontSize: '1.45rem',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  paddingTop: index === 0 ? 0 : '0.4rem',
                }}
              >
                {block.value}
              </h2>
            );
          }

          if (block.type === 'list') {
            return (
              <ul
                key={`list-${index}`}
                style={{
                  margin: 0,
                  paddingLeft: '1.25rem',
                  color: '#344054',
                  lineHeight: 1.85,
                  display: 'grid',
                  gap: '0.45rem',
                }}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={`item-${index}-${itemIndex}`}>{item}</li>
                ))}
              </ul>
            );
          }

          return (
            <p
              key={`paragraph-${index}`}
              style={{
                margin: 0,
                color: '#344054',
                fontSize: '1rem',
                lineHeight: 1.9,
              }}
            >
              {block.value}
            </p>
          );
        })}
      </div>
    </article>
  );
}

const secondaryActionStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 46,
  paddingInline: '1rem',
  borderRadius: 14,
  background: '#ffffff',
  color: '#344054',
  textDecoration: 'none',
  fontWeight: 700,
  border: '1px solid #d0d5dd',
};
