import type { CSSProperties } from 'react';

import type { EditorialStatus } from '@william-albarello/contracts';
import { AdminSectionCard, StatusBadge } from '@william-albarello/ui';

import { formatAdminDate } from '../shared/format';
import { getPublicationStatusLabel } from '../shared/status';

export type PublicationEditSidebarsProps = {
  status: EditorialStatus;
  updatedAt?: string | null;
  publishedAt?: string | null;
  slug: string;
};

export function PublicationEditSidebars({
  status,
  updatedAt,
  publishedAt,
  slug,
}: PublicationEditSidebarsProps) {
  const statusBadge = {
    status,
    context: 'form' as const,
    title: `Status editorial: ${getPublicationStatusLabel(status)}`,
  };

  return (
    <aside
      aria-label="Painel lateral da publicação"
      style={{
        display: 'grid',
        gap: '1rem',
      }}
    >
      <AdminSectionCard title="Estado editorial">
        <StatusBadge
          status={statusBadge.status}
          context={statusBadge.context}
          title={statusBadge.title}
        />

        <dl
          style={{
            display: 'grid',
            gap: '0.75rem',
            margin: 0,
          }}
        >
          <div style={{ display: 'grid', gap: '0.2rem' }}>
            <dt style={definitionLabelStyle}>Status atual</dt>
            <dd
              style={{
                margin: 0,
                color: '#101828',
                fontWeight: 700,
              }}
            >
              {getPublicationStatusLabel(status)}
            </dd>
          </div>

          <div style={{ display: 'grid', gap: '0.2rem' }}>
            <dt style={definitionLabelStyle}>Ultima atualizacao</dt>
            <dd style={definitionValueStyle}>
              {updatedAt ? formatAdminDate(updatedAt) : 'Nao informado'}
            </dd>
          </div>

          <div style={{ display: 'grid', gap: '0.2rem' }}>
            <dt style={definitionLabelStyle}>Publicacao</dt>
            <dd style={definitionValueStyle}>
              {publishedAt ? formatAdminDate(publishedAt) : 'Ainda nao publicada'}
            </dd>
          </div>

          <div style={{ display: 'grid', gap: '0.2rem' }}>
            <dt style={definitionLabelStyle}>Slug atual</dt>
            <dd style={definitionValueStyle}>{slug}</dd>
          </div>
        </dl>
      </AdminSectionCard>

      <AdminSectionCard
        title="Proxima evolucao natural"
        background="linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(255,255,255,1) 100%)"
      >
        <p
          style={{
            margin: 0,
            color: '#475467',
            lineHeight: 1.7,
            fontSize: '0.94rem',
          }}
        >
          Esta tela ja sustenta leitura, edicao, persistencia e transicao
          editorial. O proximo passo natural e acoplar preview e workflow mais
          rico sem quebrar esta base operacional.
        </p>
      </AdminSectionCard>
    </aside>
  );
}

const definitionLabelStyle: CSSProperties = {
  color: '#667085',
  fontSize: '0.78rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const definitionValueStyle: CSSProperties = {
  margin: 0,
  color: '#101828',
  lineHeight: 1.55,
};
