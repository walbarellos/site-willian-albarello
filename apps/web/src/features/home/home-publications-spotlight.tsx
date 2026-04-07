import Link from 'next/link';
import { AlertBanner, EmptyState } from '@william-albarello/ui';

import {
  buildPublicationDetailHref,
  WEB_PUBLIC_ROUTES,
} from '../../lib/routes';

export type HomePublicationSpotlightItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  publishedAt?: string;
  readingTimeMinutes?: number;
};

export type HomePublicationsSpotlightProps = {
  items: HomePublicationSpotlightItem[];
  failed: boolean;
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

export function HomePublicationsSpotlight({
  items,
  failed,
}: HomePublicationsSpotlightProps) {
  return (
    <section
      aria-labelledby="publicacoes-destaque-title"
      className="home-spotlight-section"
      style={{
        paddingTop: '2rem',
        paddingBottom: '2rem',
      }}
    >
      <div
        className="home-section-shell"
        style={{
          width: '100%',
          maxWidth: 1120,
          margin: '0 auto',
          paddingInline: '1.25rem',
        }}
      >
        <div
          className="home-spotlight-header"
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'space-between',
            alignItems: 'end',
            flexWrap: 'wrap',
            marginBottom: '1.5rem',
          }}
        >
          <div
            className="home-spotlight-grid"
            style={{
              display: 'grid',
              gap: '0.75rem',
            }}
          >
            <span
              style={{
                color: '#175cd3',
                fontWeight: 700,
                fontSize: '0.84rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Publicações em destaque
            </span>

            <h2
              id="publicacoes-destaque-title"
              style={{
                margin: 0,
                fontSize: 'clamp(1.65rem, 2.6vw, 2.3rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: '#0f172a',
              }}
            >
              Conteúdo público organizado para leitura, continuidade e
              descoberta.
            </h2>
          </div>

          <Link href={WEB_PUBLIC_ROUTES.publications} style={actionLinkStyle}>
            Ver todas
          </Link>
        </div>

        {failed ? (
          <AlertBanner
            tone="warning"
            title="Falha ao carregar destaques"
            action={
              <Link href={WEB_PUBLIC_ROUTES.publications} style={actionLinkStyle}>
                Abrir listagem completa
              </Link>
            }
          >
            Não foi possível carregar as publicações neste momento. A estrutura
            pública continua disponível e a listagem completa pode ser tentada
            novamente em instantes.
          </AlertBanner>
        ) : items.length === 0 ? (
          <EmptyState
            title="Destaques ainda não disponíveis"
            description="As publicações públicas ainda não foram disponibilizadas. Quando o primeiro conteúdo estiver pronto para descoberta, ele aparecerá aqui."
            action={
              <Link href={WEB_PUBLIC_ROUTES.publications} style={actionLinkStyle}>
                Ver área de publicações
              </Link>
            }
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {items.map((item) => {
              const publishedAt = formatDate(item.publishedAt);

              return (
                <article
                  key={item.id}
                  style={{
                    borderRadius: 20,
                    background: '#ffffff',
                    border: '1px solid #e4e7ec',
                    boxShadow: '0 10px 30px rgba(16, 24, 40, 0.04)',
                  }}
                >
                  <Link
                    href={buildPublicationDetailHref(item.slug)}
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
            })}
          </div>
        )}
      </div>
    </section>
  );
}

const actionLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 42,
  paddingInline: '1rem',
  borderRadius: 12,
  textDecoration: 'none',
  color: '#175cd3',
  border: '1px solid #c7d7fe',
  background: '#f8fbff',
  fontWeight: 700,
};
