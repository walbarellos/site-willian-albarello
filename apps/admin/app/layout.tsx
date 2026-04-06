// apps/admin/app/layout.tsx

import Link from 'next/link';
import type { Metadata, Viewport } from 'next';
import type { CSSProperties, ReactNode } from 'react';

const ADMIN_NAME = 'William Albarello — Painel';
const ADMIN_DESCRIPTION =
  'Área administrativa interna para operação editorial, organização de publicações e continuidade do fluxo interno.';
const DEFAULT_ADMIN_URL = 'http://localhost:3001';

function resolveAdminUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_ADMIN_URL?.trim() || DEFAULT_ADMIN_URL;

  try {
    return new URL(raw);
  } catch {
    return new URL(DEFAULT_ADMIN_URL);
  }
}

const adminUrl = resolveAdminUrl();

export const metadata: Metadata = {
  metadataBase: adminUrl,
  title: {
    default: ADMIN_NAME,
    template: `%s | ${ADMIN_NAME}`,
  },
  description: ADMIN_DESCRIPTION,
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#0b1020',
  colorScheme: 'dark',
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

type AdminNavItem = {
  href: string;
  label: string;
  description: string;
};

const adminNavItems: AdminNavItem[] = [
  {
    href: '/',
    label: 'Entrada',
    description: 'Ponto inicial do painel administrativo.',
  },
  {
    href: '/painel/login',
    label: 'Login',
    description: 'Autenticação administrativa.',
  },
  {
    href: '/painel/publicacoes',
    label: 'Publicações',
    description: 'Operação editorial e gestão de conteúdo.',
  },
];

function AdminBrand() {
  return (
    <div
      style={{
        display: 'grid',
        gap: '0.65rem',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.85rem',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            width: 42,
            height: 42,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
            background:
              'linear-gradient(135deg, rgba(15,76,255,0.95), rgba(59,130,246,0.80))',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.95rem',
            letterSpacing: '0.04em',
            boxShadow: '0 14px 30px rgba(15, 76, 255, 0.24)',
          }}
        >
          WA
        </span>

        <div
          style={{
            display: 'grid',
            gap: '0.1rem',
          }}
        >
          <strong
            style={{
              color: '#f8fafc',
              fontSize: '1rem',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            William Albarello
          </strong>

          <span
            style={{
              color: '#94a3b8',
              fontSize: '0.84rem',
              lineHeight: 1.3,
            }}
          >
            painel administrativo
          </span>
        </div>
      </div>

      <p
        style={{
          margin: 0,
          color: '#94a3b8',
          fontSize: '0.92rem',
          lineHeight: 1.65,
          maxWidth: 300,
        }}
      >
        Casca interna voltada à operação editorial, sem expor regras de
        autorização na interface.
      </p>
    </div>
  );
}

function AdminSidebar() {
  return (
    <aside
      aria-label="Navegação administrativa"
      style={{
        display: 'grid',
        gap: '1.25rem',
        alignContent: 'start',
        position: 'sticky',
        top: 0,
        minHeight: '100vh',
        padding: '1.5rem 1.25rem',
        background:
          'linear-gradient(180deg, rgba(11,16,32,1) 0%, rgba(17,23,42,1) 100%)',
        borderRight: '1px solid rgba(148, 163, 184, 0.12)',
      }}
    >
      <AdminBrand />

      <nav aria-label="Seções internas">
        <ul
          style={{
            display: 'grid',
            gap: '0.6rem',
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {adminNavItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} style={sidebarLinkStyle}>
                <span
                  style={{
                    display: 'grid',
                    gap: '0.18rem',
                  }}
                >
                  <span
                    style={{
                      color: '#f8fafc',
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      color: '#94a3b8',
                      fontSize: '0.82rem',
                      lineHeight: 1.45,
                    }}
                  >
                    {item.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div
        style={{
          display: 'grid',
          gap: '0.6rem',
          padding: '1rem',
          borderRadius: 18,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
        }}
      >
        <span
          style={{
            color: '#dbe4ff',
            fontSize: '0.82rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          Ambiente interno
        </span>

        <p
          style={{
            margin: 0,
            color: '#cbd5e1',
            fontSize: '0.88rem',
            lineHeight: 1.6,
          }}
        >
          Navegação estrutural apenas. Sessão, permissão e proteção de rotas
          permanecem responsabilidade das camadas de autenticação.
        </p>
      </div>
    </aside>
  );
}

function AdminTopbar() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backdropFilter: 'blur(12px)',
        background: 'rgba(248, 250, 252, 0.88)',
        borderBottom: '1px solid #e4e7ec',
      }}
    >
      <div
        style={{
          minHeight: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingInline: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '0.2rem',
          }}
        >
          <span
            style={{
              color: '#175cd3',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Operação administrativa
          </span>

          <strong
            style={{
              color: '#101828',
              fontSize: '1rem',
              lineHeight: 1.2,
            }}
          >
            Estrutura interna sóbria, legível e pronta para crescer
          </strong>
        </div>

        <Link
          href="/painel/publicacoes"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 42,
            paddingInline: '0.95rem',
            borderRadius: 12,
            background: '#175cd3',
            color: '#ffffff',
            textDecoration: 'none',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          Ir para publicações
        </Link>
      </div>
    </header>
  );
}

function AdminMain({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '320px minmax(0, 1fr)',
        minHeight: '100vh',
      }}
    >
      <AdminSidebar />

      <div
        style={{
          minWidth: 0,
          background:
            'linear-gradient(180deg, #f8fafc 0%, #f8fafc 100%)',
        }}
      >
        <AdminTopbar />

        <main
          id="conteudo-principal-admin"
          style={{
            width: '100%',
            minWidth: 0,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 1280,
              margin: '0 auto',
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background: '#0b1020',
          color: '#101828',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        <a
          href="#conteudo-principal-admin"
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

        <AdminMain>{children}</AdminMain>
      </body>
    </html>
  );
}

const sidebarLinkStyle: CSSProperties = {
  display: 'grid',
  gap: '0.25rem',
  padding: '0.95rem 1rem',
  borderRadius: 16,
  textDecoration: 'none',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(148, 163, 184, 0.10)',
};
