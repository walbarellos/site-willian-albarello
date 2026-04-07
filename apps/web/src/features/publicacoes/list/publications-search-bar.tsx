import Link from 'next/link';

import { WEB_PUBLIC_ROUTES } from '../../../lib/routes';

export type PublicationsSearchBarQuery = {
  q?: string;
};

export type PublicationsSearchBarProps = {
  query: PublicationsSearchBarQuery;
  actionHref?: string;
};

export function PublicationsSearchBar({
  query,
  actionHref = WEB_PUBLIC_ROUTES.publications,
}: PublicationsSearchBarProps) {
  return (
    <form
      action={actionHref}
      method="get"
      role="search"
      aria-label="Buscar publicações"
      className="publications-search-form"
      style={{
        display: 'grid',
        gap: '0.85rem',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'end',
      }}
    >
      <label
        htmlFor="busca-publicacoes"
        style={{
          display: 'grid',
          gap: '0.45rem',
        }}
      >
        <span
          style={{
            color: '#344054',
            fontSize: '0.92rem',
            fontWeight: 600,
          }}
        >
          Buscar publicações
        </span>

        <input
          id="busca-publicacoes"
          name="q"
          defaultValue={query.q ?? ''}
          placeholder="Buscar por título, resumo ou tema"
          style={{
            minHeight: 48,
            width: '100%',
            borderRadius: 14,
            border: '1px solid #d0d5dd',
            paddingInline: '0.95rem',
            background: '#ffffff',
            color: '#101828',
            fontSize: '1rem',
            outline: 'none',
          }}
        />
      </label>

      <div
        className="publications-search-actions"
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="submit"
          style={{
            minHeight: 48,
            paddingInline: '1.15rem',
            borderRadius: 14,
            border: '1px solid #175cd3',
            background: '#175cd3',
            color: '#ffffff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Buscar
        </button>

        {query.q ? (
          <Link
            href={actionHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
              paddingInline: '1rem',
              borderRadius: 14,
              border: '1px solid #d0d5dd',
              background: '#ffffff',
              color: '#344054',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Limpar
          </Link>
        ) : null}
      </div>
    </form>
  );
}
