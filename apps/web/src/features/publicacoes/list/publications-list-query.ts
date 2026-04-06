import {
  buildPublicationsHref,
  type PublicPublicationsRouteQuery,
} from '../../../lib/routes';

export const DEFAULT_PUBLICATIONS_PAGE = 1;
export const DEFAULT_PUBLICATIONS_PAGE_SIZE = 12;

export type PublicationsListRawSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type PublicationsListQueryState = {
  q?: string;
  page: number;
  pageSize: number;
  category?: string;
  tag?: string;
};

function getSingleSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeOptionalText(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

function normalizePositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  const normalized = Math.floor(parsed);
  return normalized >= 1 ? normalized : fallback;
}

function normalizePageSize(value: string | undefined, fallback: number): number {
  const normalized = normalizePositiveInteger(value, fallback);
  return Math.min(50, normalized);
}

export function normalizePublicationsListQuery(
  raw: PublicationsListRawSearchParams,
  defaults: {
    page?: number;
    pageSize?: number;
  } = {},
): PublicationsListQueryState {
  const defaultPage = defaults.page ?? DEFAULT_PUBLICATIONS_PAGE;
  const defaultPageSize = defaults.pageSize ?? DEFAULT_PUBLICATIONS_PAGE_SIZE;

  const q = normalizeOptionalText(getSingleSearchParam(raw.q));
  const category = normalizeOptionalText(getSingleSearchParam(raw.category));
  const tag = normalizeOptionalText(getSingleSearchParam(raw.tag));
  const page = normalizePositiveInteger(getSingleSearchParam(raw.page), defaultPage);
  const pageSize = normalizePageSize(
    getSingleSearchParam(raw.pageSize),
    defaultPageSize,
  );

  return {
    q,
    page,
    pageSize,
    category,
    tag,
  };
}

export function toPublicationsRouteQuery(
  query: PublicationsListQueryState,
): PublicPublicationsRouteQuery {
  return {
    q: query.q,
    page: query.page,
    pageSize: query.pageSize,
    category: query.category,
    tag: query.tag,
  };
}

export function serializePublicationsListHref(
  query: PublicationsListQueryState,
): string {
  return buildPublicationsHref(toPublicationsRouteQuery(query));
}
