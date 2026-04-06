import Link from 'next/link';
import type { CSSProperties } from 'react';

import {
  buildPublicationsHref,
  type PublicPublicationsRouteQuery,
} from '../../../lib/routes';

export type PublicationsListPaginationProps = {
  query: PublicPublicationsRouteQuery;
  page: number;
  totalPages: number;
};

export function PublicationsListPagination({
  query,
  page,
  totalPages,
}: PublicationsListPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const previousHref = buildPublicationsHref({
    ...query,
    page: Math.max(1, page - 1),
  });

  const nextHref = buildPublicationsHref({
    ...query,
    page: Math.min(totalPages, page + 1),
  });

  return (
    <nav
      aria-label="Paginacao das publicacoes"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        marginTop: '1.5rem',
      }}
    >
      <div
        style={{
          color: '#475467',
          fontSize: '0.95rem',
        }}
      >
        Pagina {page} de {totalPages}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        {page > 1 ? (
          <Link href={previousHref} style={paginationLinkStyle}>
            Pagina anterior
          </Link>
        ) : (
          <span
            aria-disabled="true"
            style={{
              ...paginationLinkStyle,
              opacity: 0.45,
              cursor: 'not-allowed',
            }}
          >
            Pagina anterior
          </span>
        )}

        {page < totalPages ? (
          <Link href={nextHref} style={paginationLinkStyle}>
            Proxima pagina
          </Link>
        ) : (
          <span
            aria-disabled="true"
            style={{
              ...paginationLinkStyle,
              opacity: 0.45,
              cursor: 'not-allowed',
            }}
          >
            Proxima pagina
          </span>
        )}
      </div>
    </nav>
  );
}

const paginationLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 42,
  paddingInline: '1rem',
  borderRadius: 12,
  background: '#ffffff',
  color: '#344054',
  textDecoration: 'none',
  fontWeight: 700,
  border: '1px solid #d0d5dd',
};
