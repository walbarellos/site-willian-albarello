'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import {
  toPublicationEditFormValues,
  toPublicationSeoFormValues,
} from '../shared/types';
import { PublicationEditFeedback } from './publication-edit-feedback';
import { PublicationEditHero } from './publication-edit-hero';
import { PublicationEditorForm } from './publication-editor-form';
import { PublicationSeoPanel } from './publication-seo-panel';
import { PublicationStatusPanel } from './publication-status-panel';
import type { PublicationEditShellProps } from './types';

type PublicationEditShellViewProps = PublicationEditShellProps & {
  feedbackCode?: string;
};

export function PublicationEditShell({
  publication,
  form,
  seo,
  status,
  backHref,
  feedbackCode,
}: PublicationEditShellViewProps) {
  const canPublishNow = status.allowedNextStatuses.includes('published');

  return (
    <section
      aria-label="Composição principal da edição"
      style={{
        display: 'grid',
        gap: '1rem',
      }}
    >
      <PublicationEditHero
        title={publication.title}
        slug={publication.slug}
        status={publication.status}
      />

      <PublicationEditFeedback code={feedbackCode} />

      <header style={headerStyle}>
        <Link href={backHref} style={backLinkStyle}>
          Voltar para listagem
        </Link>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.6rem',
          }}
        >
          <button type="submit" form="publication-main-form" style={primaryButtonStyle}>
            Salvar rascunho
          </button>
          {canPublishNow ? (
            <button
              type="button"
              style={successButtonStyle}
              onClick={() => status.onTransition?.('published')}
            >
              Publicar
            </button>
          ) : null}
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gap: '1rem',
        }}
      >
        <PublicationEditorForm
          {...form}
          formId="publication-main-form"
          showSubmitButton={false}
          values={form.values ?? toPublicationEditFormValues(publication)}
        />

        <PublicationSeoPanel
          {...seo}
          formId="publication-seo-form"
          showSubmitButton={false}
          values={seo.values ?? toPublicationSeoFormValues(publication)}
        />

        <PublicationStatusPanel {...status} />
      </div>
    </section>
  );
}

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
  flexWrap: 'wrap',
  position: 'sticky',
  top: 82,
  zIndex: 10,
  padding: '0.65rem 0.75rem',
  borderRadius: 12,
  background: 'rgba(248, 250, 252, 0.92)',
  border: '1px solid #e4e7ec',
  backdropFilter: 'blur(10px)',
};

const backLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 40,
  paddingInline: '0.85rem',
  borderRadius: 12,
  background: '#ffffff',
  border: '1px solid #d0d5dd',
  color: '#344054',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '0.88rem',
};

const primaryButtonStyle: CSSProperties = {
  minHeight: 40,
  borderRadius: 12,
  border: '1px solid #175cd3',
  background: '#175cd3',
  color: '#ffffff',
  paddingInline: '0.95rem',
  fontSize: '0.9rem',
  fontWeight: 700,
  cursor: 'pointer',
};

const successButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  border: '1px solid #079455',
  background: '#079455',
};
