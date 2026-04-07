import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import {
  AdminSidebarNav,
  type AdminSidebarNavItem,
} from '../../src/features-admin/navigation/admin-sidebar-nav';
import {
  buildPublicSiteHomeHref,
  buildPublicSitePublicationsHref,
} from '../../src/lib/admin/routes';

const ADMIN_NAME = 'William Albarello — Painel';
const ADMIN_DESCRIPTION =
  'Área administrativa interna para operação editorial e manutenção de publicações.';

export const metadata: Metadata = {
  title: {
    default: ADMIN_NAME,
    template: `%s | ${ADMIN_NAME}`,
  },
  description: ADMIN_DESCRIPTION,
  robots: { index: false, follow: false },
};

type AdminLayoutProps = Readonly<{ children: ReactNode }>;

const adminNavItems: AdminSidebarNavItem[] = [
  { href: '/painel', label: 'Entrada', description: 'Resumo operacional.' },
  { href: '/painel/publicacoes/nova', label: 'Nova publicação', description: 'Cria rascunho.' },
  { href: '/painel/publicacoes', label: 'Publicações', description: 'Gestão editorial.' },
];

function AdminSidebar() {
  return (
    <aside
      aria-label="Navegação administrativa"
      style={{
        display: 'grid',
        gap: '1rem',
        alignContent: 'start',
        position: 'sticky',
        top: 0,
        minHeight: '100vh',
        padding: '1.5rem 1rem',
        background: 'linear-gradient(180deg, rgba(11,16,32,1) 0%, rgba(17,23,42,1) 100%)',
        borderRight: '1px solid rgba(148, 163, 184, 0.12)',
      }}
    >
      <div style={{ display: 'grid', gap: '0.45rem' }}>
        <strong style={{ color: '#f8fafc', fontSize: '1rem' }}>William Albarello</strong>
        <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>painel administrativo</span>
      </div>
      <AdminSidebarNav items={adminNavItems} />
      <div style={{ display: 'grid', gap: '0.45rem' }}>
        <Link href={buildPublicSiteHomeHref()} target="_blank" rel="noreferrer" style={quickLinkStyle}>
          Ver página inicial
        </Link>
        <Link
          href={buildPublicSitePublicationsHref()}
          target="_blank"
          rel="noreferrer"
          style={quickLinkStyle}
        >
          Ver publicações públicas
        </Link>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <section style={{ width: '100%' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 1260,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 280px) minmax(0, 1fr)',
          background: '#f8fafc',
          border: '1px solid #e4e7ec',
          borderRadius: 20,
          overflow: 'clip',
        }}
      >
        <AdminSidebar />
        <div style={{ minWidth: 0 }}>{children}</div>
      </div>
    </section>
  );
}

const quickLinkStyle: CSSProperties = {
  display: 'inline-flex',
  minHeight: 36,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 10,
  textDecoration: 'none',
  border: '1px solid rgba(148,163,184,0.26)',
  color: '#dbe4ff',
  background: 'rgba(255,255,255,0.04)',
  fontSize: '0.84rem',
  fontWeight: 600,
  paddingInline: '0.7rem',
};
