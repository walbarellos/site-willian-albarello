import Link from 'next/link';

import type { PublicPublicationListItem } from '@william-albarello/contracts';

import { WEB_PUBLIC_ROUTES } from '../../../lib/routes';
import { PublicationCard } from './publication-card';
import { PublicationsListHero } from './publications-list-hero';
import { PublicationsListLoading } from './publications-list-loading';
import { PublicationsListPagination } from './publications-list-pagination';
import type { PublicationsListQueryState } from './publications-list-query';
import { PublicationsListState } from './publications-list-state';
import { PublicationsSearchBar } from './publications-search-bar';

export type PublicationsListShellQuery = PublicationsListQueryState;

export type PublicationsListShellPagination = {
  page: number;
  totalPages: number;
};

export type PublicationsListShellProps = {
  query: PublicationsListShellQuery;
  totalItems: number;
  items: PublicPublicationListItem[];
  errorMessage?: string | null;
  pagination?: PublicationsListShellPagination;
  showHero?: boolean;
};

function ResultsHeader({
  totalItems,
  query,
}: Readonly<{
  totalItems: number;
  query: PublicationsListShellQuery;
}>) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
        alignItems: 'end',
        flexWrap: 'wrap',
        marginBottom: '1rem',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '0.35rem',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '1.3rem',
            color: '#101828',
            lineHeight: 1.15,
          }}
        >
          {query.q ? 'Resultados da busca' : 'Todas as publicações'}
        </h2>

        <p
          style={{
            margin: 0,
            color: '#475467',
            lineHeight: 1.6,
          }}
        >
          {query.q
            ? `${totalItems} resultado(s) para “${query.q}”.`
            : `${totalItems} publicação(ões) públicas disponíveis.`}
        </p>
      </div>

      <Link
        href={WEB_PUBLIC_ROUTES.home}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: 40,
          color: '#175cd3',
          textDecoration: 'none',
          fontWeight: 700,
        }}
      >
        Voltar ao início
      </Link>
    </div>
  );
}

export function PublicationsListShell({
  query,
  totalItems,
  items,
  errorMessage,
  pagination,
  showHero = false,
}: PublicationsListShellProps) {
  const isEmpty = !errorMessage && items.length === 0;

  return (
    <>
      {showHero ? <PublicationsListHero /> : null}

      <section
        aria-labelledby="lista-publicacoes-title"
        style={{
          paddingTop: '0.25rem',
          paddingBottom: '2rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1120,
            margin: '0 auto',
            paddingInline: '1.25rem',
            display: 'grid',
            gap: '1rem',
            alignContent: 'start',
            minWidth: 0,
          }}
        >
          <div
            style={{
              padding: '1rem',
              borderRadius: 16,
              background: '#ffffff',
              border: '1px solid #e4e7ec',
              boxShadow: '0 10px 24px rgba(16, 24, 40, 0.04)',
            }}
          >
            <PublicationsSearchBar query={{ q: query.q }} />
          </div>

          <div
            id="lista-publicacoes-title"
            style={{
              minWidth: 0,
            }}
          >
            <ResultsHeader totalItems={totalItems} query={query} />

            <PublicationsListState
              query={query}
              errorMessage={errorMessage}
              isEmpty={isEmpty}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1rem',
                }}
              >
                {items.map((item) => (
                  <PublicationCard key={item.id} item={item} />
                ))}
              </div>
            </PublicationsListState>
          </div>

          {pagination ? (
            <PublicationsListPagination
              query={query}
              page={pagination.page}
              totalPages={pagination.totalPages}
            />
          ) : null}
        </div>
      </section>
    </>
  );
}

export function PublicationsListShellLoading() {
  return <PublicationsListLoading />;
}
