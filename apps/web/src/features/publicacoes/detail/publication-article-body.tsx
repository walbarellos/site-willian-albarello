import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

import { EmptyState as FeedbackEmptyState } from '@william-albarello/ui';

import type { PublicPublicationDetail } from '@william-albarello/contracts';

import {
  buildPublicationDetailHref,
  WEB_PUBLIC_ROUTES,
} from '../../../lib/routes';
import { PublicationFeaturedMedia } from './publication-featured-media';
import {
  proseHeadingStyle,
  proseListStyle,
  proseParagraphStyle,
  PublicationProse,
} from './publication-prose';

type ContentBlock =
  | { type: 'heading'; value: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; value: string }
  | { type: 'image'; alt: string; src: string; widthPercent: number }
  | { type: 'video'; src: string; widthPercent: number }
  | { type: 'paragraph'; value: string };

export type PublicationArticleBodyProps = {
  publication: PublicPublicationDetail;
};

function normalizeTextContent(content: string): string {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/(!\[[^\]]*]\([^)]+\))/g, '\n$1\n')
    .replace(/(<video\b[\s\S]*?<\/video>)/gi, '\n$1\n')
    .trim();
}

function isSafeMediaUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

function parseWidthPercent(raw?: string): number {
  if (!raw) {
    return 46;
  }

  const match = raw.match(/\bw\s*=\s*(\d{1,3})\b/i);

  if (!match) {
    return 46;
  }

  const value = Number(match[1]);

  if (!Number.isFinite(value)) {
    return 46;
  }

  return Math.min(72, Math.max(22, Math.round(value)));
}

function isWidthTokenLine(value: string): boolean {
  return /^\{w\s*=\s*\d{1,3}\s*}$/.test(value.trim());
}

function parseImageLine(
  line: string,
): { alt: string; src: string; widthPercent: number } | null {
  const match = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)(?:\{([^}]*)\})?$/);

  if (!match) {
    return null;
  }

  const alt = match[1]?.trim() ?? '';
  const src = match[2]?.trim() ?? '';
  const widthPercent = parseWidthPercent(match[3]);

  if (!src || !isSafeMediaUrl(src)) {
    return null;
  }

  return { alt, src, widthPercent };
}

function parseVideoLine(
  line: string,
): { src: string; widthPercent: number } | null {
  const match = line.match(
    /^<video\b[^>]*\bsrc="([^"]+)"[^>]*>\s*<\/video>(?:\{([^}]*)\})?$/i,
  );

  if (!match) {
    return null;
  }

  const src = match[1]?.trim() ?? '';
  const widthPercent = parseWidthPercent(match[2]);

  if (!src || !isSafeMediaUrl(src)) {
    return null;
  }

  return { src, widthPercent };
}

function renderInlineText(value: string): ReactNode {
  const LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gi;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let linkIndex = 0;

  for (const match of value.matchAll(LINK_REGEX)) {
    const full = match[0];
    const label = match[1] ?? '';
    const href = match[2] ?? '';
    const index = match.index ?? -1;

    if (index < 0) {
      continue;
    }

    if (index > lastIndex) {
      parts.push(value.slice(lastIndex, index));
    }

    parts.push(
      <a
        key={`inline-link-${linkIndex}`}
        href={href}
        target="_blank"
        rel="noreferrer"
        style={{
          color: '#175cd3',
          textDecoration: 'underline',
          textUnderlineOffset: '0.2em',
        }}
      >
        {label}
      </a>,
    );

    lastIndex = index + full.length;
    linkIndex += 1;
  }

  if (lastIndex < value.length) {
    parts.push(value.slice(lastIndex));
  }

  return parts.length > 0 ? parts : value;
}

