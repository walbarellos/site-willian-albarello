// apps/web/app/layout.tsx

import type { Metadata, Viewport } from 'next';
import type { ReactNode, CSSProperties } from 'react';

const SITE_NAME = 'William Albarello';
const SITE_TITLE = 'William Albarello';
const SITE_DESCRIPTION =
  'Presença institucional com clareza estratégica, consistência editorial e arquitetura pública orientada à descoberta.';
const SITE_LOCALE = 'pt_BR';
const DEFAULT_SITE_URL = 'http://localhost:3000';

function resolveSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;

  try {
    return new URL(raw);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

const siteUrl = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: SITE_NAME,
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: SITE_LOCALE,
    url: siteUrl.toString(),
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: '#0b1020',
  colorScheme: 'light',
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

function ShellContainer({
  children,
  style,
}: Readonly<{
  children: ReactNode;
  style?: CSSProperties;
}>) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1120,
        margin: '0 auto',
        paddingInline: '1.25rem',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PublicHeader() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(14px)',
        background:
          'color-mix(in srgb, rgba(11,16,32,0.92) 88%, transparent 12%)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
      }}
    >
      <ShellContainer
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          minHeight: 72,
        }}
      >
        <a
          href="/"
          aria-label="Página inicial"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: '#f8fafc',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              background:
                'linear-gradient(135deg, rgba(15,76,255,0.95), rgba(59,130,246,0.78))',
              boxShadow: '0 10px 30px rgba(15, 76, 255, 0.28)',
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}
          >
            WA
          </span>

          <span
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              lineHeight: 1.15,
            }}
          >
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              William Albarello
            </span>
            <span
              style={{
                fontSize: '0.78rem',
                color: 'rgba(226,232,240,0.74)',
              }}
            >
              presença institucional
            </span>
          </span>
        </a>

        <nav aria-label="Navegação principal">
          <ul
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              margin: 0,
              padding: 0,
              listStyle: 'none',
              flexWrap: 'wrap',
            }}
          >
            <li>
              <a href="/" style={navLinkStyle}>
                Início
              </a>
            </li>
            <li>
              <a href="/publicacoes" style={navLinkStyle}>
                Publicações
              </a>
            </li>
          </ul>
        </nav>
      </ShellContainer>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(148, 163, 184, 0.18)',
        background:
          'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)',
      }}
    >
      <ShellContainer
        style={{
          paddingTop: '2rem',
          paddingBottom: '2rem',
          display: 'grid',
          gap: '1rem',
          justifyItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '0.5rem',
            justifyItems: 'center',
          }}
        >
          <strong
            style={{
              fontSize: '1rem',
              color: '#0f172a',
            }}
          >
            {SITE_NAME}
          </strong>

          <p
            style={{
              margin: 0,
              maxWidth: 720,
              color: '#475467',
              lineHeight: 1.7,
              fontSize: '0.95rem',
            }}
          >
            Estrutura pública pensada para clareza institucional, consistência
            editorial e descoberta orgânica responsável.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '1rem',
            justifyItems: 'center',
            color: '#667085',
            fontSize: '0.9rem',
          }}
        >
          <span>© {new Date().getFullYear()} {SITE_NAME}. Todos os direitos reservados.</span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <a href="/" style={footerLinkStyle}>
              Início
            </a>
            <a href="/publicacoes" style={footerLinkStyle}>
              Publicações
            </a>
          </div>
        </div>
      </ShellContainer>
    </footer>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background:
            'linear-gradient(180deg, #0b1020 0%, #11172a 12%, #f8fafc 12%, #f8fafc 100%)',
          color: '#111827',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        <a
          href="#conteudo-principal"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 'auto',
            width: 1,
            height: 1,
            overflow: 'hidden',
          }}
        >
          Pular para o conteúdo principal
        </a>

        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
          }}
        >
          <PublicHeader />

          <main
            id="conteudo-principal"
            style={{
              width: '100%',
              paddingTop: '2rem',
              paddingBottom: '4rem',
            }}
          >
            {children}
          </main>

          <PublicFooter />
        </div>
      </body>
    </html>
  );
}

const navLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 40,
  paddingInline: '0.75rem',
  textDecoration: 'none',
  color: 'rgba(241,245,249,0.92)',
  fontSize: '0.95rem',
  fontWeight: 500,
  borderRadius: 10,
};

const footerLinkStyle: CSSProperties = {
  color: '#475467',
  textDecoration: 'none',
  fontWeight: 500,
};
