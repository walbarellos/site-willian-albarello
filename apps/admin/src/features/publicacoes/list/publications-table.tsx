import Link from 'next/link';
import { StatusBadge } from '@william-albarello/ui';

import {
  formatAdminDate,
  formatReadingTime,
  formatSlugLabel,
} from '../shared/format';
import { toPublicationStatusBadgeModel } from '../shared/status';
import type { PublicationsTableProps } from './types';

export function PublicationsTable({
  items,
  buildEditHref,
}: PublicationsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
      <table className="min-w-full divide-y divide-neutral-200 text-sm">
        <thead className="bg-neutral-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Publicação</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Atualizado em</th>
            <th className="px-4 py-3 font-medium">Leitura</th>
            <th className="px-4 py-3 font-medium">Ação</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-neutral-100">
          {items.map((item) => {
            const badge = toPublicationStatusBadgeModel(item.status, 'table');

            return (
            <tr key={item.id}>
              <td className="px-4 py-3 align-top">
                <div className="font-medium text-neutral-900">{item.title}</div>
                <div className="text-xs text-neutral-500">
                  {formatSlugLabel(item.slug)}
                </div>
              </td>

              <td className="px-4 py-3 align-top">
                <StatusBadge
                  status={badge.status}
                  label={badge.label}
                  tone={badge.tone}
                  context={badge.context}
                  title={badge.title}
                />
              </td>

              <td className="px-4 py-3 align-top text-neutral-600">
                {formatAdminDate(item.updatedAt)}
              </td>

              <td className="px-4 py-3 align-top text-neutral-600">
                {formatReadingTime(item.readingTimeMinutes)}
              </td>

              <td className="px-4 py-3 align-top">
                <Link
                  href={buildEditHref(item.id)}
                  className="inline-flex rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100"
                >
                  Editar
                </Link>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
