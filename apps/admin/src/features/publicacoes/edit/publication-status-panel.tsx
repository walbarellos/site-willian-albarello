'use client';

import type { EditorialStatus } from '@william-albarello/contracts';

import { getPublicationStatusLabel } from '../shared/status';
import type { PublicationStatusPanelProps } from './types';

export function PublicationStatusPanel({
    currentStatus,
    allowedNextStatuses,
    submitting,
    error,
    onTransition,
}: PublicationStatusPanelProps) {
    return (
        <section className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
        <div>
        <h2 className="text-base font-semibold">Workflow editorial</h2>
        <p className="text-sm text-neutral-600">
        Estado atual: {getPublicationStatusLabel(currentStatus)}
        </p>
        </div>

        {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error.message}
            </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
        {allowedNextStatuses.map((status) => (
            <button
            key={status}
            type="button"
            disabled={submitting}
            onClick={() => onTransition?.(status as EditorialStatus)}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm disabled:opacity-60"
            >
            Mover para {getPublicationStatusLabel(status)}
            </button>
        ))}
        </div>
        </section>
    );
}
