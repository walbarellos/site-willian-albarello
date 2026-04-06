import Link from 'next/link';
import { AlertBanner, EmptyState } from '@william-albarello/ui';

import {
  buildPublicationsHref,
  WEB_PUBLIC_ROUTES,
} from '../../../lib/routes';

export type PublicationsListStateQuery = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export type PublicationsListStateProps = {
  query: PublicationsListStateQuery;
  errorMessage?: string | null;
  isEmpty: boolean;
  children?: React.ReactNode;
};

export function PublicationsListState({
  query,
  errorMessage,
  isEmpty,
  children,
}: PublicationsListStateProps) {
  if (errorMessage) {
    return (
      <AlertBanner
        title="Não foi possível carregar as publicações"
        tone="warning"
        action={
          <>
            <Link href={buildPublicationsHref(query)} style={retryLinkStyle}>
              Tentar novamente
            </Link>
            <Link href={WEB_PUBLIC_ROUTES.home} style={backHomeLinkStyle}>
              Voltar ao início
            </Link>
          </>
        }
      >
        {errorMessage}
      </AlertBanner>
    );
  }

  if (isEmpty) {
    const hasSearch = Boolean(query.q);

    return (
      <EmptyState
        title={
          hasSearch
            ? 'Nenhuma publicação corresponde à busca'
            : 'Ainda não há publicações públicas disponíveis'
        }
        description={
          hasSearch
            ? `Nenhum resultado foi encontrado para “${query.q}”. Ajuste os termos e tente novamente.`
            : 'Quando os próximos conteúdos estiverem prontos para descoberta pública, eles serão listados aqui com contexto de leitura e navegação.'
        }
        action={
          <div
            style={{
              display: 'flex',
              gap: '0.85rem',
              flexWrap: 'wrap',
            }}
          >
            {hasSearch ? (
              <Link href={WEB_PUBLIC_ROUTES.publications} style={clearSearchLinkStyle}>
                Limpar busca
              </Link>
            ) : null}
            <Link href={WEB_PUBLIC_ROUTES.home} style={defaultActionLinkStyle}>
              Voltar ao início
            </Link>
          </div>
        }
      />
    );
  }

  return <>{children ?? null}</>;
}

const retryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  paddingInline: '1rem',
  borderRadius: 12,
  background: '#c2410c',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 700,
};

const backHomeLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  paddingInline: '1rem',
  borderRadius: 12,
  background: '#ffffff',
  color: '#9a3412',
  textDecoration: 'none',
  fontWeight: 700,
  border: '1px solid #fdba74',
};

const clearSearchLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  paddingInline: '1rem',
  borderRadius: 12,
  background: '#175cd3',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 700,
};

const defaultActionLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  paddingInline: '1rem',
  borderRadius: 12,
  background: '#ffffff',
  color: '#344054',
  textDecoration: 'none',
  fontWeight: 700,
  border: '1px solid #d0d5dd',
};
