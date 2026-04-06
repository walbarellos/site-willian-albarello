import Link from 'next/link';

import { WEB_PUBLIC_ROUTES } from '../../../lib/routes';

export type PublicationBreadcrumbsProps = {
  title: string;
};

export function PublicationBreadcrumbs({ title }: PublicationBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        gap: '0.55rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        color: '#667085',
        fontSize: '0.92rem',
      }}
    >
      <Link href={WEB_PUBLIC_ROUTES.home} style={breadcrumbLinkStyle}>
        Início
      </Link>
      <span aria-hidden="true">/</span>
      <Link href={WEB_PUBLIC_ROUTES.publications} style={breadcrumbLinkStyle}>
        Publicações
      </Link>
      <span aria-hidden="true">/</span>
      <span
        style={{
          color: '#475467',
        }}
      >
        {title}
      </span>
    </nav>
  );
}

const breadcrumbLinkStyle: React.CSSProperties = {
  color: '#175cd3',
  textDecoration: 'none',
  fontWeight: 700,
};
