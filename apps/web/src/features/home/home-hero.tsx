import Link from 'next/link';

import { WEB_PUBLIC_ROUTES } from '../../lib/routes';

export function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-title"
      style={{
        paddingTop: '2rem',
        paddingBottom: '2rem',
        background:
          'linear-gradient(180deg, #f8fbff 0%, #eef4ff 58%, #ffffff 100%)',
        borderBottom: '1px solid #e4e7ec',
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
        <div
          style={{
            display: 'grid',
            gap: '2rem',
            gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.9fr)',
            alignItems: 'start',
          }}
        >
          <div
            style={{
              display: 'grid',
              gap: '1.25rem',
              alignContent: 'start',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                width: 'fit-content',
                minHeight: 32,
                alignItems: 'center',
                paddingInline: '0.9rem',
                borderRadius: 999,
                background: '#eef4ff',
                border: '1px solid #c7d7fe',
                color: '#175cd3',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
              }}
            >
              Presença institucional com disciplina pública
            </span>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <h1
                id="home-hero-title"
                style={{
                  margin: 0,
                  color: '#101828',
                  fontSize: 'clamp(2.3rem, 5vw, 4.4rem)',
                  lineHeight: 1.02,
                  letterSpacing: '-0.04em',
                  maxWidth: 780,
                }}
              >
                Clareza estratégica, consistência editorial e arquitetura
                pública orientada à descoberta.
              </h1>

              <p
                style={{
                  margin: 0,
                  maxWidth: 760,
                  color: '#475467',
                  fontSize: '1.08rem',
                  lineHeight: 1.75,
                }}
              >
                Este site existe para sustentar uma presença institucional
                sóbria, legível e confiável. A lógica é simples: organizar a
                mensagem pública, publicar com critério e transformar conteúdo
                em ativo de reputação, descoberta e continuidade.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.9rem',
                paddingTop: '0.25rem',
              }}
            >
              <Link
                href={WEB_PUBLIC_ROUTES.publications}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 48,
                  paddingInline: '1.25rem',
                  borderRadius: 14,
                  background:
                    'linear-gradient(135deg, rgba(15,76,255,1), rgba(37,99,235,0.92))',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 700,
                  boxShadow: '0 12px 28px rgba(15, 76, 255, 0.24)',
                }}
              >
                Ver publicações
              </Link>

              <a
                href="#tese-central"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 48,
                  paddingInline: '1.25rem',
                  borderRadius: 14,
                  background: '#ffffff',
                  color: '#175cd3',
                  textDecoration: 'none',
                  fontWeight: 600,
                  border: '1px solid #c7d7fe',
                }}
              >
                Entender a tese
              </a>
            </div>

            <ul
              aria-label="Pilares centrais"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.85rem',
                margin: '0.5rem 0 0 0',
                padding: 0,
                listStyle: 'none',
              }}
            >
              {[
                'Arquitetura pública disciplinada',
                'Governança editorial explícita',
                'Descoberta orgânica sustentável',
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    minHeight: 56,
                    padding: '0.85rem 1rem',
                    borderRadius: 16,
                    background: '#ffffff',
                    border: '1px solid #e4e7ec',
                    color: '#344054',
                    lineHeight: 1.45,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'inline-flex',
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: '#60a5fa',
                      flexShrink: 0,
                    }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside
            aria-label="Quadro institucional"
            style={{
              display: 'grid',
              gap: '1rem',
              alignContent: 'start',
              alignSelf: 'start',
              height: 'fit-content',
              maxWidth: 420,
              padding: '1.35rem',
              borderRadius: 24,
              background: '#ffffff',
              border: '1px solid #d0d5dd',
              boxShadow: '0 20px 50px rgba(16, 24, 40, 0.08)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  color: '#175cd3',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
              >
                Direção de presença
              </span>
              <h2
                style={{
                  margin: 0,
                  color: '#0f172a',
                  fontSize: '1.35rem',
                  lineHeight: 1.2,
                  letterSpacing: '-0.03em',
                }}
              >
                Menos ruído. Mais legibilidade pública.
              </h2>
            </div>

            <p
              style={{
                margin: 0,
                color: '#475467',
                lineHeight: 1.75,
                fontSize: '0.98rem',
              }}
            >
              A proposta não é inflar presença com excesso visual. É construir
              autoridade com coerência entre estrutura, mensagem, publicação e
              manutenção contínua.
            </p>

            <dl
              style={{
                display: 'grid',
                gap: '0.85rem',
                margin: 0,
              }}
            >
              {[
                ['Posicionamento', 'Institucional, claro e auditável'],
                ['Publicação', 'Somente o que está pronto para ser público'],
                ['Escala', 'Estrutura preparada para crescer sem ruído'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: 'grid',
                    gap: '0.2rem',
                    paddingBottom: '0.85rem',
                    borderBottom: '1px solid rgba(148,163,184,0.12)',
                  }}
                >
                  <dt
                  style={{
                      color: '#667085',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {label}
                  </dt>
                  <dd
                    style={{
                      margin: 0,
                      color: '#101828',
                      fontSize: '0.96rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}
