import * as React from 'react';

export type StatusBadgeTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export type PublicationStatusBadge =
  | 'draft'
  | 'review'
  | 'ready_to_publish'
  | 'published'
  | 'archived';

export type StatusBadgeContext = 'table' | 'form' | 'contextual';

export type StatusBadgeProps = {
  label?: React.ReactNode;
  tone?: StatusBadgeTone;
  status?: PublicationStatusBadge;
  context?: StatusBadgeContext;
  title?: string;
};

const toneMap: Record<
  StatusBadgeTone,
  {
    background: string;
    border: string;
    color: string;
  }
> = {
  neutral: {
    background: '#f8fafc',
    border: '1px solid #d0d5dd',
    color: '#344054',
  },
  info: {
    background: '#eef4ff',
    border: '1px solid #d5e3ff',
    color: '#175cd3',
  },
  success: {
    background: '#ecfdf3',
    border: '1px solid #abefc6',
    color: '#067647',
  },
  warning: {
    background: '#fff6ed',
    border: '1px solid #fed7aa',
    color: '#9a3412',
  },
  danger: {
    background: '#fef3f2',
    border: '1px solid #fecdca',
    color: '#b42318',
  },
};

const publicationStatusMap: Record<
  PublicationStatusBadge,
  {
    label: string;
    tone: StatusBadgeTone;
  }
> = {
  draft: {
    label: 'Rascunho',
    tone: 'neutral',
  },
  review: {
    label: 'Em revisão',
    tone: 'info',
  },
  ready_to_publish: {
    label: 'Pronto para publicar',
    tone: 'warning',
  },
  published: {
    label: 'Publicado',
    tone: 'success',
  },
  archived: {
    label: 'Arquivado',
    tone: 'danger',
  },
};

const contextMap: Record<
  StatusBadgeContext,
  {
    minHeight: number;
    paddingInline: string;
    fontSize: string;
  }
> = {
  table: {
    minHeight: 26,
    paddingInline: '0.5rem',
    fontSize: '0.75rem',
  },
  form: {
    minHeight: 30,
    paddingInline: '0.625rem',
    fontSize: '0.8rem',
  },
  contextual: {
    minHeight: 32,
    paddingInline: '0.75rem',
    fontSize: '0.84rem',
  },
};

export function StatusBadge({
  label,
  tone = 'neutral',
  status,
  context = 'contextual',
  title,
}: StatusBadgeProps) {
  const semantic = status ? publicationStatusMap[status] : null;
  const resolvedLabel = label ?? semantic?.label ?? 'Sem status';
  const resolvedTone = semantic?.tone ?? tone;
  const palette = toneMap[resolvedTone];
  const sizing = contextMap[context];

  return (
    <span
      title={title}
      data-status={status}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: sizing.minHeight,
        paddingInline: sizing.paddingInline,
        borderRadius: 999,
        background: palette.background,
        border: palette.border,
        color: palette.color,
        fontSize: sizing.fontSize,
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {resolvedLabel}
    </span>
  );
}
