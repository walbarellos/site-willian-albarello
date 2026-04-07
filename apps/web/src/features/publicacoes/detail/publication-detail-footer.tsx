import Link from 'next/link';
import type { CSSProperties } from 'react';

import type { PublicPublicationDetail } from '@william-albarello/contracts';

import {
  WEB_PUBLIC_ROUTES,
} from '../../../lib/routes';

export type PublicationDetailFooterProps = {
  publication: PublicPublicationDetail;
};

export function PublicationDetailFooter({
  publication: _publication,
}: PublicationDetailFooterProps) {
  return (
    <section
      aria-labelledby="publication-footer-title"
      className="publication-detail-footer"
      style={{
        display: 'grid',
        gap: '0.9rem',
        padding: '1.1rem 1rem',
        borderRadius: 14,
        background:
          'linear-gradient(135deg, rgba(15,76,255,0.05), rgba(23,92,211,0.015))',
        border: '1px solid rgba(23,92,211,0.14)',
        justifyItems: 'center',
        textAlign: 'center',
      }}
    >
      <h2
        id="publication-footer-title"
        style={{
          margin: 0,
          color: '#101828',
          fontSize: '1.1rem',
        }}
      >
        Continuidade de leitura
      </h2>

      <p
        style={{
          margin: 0,
          color: '#475467',
          lineHeight: 1.7,
          maxWidth: 700,
          fontSize: '0.96rem',
        }}
      >
        Leitura concluída. Continue navegando pela camada pública e explore os
        conteúdos com o mesmo padrão editorial.
      </p>

      <div
        className="publication-detail-footer-actions"
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '0.85rem',
          alignItems: 'center',
        }}
      >
        <Link
          href={WEB_PUBLIC_ROUTES.publications}
          style={{ ...primaryActionStyle, justifySelf: 'start' }}
        >
          Ver todas as publicacoes
        </Link>

        <Link
          href={WEB_PUBLIC_ROUTES.home}
          style={{ ...secondaryActionStyle, justifySelf: 'end' }}
        >
          Voltar ao inicio
        </Link>
      </div>
    </section>
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
