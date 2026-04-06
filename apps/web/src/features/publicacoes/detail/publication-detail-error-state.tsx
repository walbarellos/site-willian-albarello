import Link from 'next/link';
import type { CSSProperties } from 'react';
import { AlertBanner } from '@william-albarello/ui';

import { WEB_PUBLIC_ROUTES } from '../../../lib/routes';
import { PublicationBreadcrumbs } from './publication-breadcrumbs';

export type PublicationDetailErrorStateProps = {
  message: string;
};

export function PublicationDetailErrorState({
  message,
}: PublicationDetailErrorStateProps) {
  return (
    <main
      style={{
        display: 'grid',
        gap: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1120,
          margin: '0 auto',
          paddingInline: '1.25rem',
        }}
      >
        <section
          aria-labelledby="publication-error-title"
          style={{ display: 'grid', gap: '1rem' }}
        >
          <PublicationBreadcrumbs title="Erro de carregamento" />
          <AlertBanner
            title="Nao foi possivel carregar esta publicacao"
            tone="warning"
            action={
              <div
                style={{
                  display: 'flex',
                  gap: '0.85rem',
                  flexWrap: 'wrap',
                }}
              >
                <Link href={WEB_PUBLIC_ROUTES.publications} style={primaryActionStyle}>
                  Voltar as publicacoes
                </Link>

                <Link href={WEB_PUBLIC_ROUTES.home} style={secondaryActionStyle}>
                  Ir para o inicio
                </Link>
              </div>
            }
          >
            <span id="publication-error-title">{message}</span>
          </AlertBanner>
        </section>
      </div>
    </main>
  );
}

const primaryActionStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 46,
  paddingInline: '1rem',
  borderRadius: 14,
  background: '#175cd3',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 700,
};

const secondaryActionStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 46,
  paddingInline: '1rem',
  borderRadius: 14,
  background: '#ffffff',
  color: '#344054',
  textDecoration: 'none',
  fontWeight: 700,
  border: '1px solid #d0d5dd',
};
