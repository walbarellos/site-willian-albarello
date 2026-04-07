import Link from 'next/link';
import { AlertBanner, EmptyState } from '@william-albarello/ui';

import type { PublicationsListStateProps } from './types';

export function PublicationsListState({
  loading,
  error,
  isEmpty,
  emptyTitle = 'Nenhuma publicação encontrada',
  emptyMessage = 'A lista não retornou itens para os filtros atuais.',
  retryHref,
}: PublicationsListStateProps) {
  if (loading) {
    return (
      <AlertBanner
        tone="info"
        title="Carregando publicações"
        subtitle="Aguarde alguns instantes"
      >
        Estamos consolidando os dados editoriais para exibir a listagem.
      </AlertBanner>
    );
  }

  if (error) {
    return (
      <AlertBanner
        tone="danger"
        title={error.title ?? 'Falha ao carregar publicações'}
        action={
          retryHref ? (
            <Link
              href={retryHref}
              style={{
                display: 'inline-flex',
                minHeight: 34,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                border: '1px solid #fda29b',
                background: '#ffffff',
                color: '#b42318',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 700,
                paddingInline: '0.7rem',
              }}
            >
              {error.retryLabel ?? 'Tentar novamente'}
            </Link>
          ) : null
        }
      >
        {error.message}
      </AlertBanner>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyMessage}
        tone="neutral"
        icon={
          <span
            style={{
              display: 'inline-flex',
              width: 30,
              height: 30,
              borderRadius: 999,
              border: '1px solid #d0d5dd',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}
          >
            ·
          </span>
        }
      />
    );
  }

  return null;
}
