// apps/web/app/publicacoes/[slug]/page.tsx

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import type { PublicPublicationDetail } from '@william-albarello/contracts';
import {
  getPublicationBySlug,
  isPublicApiError,
} from '../../../src/lib/api/public';
import { buildPublicationDetailHref } from '../../../src/lib/routes';
import {
  PublicationDetailErrorState,
  PublicationDetailShell,
} from '../../../src/features/publicacoes/detail';

export const revalidate = 300;

const SITE_NAME = 'William Albarello';
const DEFAULT_SITE_URL = 'http://localhost:3000';

type PageParams = {
  slug: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

type PublicationLoadResult =
  | { kind: 'ok'; publication: PublicPublicationDetail }
  | { kind: 'not_found' }
  | { kind: 'error'; message: string };

function resolveSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;

  try {
    return new URL(raw);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

function getCanonicalPath(slug: string): string {
  return buildPublicationDetailHref(slug);
}

function getSafeString(value?: string | null): string {
  return value?.trim() ?? '';
}

async function loadPublication(slug: string): Promise<PublicationLoadResult> {
  try {
    const response = await getPublicationBySlug(slug, {
      next: { revalidate },
    });

    return {
      kind: 'ok',
      publication: response.data,
    };
  } catch (error) {
    if (isPublicApiError(error)) {
      if (error.status === 404 || error.status === 422) {
        return { kind: 'not_found' };
      }

      return {
        kind: 'error',
        message: error.message,
      };
    }

    return {
      kind: 'error',
      message:
        'Ocorreu uma falha inesperada ao carregar esta publicação pública.',
    };
  }
}

function buildMetadataFromPublication(
  publication: PublicPublicationDetail,
): Metadata {
  const siteUrl = resolveSiteUrl();
  const canonical =
    getSafeString(publication.seo?.canonicalUrl) ||
    getCanonicalPath(publication.slug);

  const title = getSafeString(publication.seo?.metaTitle) || publication.title;
  const description =
    getSafeString(publication.seo?.metaDescription) || publication.summary;
  const ogTitle = getSafeString(publication.seo?.ogTitle) || title;
  const ogDescription =
    getSafeString(publication.seo?.ogDescription) || description;
  const ogImage = getSafeString(publication.seo?.ogImageUrl);

  const canonicalUrl =
    canonical.startsWith('http://') || canonical.startsWith('https://')
      ? canonical
      : new URL(canonical, siteUrl).toString();

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      locale: 'pt_BR',
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      publishedTime: publication.publishedAt ?? undefined,
      modifiedTime: publication.updatedAt ?? undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.trim();

  if (!slug) {
    return {
      title: 'Publicacao nao encontrada',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const result = await loadPublication(slug);

  if (result.kind === 'not_found') {
    return {
      title: 'Publicacao nao encontrada',
      description:
        'A publicacao solicitada nao esta disponivel na camada publica.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  if (result.kind === 'error') {
    const canonicalUrl = new URL(getCanonicalPath(slug), resolveSiteUrl()).toString();

    return {
      title: 'Publicacao',
      description:
        'Leitura publica da producao editorial disponivel no site institucional.',
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  return buildMetadataFromPublication(result.publication);
}

export default async function PublicationDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.trim();

  if (!slug) {
    notFound();
  }

  const result = await loadPublication(slug);

  if (result.kind === 'not_found') {
    notFound();
  }

  if (result.kind === 'error') {
    return <PublicationDetailErrorState message={result.message} />;
  }

  return <PublicationDetailShell publication={result.publication} />;
}
