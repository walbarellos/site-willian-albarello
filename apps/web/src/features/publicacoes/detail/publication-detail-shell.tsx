import type { PublicPublicationDetail } from '@william-albarello/contracts';

import { PublicationArticleBody } from './publication-article-body';
import { PublicationArticleHeader } from './publication-article-header';
import { PublicationDetailFooter } from './publication-detail-footer';
import { PublicationDetailMeta } from './publication-detail-meta';

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
        gap: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1120,
          margin: '0 auto',
          paddingInline: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '1.25rem',
          }}
        >
          <PublicationArticleHeader publication={publication} />
          <PublicationDetailMeta publication={publication} />
          <PublicationArticleBody publication={publication} />
          <PublicationDetailFooter publication={publication} />
        </div>
      </div>
    </main>
  );
}
