import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import {
  AdminPageHeader,
  AdminPageShell,
  AdminSectionCard,
} from '@william-albarello/ui';

import {
  buildAdminPublicationCreateHref,
  buildAdminPublicationsHref,
} from '../../src/lib/admin/routes';
import { requireAdminSessionServer } from '../../src/lib/admin/session';

export const metadata: Metadata = {
  title: 'Entrada do painel',
  description: 'Ponto inicial operacional do painel administrativo.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const actionLinkStyle: CSSProperties = {
  display: 'inline-flex',
  minHeight: 40,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
  paddingInline: '0.9rem',
  textDecoration: 'none',
  border: '1px solid #175cd3',
  background: '#175cd3',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '0.9rem',
  whiteSpace: 'nowrap',
};

const secondaryLinkStyle: CSSProperties = {
  ...actionLinkStyle,
  border: '1px solid #d0d5dd',
  background: '#ffffff',
  color: '#344054',
};

export default async function AdminDashboardPage() {
  await requireAdminSessionServer({
    allowedRoles: ['admin', 'editor'],
    returnTo: '/painel',
  });

  return (
    <main>
      <AdminPageShell>
        <AdminPageHeader
          eyebrow="Operação administrativa"
          title="Entrada do painel"
          description="Escolha o fluxo operacional: criar novo conteúdo ou operar a listagem editorial existente."
        />

        <AdminSectionCard title="Ações principais">
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <Link href={buildAdminPublicationCreateHref()} style={actionLinkStyle}>
              Nova publicação
            </Link>
            <Link href={buildAdminPublicationsHref()} style={secondaryLinkStyle}>
              Abrir listagem
            </Link>
          </div>
        </AdminSectionCard>
      </AdminPageShell>
    </main>
  );
}
