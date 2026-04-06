import Link from 'next/link';
import type { CSSProperties } from 'react';

import type { PublicPublicationDetail } from '@william-albarello/contracts';

import {
  buildPublicationDetailHref,
  WEB_PUBLIC_ROUTES,
} from '../../../lib/routes';

export type PublicationDetailFooterProps = {
  publication: PublicPublicationDetail;
};

export function PublicationDetailFooter({
  publication,
}: PublicationDetailFooterProps) {
  return (
    <section
      aria-labelledby="publication-footer-title"
      style={{
        display: 'grid',
        gap: '1rem',
        padding: '1.25rem',
        borderRadius: 20,
        background:
          'linear-gradient(135deg, rgba(15,76,255,0.06), rgba(23,92,211,0.02))',
        border: '1px solid rgba(23,92,211,0.12)',
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
          lineHeight: 1.75,
          maxWidth: 760,
        }}
      >
        Esta publicacao integra a camada publica do projeto e foi organizada
        para leitura institucional clara, descoberta organica disciplinada e
        evolucao editorial continua.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '0.85rem',
          flexWrap: 'wrap',
        }}
      >
        <Link href={WEB_PUBLIC_ROUTES.publications} style={primaryActionStyle}>
          Ver todas as publicacoes
        </Link>

        <Link href={WEB_PUBLIC_ROUTES.home} style={secondaryActionStyle}>
          Voltar ao inicio
        </Link>

        <Link
          href={buildPublicationDetailHref(publication.slug)}
          style={secondaryActionStyle}
        >
          Atualizar esta pagina
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
