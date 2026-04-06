// apps/web/app/sitemap.ts

import type { MetadataRoute } from 'next';

import { listPublications } from '../src/lib/api/public';

const DEFAULT_SITE_URL = 'http://localhost:3000';
const DEFAULT_REVALIDATE_SECONDS = 300;
const PAGE_SIZE = 100;

type SitemapEntry = MetadataRoute.Sitemap[number];

function resolveSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;

  try {
    return new URL(raw);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

function toAbsoluteUrl(path: string, baseUrl: URL): string {
  return new URL(path, baseUrl).toString();
}

function normalizeDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

async function getPublishedPublicationEntries(
  baseUrl: URL,
): Promise<SitemapEntry[]> {
  try {
    const firstPage = await listPublications(
      {
        page: 1,
        pageSize: PAGE_SIZE,
      },
      {
        next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
      },
    );

    const entries: SitemapEntry[] = firstPage.data.map((item) => ({
      url: toAbsoluteUrl(`/publicacoes/${item.slug}`, baseUrl),
      lastModified: normalizeDate(item.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const totalPages = firstPage.meta.totalPages;

    if (totalPages <= 1) {
      return entries;
    }

    for (let page = 2; page <= totalPages; page += 1) {
      const response = await listPublications(
        {
          page,
          pageSize: PAGE_SIZE,
        },
        {
          next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
        },
      );

      entries.push(
        ...response.data.map((item) => ({
          url: toAbsoluteUrl(`/publicacoes/${item.slug}`, baseUrl),
          lastModified: normalizeDate(item.publishedAt),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })),
      );
    }

    return entries;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = resolveSiteUrl();

  const staticEntries: SitemapEntry[] = [
    {
      url: toAbsoluteUrl('/', siteUrl),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: toAbsoluteUrl('/publicacoes', siteUrl),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  const publicationEntries = await getPublishedPublicationEntries(siteUrl);

  return [...staticEntries, ...publicationEntries];
}