function slugifyHeading(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function parseContentBlocks(content: string): ContentBlock[] {
  const normalized = normalizeTextContent(content);

  if (!normalized) {
    return [];
  }

  const output: ContentBlock[] = [];
  const paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return;
    }

    output.push({
      type: 'paragraph',
      value: paragraphLines.join('\n').trim(),
    });

    paragraphLines.length = 0;
  };

  const blocks = normalized
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 1) {
      const line = lines[0];
      if (!line) {
        continue;
      }

      const imageLine = parseImageLine(line);
      if (imageLine) {
        flushParagraph();
        output.push({
          type: 'image',
          alt: imageLine.alt,
          src: imageLine.src,
          widthPercent: imageLine.widthPercent,
        });
        continue;
      }

      const videoLine = parseVideoLine(line);
      if (videoLine) {
        flushParagraph();
        output.push({
          type: 'video',
          src: videoLine.src,
          widthPercent: videoLine.widthPercent,
        });
        continue;
      }

      if (/^##\s+/.test(line)) {
        flushParagraph();
        output.push({
          type: 'heading',
          value: line.replace(/^##\s+/, '').trim(),
        });
        continue;
      }

      if (/^>\s+/.test(line)) {
        flushParagraph();
        output.push({
          type: 'quote',
          value: line.replace(/^>\s+/, '').trim(),
        });
        continue;
      }
    }

    if (lines.length > 0 && lines.every((line) => /^-\s+/.test(line))) {
      flushParagraph();
      output.push({
        type: 'list',
        items: lines.map((line) => line.replace(/^-\s+/, '').trim()),
      });
      continue;
    }

    for (const line of lines) {
      if (isWidthTokenLine(line)) {
        continue;
      }

      if (/^##\s+/.test(line)) {
        flushParagraph();
        output.push({
          type: 'heading',
          value: line.replace(/^##\s+/, '').trim(),
        });
        continue;
      }

      if (/^>\s+/.test(line)) {
        flushParagraph();
        output.push({
          type: 'quote',
          value: line.replace(/^>\s+/, '').trim(),
        });
        continue;
      }

      const imageLine = parseImageLine(line);
      if (imageLine) {
        flushParagraph();
        output.push({
          type: 'image',
          alt: imageLine.alt,
          src: imageLine.src,
          widthPercent: imageLine.widthPercent,
        });
        continue;
      }

      const videoLine = parseVideoLine(line);
      if (videoLine) {
        flushParagraph();
        output.push({
          type: 'video',
          src: videoLine.src,
          widthPercent: videoLine.widthPercent,
        });
        continue;
      }

      paragraphLines.push(line);
    }
  }

  flushParagraph();
  return output;
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
            justifyContent: 'center',
          }}
        >
          <Link href={WEB_PUBLIC_ROUTES.publications} style={secondaryActionStyle}>
            Ver outras publicações
          </Link>

          <Link
            href={buildPublicationDetailHref(publication.slug)}
            style={secondaryActionStyle}
          >
            Atualizar página
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
  const headings = blocks.filter(
    (block): block is Extract<ContentBlock, { type: 'heading' }> =>
      block.type === 'heading',
  );

  if (blocks.length === 0) {
    return <EmptyContentState publication={publication} />;
  }

  return (
    <article
      aria-labelledby="publication-article-title"
      style={{
        display: 'grid',
        gap: '1.4rem',
        padding: '1.15rem 0.2rem 1.5rem',
        overflow: 'hidden',
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

      {headings.length > 1 ? (
        <nav
          aria-label="Índice de leitura"
          style={{
            width: '100%',
            maxWidth: 740,
            margin: '0 auto',
            padding: '0.85rem 0.95rem',
            border: '1px solid #d9dee7',
            borderRadius: 14,
            background: '#f8fbff',
            display: 'grid',
            gap: '0.6rem',
          }}
        >
          <strong
            style={{
              fontSize: '0.84rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#175cd3',
            }}
          >
            Índice de leitura
          </strong>

          <div
            style={{
              display: 'flex',
              gap: '0.7rem 1rem',
              flexWrap: 'wrap',
            }}
          >
            {headings.map((heading, index) => {
              const id = `secao-${slugifyHeading(heading.value) || index}`;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  style={{
                    color: '#344054',
                    fontSize: '0.92rem',
                    textDecoration: 'none',
                    borderBottom: '1px dashed #98a2b3',
                    paddingBottom: '0.1rem',
                  }}
                >
                  {heading.value}
                </a>
              );
            })}
          </div>
        </nav>
      ) : null}

      <PublicationProse>
        <div
          style={{
            display: 'grid',
            gap: '1.15rem',
          }}
        >
          {blocks.map((block, index) => {
            if (block.type === 'heading') {
              const id = `secao-${slugifyHeading(block.value) || index}`;
              return (
                <h2
                  key={`heading-${index}`}
                  id={id}
                  style={{
                    ...proseHeadingStyle,
                    paddingTop: index === 0 ? 0 : '0.65rem',
                  }}
                >
                  {block.value}
                </h2>
              );
            }

            if (block.type === 'list') {
              return (
                <ul key={`list-${index}`} style={proseListStyle}>
                  {block.items.map((item, itemIndex) => (
                    <li key={`item-${index}-${itemIndex}`}>{renderInlineText(item)}</li>
                  ))}
                </ul>
              );
            }

            if (block.type === 'image') {
              return (
                <PublicationFeaturedMedia
                  key={`image-${index}`}
                  src={block.src}
                  alt={block.alt}
                  widthPercent={block.widthPercent}
                />
              );
            }

            if (block.type === 'video') {
              return (
                <div
                  key={`video-${index}`}
                  style={{
                    width: '100%',
                    display: 'grid',
                    justifyItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: `min(100%, min(${Math.max(block.widthPercent, 36)}vw, 680px))`,
                      borderRadius: 16,
                      overflow: 'hidden',
                      border: '1px solid #d0d5dd',
                      boxShadow: '0 10px 28px rgba(16, 24, 40, 0.08)',
                      background: '#0b1020',
                    }}
                  >
                    <video
                      controls
                      preload="metadata"
                      src={block.src}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </div>
                </div>
              );
            }

            if (block.type === 'quote') {
              return (
                <blockquote
                  key={`quote-${index}`}
                  style={{
                    margin: 0,
                    padding: '0.8rem 1rem',
                    borderLeft: '4px solid #175cd3',
                    background: '#f8fbff',
                    color: '#1f2937',
                    lineHeight: 1.8,
                    borderRadius: '0 12px 12px 0',
                  }}
                >
                  {renderInlineText(block.value)}
                </blockquote>
              );
            }

            return (
              <p key={`paragraph-${index}`} style={proseParagraphStyle}>
                {renderInlineText(block.value)}
              </p>
            );
          })}
        </div>
      </PublicationProse>
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
