// apps/web/app/robots.ts

import type { MetadataRoute } from 'next';

const DEFAULT_SITE_URL = 'http://localhost:3000';

function resolveSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;

  try {
    return new URL(raw);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = resolveSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/publicacoes', '/publicacoes/*'],
        disallow: [
          '/admin',
          '/admin/*',
          '/painel',
          '/painel/*',
          '/api',
          '/api/*',
        ],
      },
    ],
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
    host: siteUrl.origin,
  };
}
