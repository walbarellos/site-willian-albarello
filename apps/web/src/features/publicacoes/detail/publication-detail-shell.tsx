import type { PublicPublicationDetail } from '@william-albarello/contracts';

import { PublicationReadingShell } from './publication-reading-shell';

export type PublicationDetailShellProps = {
  publication: PublicPublicationDetail;
};

export function PublicationDetailShell({
  publication,
}: PublicationDetailShellProps) {
  return (
    <main
      style={{
        display: 'grid',
        gap: '1.1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 920,
          margin: '0 auto',
          paddingInline: '1rem',
        }}
      >
        <PublicationReadingShell publication={publication} />
      </div>
    </main>
  );
}
