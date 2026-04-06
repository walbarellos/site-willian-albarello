import Link from 'next/link';

import type { EditorialStatus } from '@william-albarello/contracts';
import { AdminPageHeader, AdminSectionCard, StatusBadge } from '@william-albarello/ui';

import { buildAdminPublicationsHref } from '../../../lib/routes';
import { getPublicationStatusLabel } from '../shared/status';

export type PublicationEditHeroProps = {
  title: string;
  slug: string;
  status: EditorialStatus;
};

export function PublicationEditHero({
  title,
  slug,
  status,
}: PublicationEditHeroProps) {
  const statusBadge = {
    status,
    context: 'contextual' as const,
    title: `Status editorial: ${getPublicationStatusLabel(status)}`,
  };

  return (
    <section
      aria-labelledby="admin-publication-edit-title"
      style={{
        paddingBottom: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1280,
          margin: '0 auto',
        }}
      >
        <AdminSectionCard>
          <nav
            aria-label="Breadcrumb da edicao"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              color: '#475467',
              fontSize: '0.92rem',
            }}
          >
            <Link href={buildAdminPublicationsHref()} style={breadcrumbLinkStyle}>
              Publicacoes
            </Link>
            <span aria-hidden="true">/</span>
            <span>Editar</span>
          </nav>

          <AdminPageHeader
            title={title}
            description={slug}
            eyebrow="Edicao editorial"
            actions={
              <StatusBadge
                status={statusBadge.status}
                context={statusBadge.context}
                title={statusBadge.title}
              />
            }
          />
        </AdminSectionCard>
      </div>
    </section>
  );
}

const breadcrumbLinkStyle: React.CSSProperties = {
  color: '#175cd3',
  textDecoration: 'none',
  fontWeight: 700,
};
