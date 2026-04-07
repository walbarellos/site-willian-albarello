import Link from 'next/link';
import { StatusBadge } from '@william-albarello/ui';

import {
  formatAdminDate,
  formatReadingTime,
  formatSlugLabel,
} from '../shared/format';
import { toPublicationStatusBadgeModel } from '../shared/status';
import type { PublicationsTableProps } from './types';

const cellHeaderStyle: React.CSSProperties = {
  padding: '0.7rem 0.85rem',
  fontWeight: 700,
  color: '#344054',
  fontSize: '0.86rem',
  whiteSpace: 'nowrap',
};

const cellStyle: React.CSSProperties = {
  padding: '0.75rem 0.85rem',
  verticalAlign: 'top',
  borderTop: '1px solid #eaecf0',
};

export function PublicationsTable({
  items,
  buildEditHref,
  deleteDraftAction,
}: PublicationsTableProps) {
  return (
    <div
      style={{
        overflowX: 'auto',
        borderRadius: 16,
        border: '1px solid #d0d5dd',
        background: '#ffffff',
      }}
    >
      <table
        style={{
          width: '100%',
          minWidth: 760,
          borderCollapse: 'separate',
          borderSpacing: 0,
          fontSize: '0.92rem',
        }}
      >
        <thead
          style={{
            background: '#f8fafc',
            textAlign: 'left',
          }}
        >
          <tr>
            <th style={cellHeaderStyle}>Publicação</th>
            <th style={cellHeaderStyle}>Status</th>
            <th style={cellHeaderStyle}>Atualizado em</th>
            <th style={cellHeaderStyle}>Leitura</th>
            <th style={cellHeaderStyle}>Ação</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const badge = toPublicationStatusBadgeModel(item.status, 'table');

            return (
              <tr key={item.id}>
                <td style={cellStyle}>
                  <div
                    style={{
                      color: '#101828',
                      fontWeight: 700,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      color: '#667085',
                      fontSize: '0.78rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {formatSlugLabel(item.slug)}
                  </div>
                </td>

                <td style={cellStyle}>
                  <StatusBadge
                    status={badge.status}
                    label={badge.label}
                    tone={badge.tone}
                    context={badge.context}
                    title={badge.title}
                  />
                </td>

                <td style={{ ...cellStyle, color: '#475467' }}>
                  {formatAdminDate(item.updatedAt)}
                </td>

                <td style={{ ...cellStyle, color: '#475467' }}>
                  {formatReadingTime(item.readingTimeMinutes)}
                </td>

                <td style={cellStyle}>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Link
                      href={buildEditHref(item.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 34,
                        borderRadius: 10,
                        border: '1px solid #d0d5dd',
                        background: '#ffffff',
                        color: '#344054',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        paddingInline: '0.75rem',
                      }}
                    >
                      Editar
                    </Link>

                    {item.status === 'draft' && deleteDraftAction ? (
                      <form action={deleteDraftAction.bind(null, item.id)}>
                        <button
                          type="submit"
                          style={{
                            minHeight: 34,
                            borderRadius: 10,
                            border: '1px solid #fda29b',
                            background: '#fef3f2',
                            color: '#b42318',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            paddingInline: '0.65rem',
                            cursor: 'pointer',
                          }}
                        >
                          Excluir rascunho
                        </button>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
