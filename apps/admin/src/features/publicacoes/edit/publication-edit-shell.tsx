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
      </header>

      <div
        style={{
          display: 'grid',
          gap: '1rem',
        }}
      >
        <PublicationEditorForm
          {...form}
          values={form.values ?? toPublicationEditFormValues(publication)}
        />

        <PublicationSeoPanel
          {...seo}
          values={seo.values ?? toPublicationSeoFormValues(publication)}
        />

        <PublicationStatusPanel {...status} />
      </div>
    </section>
  );
}

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '1rem',
  flexWrap: 'wrap',
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
