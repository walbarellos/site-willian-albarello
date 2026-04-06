import type { CSSProperties } from 'react';

export type PublicationsListHeroProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

const DEFAULT_EYEBROW = 'Camada publica editorial';
const DEFAULT_TITLE =
  'Publicacoes organizadas para leitura, descoberta e continuidade.';
const DEFAULT_DESCRIPTION =
  'Esta pagina concentra a producao publica que ja passou pelo fluxo editorial e esta pronta para ser encontrada, lida e utilizada como extensao coerente da presenca institucional.';

export function PublicationsListHero({
  eyebrow = DEFAULT_EYEBROW,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}: PublicationsListHeroProps) {
  return (
    <section
      aria-labelledby="publicacoes-title"
      style={{
        paddingTop: '1rem',
        paddingBottom: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1120,
          margin: '0 auto',
          paddingInline: '1.25rem',
        }}
      >
        <div style={heroCardStyle}>
          <div
            style={{
              display: 'grid',
              gap: '0.75rem',
            }}
          >
            <span style={eyebrowStyle}>{eyebrow}</span>

            <h1 id="publicacoes-title" style={titleStyle}>
              {title}
            </h1>

            <p style={descriptionStyle}>{description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const heroCardStyle: CSSProperties = {
  display: 'grid',
  gap: '1.25rem',
  padding: '1.5rem',
  borderRadius: 24,
  background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)',
  border: '1px solid #e4e7ec',
  boxShadow: '0 12px 32px rgba(16, 24, 40, 0.04)',
};

const eyebrowStyle: CSSProperties = {
  color: '#175cd3',
  fontWeight: 700,
  fontSize: '0.84rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const titleStyle: CSSProperties = {
  margin: 0,
  color: '#0f172a',
  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
  lineHeight: 1.05,
  letterSpacing: '-0.04em',
  maxWidth: 780,
};

const descriptionStyle: CSSProperties = {
  margin: 0,
  maxWidth: 820,
  color: '#475467',
  fontSize: '1rem',
  lineHeight: 1.8,
};
