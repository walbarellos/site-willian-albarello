'use client';

import * as React from 'react';

import { AdminSectionCard } from '@william-albarello/ui';

import { PUBLICATION_STATUS_OPTIONS } from '../shared/status';
import type { PublicationsFiltersProps } from './types';

export function PublicationsFilters({
  values,
  onSubmit,
  onClear,
}: PublicationsFiltersProps) {
  const [q, setQ] = React.useState(values.q);
  const [status, setStatus] = React.useState(values.status);

  React.useEffect(() => {
    setQ(values.q);
    setStatus(values.status);
  }, [values.q, values.status]);

  function handleClear(): void {
    setQ('');
    setStatus('');
    onClear?.();
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.({
          q: q.trim(),
          status,
        });
      }}
    >
      <AdminSectionCard
        title="Filtros de publicações"
        description="Refine a listagem por texto e status editorial."
        actions={
          <div
            style={{
              display: 'flex',
              gap: '0.65rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="submit"
              style={{
                minHeight: 40,
                borderRadius: 12,
                border: '1px solid #175cd3',
                background: '#175cd3',
                color: '#ffffff',
                paddingInline: '0.95rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Aplicar filtros
            </button>

            <button
              type="button"
              onClick={handleClear}
              style={{
                minHeight: 40,
                borderRadius: 12,
                border: '1px solid #d0d5dd',
                background: '#ffffff',
                color: '#344054',
                paddingInline: '0.95rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Limpar
            </button>
          </div>
        }
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(220px, 280px)',
            gap: '0.85rem',
          }}
        >
          <label
            htmlFor="publications-search"
            style={{
              display: 'grid',
              gap: '0.4rem',
            }}
          >
            <span
              style={{
                color: '#344054',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              Buscar
            </span>
            <input
              id="publications-search"
              name="q"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Título, slug, resumo ou conteúdo"
              style={{
                minHeight: 42,
                width: '100%',
                borderRadius: 12,
                border: '1px solid #d0d5dd',
                background: '#ffffff',
                color: '#101828',
                paddingInline: '0.8rem',
                fontSize: '0.92rem',
              }}
            />
          </label>

          <label
            htmlFor="publications-status"
            style={{
              display: 'grid',
              gap: '0.4rem',
            }}
          >
            <span
              style={{
                color: '#344054',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              Status editorial
            </span>
            <select
              id="publications-status"
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}
              style={{
                minHeight: 42,
                width: '100%',
                borderRadius: 12,
                border: '1px solid #d0d5dd',
                background: '#ffffff',
                color: '#101828',
                paddingInline: '0.8rem',
                fontSize: '0.92rem',
              }}
            >
              <option value="">Todos</option>
              {PUBLICATION_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </AdminSectionCard>
    </form>
  );
}
