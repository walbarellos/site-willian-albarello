// apps/web/src/lib/routes.ts

export type PublicPublicationsRouteQuery = {
  q?: string;
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
};

type QueryPrimitive = string | number | boolean | null | undefined;
type QueryValue = QueryPrimitive | QueryPrimitive[];
type QueryRecord = Record<string, QueryValue>;

function encodePathSegment(value: string): string {
  return encodeURIComponent(value.trim());
}

function normalizeSlug(slug: string): string {
  const normalized = slug.trim();

  if (!normalized) {
    throw new Error('Slug de publicação inválido.');
  }

  return normalized;
}

function normalizeNumericQueryValue(
  key: string,
  rawValue: QueryPrimitive,
): string | null {
  if (rawValue === undefined || rawValue === null) {
    return null;
  }

  if (key !== 'page' && key !== 'pageSize') {
    return String(rawValue).trim() || null;
  }

  const numericValue =
    typeof rawValue === 'number'
      ? rawValue
      : Number(String(rawValue).trim());

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  const normalizedInteger = Math.trunc(numericValue);

  if (normalizedInteger < 1) {
    return null;
  }

  if (key === 'pageSize') {
    return String(Math.min(50, normalizedInteger));
  }

  return String(normalizedInteger);
}

function buildQueryString(query?: QueryRecord): string {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue === undefined || rawValue === null) {
      continue;
    }

    const values = Array.isArray(rawValue) ? rawValue : [rawValue];

    for (const value of values) {
      const normalized = normalizeNumericQueryValue(key, value);

      if (!normalized) {
        continue;
      }

      params.append(key, normalized);
    }
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

function withQuery(path: string, query?: QueryRecord): string {
  return `${path}${buildQueryString(query)}`;
}

export const WEB_PUBLIC_ROUTES = {
  home: '/',
  publications: '/publicacoes',
  publicationDetail: (slug: string) =>
    `/publicacoes/${encodePathSegment(normalizeSlug(slug))}` as const,
  publicationsWithQuery: (query?: PublicPublicationsRouteQuery) =>
    withQuery('/publicacoes', query),
} as const;

export type WebPublicStaticPath =
  | typeof WEB_PUBLIC_ROUTES.home
  | typeof WEB_PUBLIC_ROUTES.publications;

export type WebPublicPublicationDetailPath = ReturnType<
  typeof WEB_PUBLIC_ROUTES.publicationDetail
>;

export function buildPublicationsHref(
  query?: PublicPublicationsRouteQuery,
): string {
  return WEB_PUBLIC_ROUTES.publicationsWithQuery(query);
}

export function buildPublicationDetailHref(slug: string): string {
  return WEB_PUBLIC_ROUTES.publicationDetail(slug);
}
