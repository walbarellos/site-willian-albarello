import type { PublicPublicationDetail } from '@william-albarello/contracts';

import { PublicationArticleBody } from './publication-article-body';
import { PublicationDetailFooter } from './publication-detail-footer';
import { PublicationReadingHero } from './publication-reading-hero';

export type PublicationReadingShellProps = {
  publication: PublicPublicationDetail;
};

export function PublicationReadingShell({
  publication,
}: PublicationReadingShellProps) {
  return (
    <section
      style={{
        display: 'grid',
        gap: '1.25rem',
      }}
    >
      <PublicationReadingHero publication={publication} />
      <PublicationArticleBody publication={publication} />
      <PublicationDetailFooter publication={publication} />
    </section>
  );
}
