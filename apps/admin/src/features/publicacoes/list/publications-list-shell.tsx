import {
  AdminPageHeader,
  AdminPageShell,
  AdminSectionCard,
  AdminSupportBlock,
} from '@william-albarello/ui';

import { PublicationsListState } from './publications-list-state';
import { PublicationsTable } from './publications-table';
import { PublicationsListPagination } from './publications-list-pagination';
import { getPublicationStatusLabel } from '../shared/status';
import type { PublicationsListShellProps } from './types';

export function PublicationsListShell({
  items,
  query,
  loading,
  error,
  onRetryHref,
  buildEditHref,
  pagination,
}: PublicationsListShellProps & {
  pagination?: {
    page: number;
    totalPages: number;
  };
}) {
  const isFiltered = Boolean(query.q || query.status);

  const emptyTitle = isFiltered
    ? 'Nenhuma publicação corresponde aos filtros'
    : 'Ainda não há publicações cadastradas';

  const emptyMessage = isFiltered
    ? 'Ajuste os filtros e tente novamente.'
    : 'Crie o primeiro rascunho para iniciar a operação editorial.';

  const state = (
    <PublicationsListState
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        emptyTitle={emptyTitle}
        emptyMessage={emptyMessage}
        retryHref={onRetryHref}
      />
  );

  return (
    <AdminPageShell>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
        }}
      >
        <AdminPageHeader
          title="Listagem editorial"
          description="Camada operacional da feature para leitura rápida dos status, atualização e navegação para edição."
          eyebrow="Feature de publicações"
          meta={[
            {
              label: 'Total exibido',
              value: String(items.length),
            },
            {
              label: 'Filtro ativo',
              value: isFiltered ? 'Sim' : 'Não',
              tone: isFiltered ? 'info' : 'default',
            },
          ]}
        />

        <AdminSectionCard
          title="Contexto da consulta"
          description="Resumo dos parâmetros ativos na leitura administrativa."
        >
          <div
            style={{
              display: 'flex',
              gap: '0.6rem',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                minHeight: 28,
                alignItems: 'center',
                paddingInline: '0.65rem',
                borderRadius: 999,
                background: '#f8fafc',
                border: '1px solid #d0d5dd',
                color: '#344054',
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
            >
              Busca: {query.q?.trim() ? `"${query.q.trim()}"` : 'sem termo'}
            </span>
            <span
              style={{
                display: 'inline-flex',
                minHeight: 28,
                alignItems: 'center',
                paddingInline: '0.65rem',
                borderRadius: 999,
                background: '#f8fafc',
                border: '1px solid #d0d5dd',
                color: '#344054',
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
            >
              Status: {query.status ? getPublicationStatusLabel(query.status) : 'todos'}
            </span>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Resultado da listagem">
          {loading || error || items.length === 0 ? (
            state
          ) : (
            <PublicationsTable items={items} buildEditHref={buildEditHref} />
          )}
        </AdminSectionCard>

        {pagination ? (
          <PublicationsListPagination
            query={query}
            page={pagination.page}
            totalPages={pagination.totalPages}
          />
        ) : null}

        <AdminSupportBlock
          tone="info"
          title="Operação segura do ciclo"
          subtitle="Método Caracol ativo"
          compact
        >
          Esta camada mantém a página principal fina e concentra os estados da
          listagem em um ponto único, reduzindo ruído e regressões entre ciclos.
        </AdminSupportBlock>
      </div>
    </AdminPageShell>
  );
}
