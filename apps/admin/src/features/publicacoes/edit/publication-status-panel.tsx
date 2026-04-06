'use client';

import type { CSSProperties } from 'react';
import type { EditorialStatus } from '@william-albarello/contracts';

import { getPublicationStatusLabel } from '../shared/status';
import type { PublicationStatusPanelProps } from './types';

const buttonStyle: CSSProperties = {
  minHeight: 38,
  borderRadius: 10,
  border: '1px solid #d0d5dd',
  background: '#ffffff',
  color: '#344054',
  paddingInline: '0.85rem',
  fontSize: '0.86rem',
  fontWeight: 700,
  cursor: 'pointer',
};

export function PublicationStatusPanel({
  currentStatus,
  allowedNextStatuses,
  submitting,
  error,
  onTransition,
}: PublicationStatusPanelProps) {
  const canPublishNow = allowedNextStatuses.includes('published');
  const secondaryTransitions = allowedNextStatuses.filter(
    (status) => status !== 'published',
  );

  return (
    <section
      style={{
        display: 'grid',
        gap: '1rem',
        borderRadius: 16,
        border: '1px solid #d0d5dd',
        background: '#ffffff',
        padding: '1rem',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '0.35rem',
        }}
      >
        <h2
          style={{
            margin: 0,
            color: '#101828',
            fontSize: '1.2rem',
            lineHeight: 1.2,
          }}
        >
          Workflow editorial
        </h2>
        <p
          style={{
            margin: 0,
            color: '#667085',
            lineHeight: 1.65,
          }}
        >
          Estado atual:
          {' '}
          <strong style={{ color: '#101828' }}>
            {getPublicationStatusLabel(currentStatus)}
          </strong>
        </p>
      </div>

      {error ? (
        <div
          style={{
            borderRadius: 12,
            border: '1px solid #fda29b',
            background: '#fef3f2',
            color: '#b42318',
            padding: '0.75rem',
            fontSize: '0.9rem',
            lineHeight: 1.5,
          }}
        >
          {error.message}
        </div>
      ) : null}

      {canPublishNow ? (
        <button
          type="button"
          disabled={submitting}
          onClick={() => onTransition?.('published')}
          style={{
            ...buttonStyle,
            minHeight: 42,
            border: '1px solid #079455',
            background: '#079455',
            color: '#ffffff',
            opacity: submitting ? 0.65 : 1,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          Publicar agora
        </button>
      ) : null}

      {secondaryTransitions.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.6rem',
          }}
        >
          {secondaryTransitions.map((status) => (
            <button
              key={status}
              type="button"
              disabled={submitting}
              onClick={() => onTransition?.(status as EditorialStatus)}
              style={{
                ...buttonStyle,
                opacity: submitting ? 0.65 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              Mover para {getPublicationStatusLabel(status)}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
