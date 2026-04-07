// apps/admin/src/features/publicacoes/shared/status.ts

import type { EditorialStatus } from '@william-albarello/contracts';
import type { StatusBadgeTone } from '@william-albarello/ui';

export type PublicationStatusBadge = EditorialStatus;
export type StatusBadgeContext = 'table' | 'form' | 'contextual';

export const PUBLICATION_STATUS_LABELS: Record<EditorialStatus, string> = {
  draft: 'Rascunho',
  review: 'Em revisão',
  ready_to_publish: 'Pronto para publicar',
  published: 'Publicado',
  archived: 'Arquivado',
};

export const PUBLICATION_STATUS_ORDER: EditorialStatus[] = [
  'draft',
  'review',
  'ready_to_publish',
  'published',
  'archived',
];

export const PUBLICATION_STATUS_TONES: Record<EditorialStatus, StatusBadgeTone> =
  {
    draft: 'neutral',
    review: 'info',
    ready_to_publish: 'warning',
    published: 'success',
    archived: 'danger',
  };

export const PUBLICATION_ALLOWED_TRANSITIONS: Record<
  EditorialStatus,
  EditorialStatus[]
> = {
  draft: ['review', 'archived'],
  review: ['draft', 'ready_to_publish', 'archived'],
  ready_to_publish: ['review', 'published', 'archived'],
  published: ['archived'],
  archived: ['draft'],
};

export const PUBLICATION_STATUS_OPTIONS: Array<{
  value: EditorialStatus;
  label: string;
}> = PUBLICATION_STATUS_ORDER.map((status) => ({
  value: status,
  label: PUBLICATION_STATUS_LABELS[status],
}));

export type PublicationStatusBadgeModel = {
  status: PublicationStatusBadge;
  label: string;
  tone: StatusBadgeTone;
  context: StatusBadgeContext;
  title: string;
};

export function getPublicationStatusLabel(status: EditorialStatus): string {
  return PUBLICATION_STATUS_LABELS[status];
}

export function getPublicationStatusTone(status: EditorialStatus): StatusBadgeTone {
  return PUBLICATION_STATUS_TONES[status];
}

export function getPublicationStatusTitle(status: EditorialStatus): string {
  return `Status editorial: ${getPublicationStatusLabel(status)}`;
}

export function toPublicationStatusBadgeModel(
  status: EditorialStatus,
  context: StatusBadgeContext = 'contextual',
): PublicationStatusBadgeModel {
  return {
    status,
    label: getPublicationStatusLabel(status),
    tone: getPublicationStatusTone(status),
    context,
    title: getPublicationStatusTitle(status),
  };
}

export function canTransitionPublicationStatus(
  current: EditorialStatus,
  next: EditorialStatus,
): boolean {
  return PUBLICATION_ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}
