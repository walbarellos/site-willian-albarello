import Link from 'next/link';

import type { HomePublicationSpotlightItem } from './home-publications-spotlight';
import { HomeHero } from './home-hero';
import { HomePublicationsSpotlight } from './home-publications-spotlight';
import { WEB_PUBLIC_ROUTES } from '../../lib/routes';

export type HomePageShellProps = {
  featuredPublications: {
    items: HomePublicationSpotlightItem[];
    failed: boolean;
  };
};

function ThesisSection() {
  return (
    <section
      id="tese-central"
      aria-labelledby="tese-central-title"
      style={{
        paddingTop: '2rem',
        paddingBottom: '1rem',
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
            gap: '1rem',
            marginBottom: '1.5rem',
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
            Tese de posicionamento
          </span>

          <h2
            id="tese-central-title"
            style={{
              margin: 0,
              fontSize: 'clamp(1.75rem, 3vw, 2.6rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#0f172a',
              maxWidth: 780,
            }}
          >
            A presença institucional precisa ser inteligível, confiável e fácil
            de manter.
          </h2>

          <p
            style={{
              margin: 0,
              maxWidth: 820,
              color: '#475467',
              lineHeight: 1.8,
              fontSize: '1rem',
            }}
          >
            O problema central não é apenas “ter um site”. É ter uma estrutura
            pública que comunique com coerência, suporte um fluxo editorial
            estável e reduza improvisação. Quando isso falha, a presença se
            fragmenta. Quando isso é resolvido, o conteúdo passa a trabalhar a
            favor da reputação.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            {
              title: 'Clareza institucional',
              text: 'Mensagem pública organizada para reduzir ruído, ambiguidade e dispersão de percepção.',
            },
            {
              title: 'Consistência editorial',
              text: 'Publicação guiada por critério, estado editorial e responsabilidade sobre o que se torna público.',
            },
            {
              title: 'Descoberta sustentável',
              text: 'Arquitetura técnica e semântica preparada para SEO, leitura humana e evolução contínua.',
            },
          ].map((item) => (
            <article
              key={item.title}
              style={{
                display: 'grid',
                gap: '0.75rem',
                padding: '1.25rem',
                borderRadius: 20,
                background: '#ffffff',
                border: '1px solid #e4e7ec',
                boxShadow: '0 10px 30px rgba(16, 24, 40, 0.04)',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: '#101828',
                  fontSize: '1.1rem',
                  lineHeight: 1.25,
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
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlocksSection() {
  return (
    <section
      aria-labelledby="blocos-centrais-title"
      style={{
        paddingTop: '2rem',
        paddingBottom: '1rem',
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
            gap: '1rem',
            marginBottom: '1.5rem',
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
            Blocos centrais
          </span>

          <h2
            id="blocos-centrais-title"
            style={{
              margin: 0,
              fontSize: 'clamp(1.65rem, 2.6vw, 2.3rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#0f172a',
            }}
          >
            Uma estrutura pública pensada para posicionamento, publicação e
            continuidade.
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            {
              number: '01',
              title: 'Casca institucional',
              text: 'Header, footer, linguagem visual e semântica pública coerentes com a identidade do projeto.',
            },
            {
              number: '02',
              title: 'Publicações',
              text: 'Camada editorial preparada para listar, detalhar e sustentar descoberta orgânica com clareza.',
            },
            {
              number: '03',
              title: 'Governança interna',
              text: 'Painel administrativo e fluxo editorial para separar o que é interno do que já pode se tornar público.',
            },
          ].map((item) => (
            <article
              key={item.number}
              style={{
                display: 'grid',
                gap: '0.75rem',
                padding: '1.4rem',
                borderRadius: 20,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)',
                border: '1px solid #e4e7ec',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  width: 'fit-content',
                  minHeight: 30,
                  alignItems: 'center',
                  paddingInline: '0.75rem',
                  borderRadius: 999,
                  background: '#eef4ff',
                  color: '#175cd3',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                }}
              >
                {item.number}
              </span>

              <h3
                style={{
                  margin: 0,
                  color: '#101828',
                  fontSize: '1.12rem',
                  lineHeight: 1.2,
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
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingSection() {
  return (
    <section
      aria-labelledby="cta-final-title"
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
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            padding: '1.5rem',
            borderRadius: 24,
            background:
              'linear-gradient(135deg, rgba(15,76,255,0.08), rgba(23,92,211,0.03))',
            border: '1px solid rgba(23,92,211,0.14)',
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
            Continuidade pública
          </span>

          <h2
            id="cta-final-title"
            style={{
              margin: 0,
              color: '#0f172a',
              fontSize: 'clamp(1.5rem, 2.2vw, 2rem)',
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              maxWidth: 760,
            }}
          >
            Acompanhe a camada pública do projeto pelas publicações e pela
            evolução progressiva desta estrutura.
          </h2>

          <p
            style={{
              margin: 0,
              color: '#475467',
              lineHeight: 1.8,
              maxWidth: 760,
            }}
          >
            A home organiza o posicionamento. As publicações aprofundam a
            mensagem. A arquitetura editorial garante que o que aparece aqui já
            esteja pronto para ser visto, lido e encontrado.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.9rem',
              paddingTop: '0.25rem',
            }}
          >
            <Link href={WEB_PUBLIC_ROUTES.publications} style={primaryActionStyle}>
              Explorar publicações
            </Link>

            <a href="#home-hero-title" style={secondaryActionStyle}>
              Voltar ao topo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePageShell({ featuredPublications }: HomePageShellProps) {
  return (
    <>
      <HomeHero />
      <ThesisSection />
      <BlocksSection />
      <HomePublicationsSpotlight
        items={featuredPublications.items}
        failed={featuredPublications.failed}
      />
      <ClosingSection />
    </>
  );
}

const primaryActionStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  paddingInline: '1.2rem',
  borderRadius: 14,
  background: '#175cd3',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 700,
};

const secondaryActionStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  paddingInline: '1.2rem',
  borderRadius: 14,
  background: '#ffffff',
  color: '#175cd3',
  textDecoration: 'none',
  fontWeight: 700,
  border: '1px solid #c7d7fe',
};
