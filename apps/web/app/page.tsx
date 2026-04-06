// apps/web/app/page.tsx

import type { Metadata } from 'next';

import { HomePageShell } from '../src/features/home/home-page-shell';
import type { HomePublicationSpotlightItem } from '../src/features/home/home-publications-spotlight';
import { listPublications } from '../src/lib/api/public';
import { WEB_PUBLIC_ROUTES } from '../src/lib/routes';

export const revalidate = 300;

const DEFAULT_SITE_URL = 'http://localhost:3000';

function resolveSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;

  try {
    return new URL(raw);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: 'Inicio',
  description:
    'Presenca institucional orientada por clareza estrategica, consistencia editorial e arquitetura publica disciplinada.',
  alternates: {
    canonical: WEB_PUBLIC_ROUTES.home,
  },
};

type FeaturedPublicationsResult = {
  items: HomePublicationSpotlightItem[];
  failed: boolean;
};

async function getFeaturedPublications(): Promise<FeaturedPublicationsResult> {
  try {
    const response = await listPublications(
      {
        page: 1,
        pageSize: 3,
      },
      {
        cache: 'force-cache',
        next: { revalidate },
      },
    );

    return {
      items: response.data,
      failed: false,
    };
  } catch {
    return {
      items: [],
      failed: true,
    };
  }
}

export default async function HomePage() {
  const featuredPublications = await getFeaturedPublications();

  return <HomePageShell featuredPublications={featuredPublications} />;
}
