import type { PublicPublicationDetail } from '@william-albarello/contracts';

import { PublicationBreadcrumbs } from './publication-breadcrumbs';
import { PublicationMetaStrip } from './publication-meta-strip';

export type PublicationReadingHeroProps = {
  publication: PublicPublicationDetail;
};

function normalizeSummary(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function PublicationReadingHero({ publication }: PublicationReadingHeroProps) {
  const summary = normalizeSummary(publication.summary);
  const showSummary = summary.length >= 24 && summary.toLowerCase() !== 'ok';

  return (
    <header
      style={{
        padding: '1.4rem 1.2rem 1.1rem',
        borderRadius: 16,
        borderBottom: '1px solid #d9dee7',
        background:
          'radial-gradient(circle at top left, rgba(23, 92, 211, 0.07) 0%, rgba(255,255,255,0) 44%), linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(249,251,255,0.95) 100%)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '0.9rem',
          width: '100%',
          maxWidth: 760,
          margin: '0 auto',
        }}
      >
        <PublicationBreadcrumbs title={publication.title} />
        <PublicationMetaStrip publication={publication} />

        <h1
          style={{
            margin: 0,
            color: '#0f172a',
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            lineHeight: 1.04,
            letterSpacing: '-0.04em',
            width: '100%',
            maxWidth: 760,
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            textAlign: 'center',
          }}
        >
          {publication.title}
        </h1>

        {showSummary ? (
          <p
            style={{
              margin: 0,
              color: '#475467',
              fontSize: '1.04rem',
              lineHeight: 1.75,
              maxWidth: 760,
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
              textAlign: 'center',
            }}
          >
            {summary}
          </p>
        ) : null}
      </div>
    </header>
  );
}
