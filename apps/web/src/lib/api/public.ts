// apps/web/src/lib/api/public.ts

import type {
  ApiErrorResponse,
  PublicPublicationDetail,
  PublicPublicationListItem,
  PublicPublicationListQuery,
  SuccessPublicPublicationDetailResponse,
  SuccessPublicPublicationListResponse,
} from '@william-albarello/contracts';
import { API_PUBLIC_ROUTES } from '@william-albarello/contracts';

const DEFAULT_PUBLIC_API_BASE_URL = 'http://localhost:3002';

export class PublicApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly traceId?: string;
  readonly details?: ApiErrorResponse['error']['details'];

  constructor(params: {
    message: string;
    status: number;
    code?: string;
    traceId?: string;
    details?: ApiErrorResponse['error']['details'];
  }) {
    super(params.message);
    this.name = 'PublicApiError';
    this.status = params.status;
    this.code = params.code ?? 'PUBLIC_API_ERROR';
    this.traceId = params.traceId;
    this.details = params.details;
  }
}

type RecordLike = Record<string, unknown>;

type RawPublicPublicationListItem = Omit<
  PublicPublicationListItem,
  'readingTimeMinutes'
> & {
  readingTimeMinutes?: number | null;
};

type RawPublicPublicationDetail = RawPublicPublicationListItem & {
  content: string;
};

type RawSuccessPublicPublicationListResponse = {
  data: RawPublicPublicationListItem[];
  meta: {
    traceId: string;
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

type RawSuccessPublicPublicationDetailResponse = {
  data: RawPublicPublicationDetail;
  meta: {
    traceId: string;
  };
};

function isRecord(value: unknown): value is RecordLike {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isMetaShape(value: unknown): value is { traceId: string } {
  return isRecord(value) && isString(value.traceId);
}

function isPaginationMetaShape(
  value: unknown,
): value is {
  traceId: string;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
} {
  return (
    isRecord(value) &&
    isString(value.traceId) &&
    isNumber(value.page) &&
    isNumber(value.pageSize) &&
    isNumber(value.totalItems) &&
    isNumber(value.totalPages)
  );
}

function isSeoShape(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.metaTitle === undefined || isString(value.metaTitle)) &&
    (value.metaDescription === undefined || isString(value.metaDescription)) &&
    (value.canonicalUrl === undefined || isString(value.canonicalUrl)) &&
    (value.ogTitle === undefined || isString(value.ogTitle)) &&
    (value.ogDescription === undefined || isString(value.ogDescription)) &&
    (value.ogImageUrl === undefined || isString(value.ogImageUrl))
  );
}

function isRawPublicPublicationListItemShape(
  value: unknown,
): value is RawPublicPublicationListItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.title) &&
    isString(value.slug) &&
    isString(value.summary) &&
    isString(value.publishedAt) &&
    (value.readingTimeMinutes === undefined ||
      value.readingTimeMinutes === null ||
      isNumber(value.readingTimeMinutes)) &&
    (value.seo === undefined || isSeoShape(value.seo))
  );
}

function isRawPublicPublicationDetailShape(
  value: unknown,
): value is RawPublicPublicationDetail {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isRawPublicPublicationListItemShape(value) &&
    'content' in value &&
    isString(value.content)
  );
}

function isRawSuccessPublicPublicationListResponseShape(
  value: unknown,
): value is RawSuccessPublicPublicationListResponse {
  if (
    !isRecord(value) ||
    !Array.isArray(value.data) ||
    !isPaginationMetaShape(value.meta)
  ) {
    return false;
  }

  return value.data.every(isRawPublicPublicationListItemShape);
}

function isRawSuccessPublicPublicationDetailResponseShape(
  value: unknown,
): value is RawSuccessPublicPublicationDetailResponse {
  return (
    isRecord(value) &&
    isMetaShape(value.meta) &&
    isRawPublicPublicationDetailShape(value.data)
  );
}

function isApiErrorResponseShape(value: unknown): value is ApiErrorResponse {
  if (!isRecord(value) || !isRecord(value.error) || !isMetaShape(value.meta)) {
    return false;
  }

  return isString(value.error.code) && isString(value.error.message);
}

function ensureAbsoluteUrl(input: string): string {
  try {
    return new URL(input).toString().replace(/\/+$/, '');
  } catch {
    return DEFAULT_PUBLIC_API_BASE_URL;
  }
}

function normalizePublicationListItem(
  item: RawPublicPublicationListItem,
): PublicPublicationListItem {
  return {
    ...item,
    readingTimeMinutes: item.readingTimeMinutes ?? undefined,
  };
}

function normalizePublicationDetail(
  item: RawPublicPublicationDetail,
): PublicPublicationDetail {
  const { content, ...rest } = item;

  return {
    ...normalizePublicationListItem(rest),
    content,
  };
}

export function resolvePublicApiBaseUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_API_URL,
    process.env.PUBLIC_API_URL,
    process.env.API_URL,
  ];

  const resolved = candidates.find(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );

  return ensureAbsoluteUrl(resolved?.trim() ?? DEFAULT_PUBLIC_API_BASE_URL);
}

export function buildPublicApiUrl(
  path: string,
  query?: Record<string, string | number | undefined>,
): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${resolvePublicApiBaseUrl()}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === '') {
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function parseJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    throw new PublicApiError({
      status: response.status,
      code: 'INVALID_CONTENT_TYPE',
      message: 'Public API returned a non-JSON response.',
    });
  }

  try {
    return (await response.json()) as unknown;
  } catch {
    throw new PublicApiError({
      status: response.status,
      code: 'INVALID_JSON',
      message: 'Public API returned malformed JSON.',
    });
  }
}

function toPublicApiError(payload: unknown, status: number): PublicApiError {
  if (isApiErrorResponseShape(payload)) {
    return new PublicApiError({
      status,
      code: payload.error.code,
      message: payload.error.message,
      traceId: payload.meta.traceId,
      details: payload.error.details,
    });
  }

  return new PublicApiError({
    status,
    code: 'UNEXPECTED_API_ERROR',
    message: 'Public API returned an unexpected error payload.',
  });
}

async function requestPublicApi<T>(
  path: string,
  validator: (payload: unknown) => payload is T,
  init?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildPublicApiUrl(path), {
      method: 'GET',
      cache: 'no-store',
      ...init,
      headers: (() => {
        const headers = new Headers(init?.headers);
        headers.set('accept', 'application/json');
        return headers;
      })(),
    });
  } catch {
    throw new PublicApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Unable to reach the public API.',
    });
  }

  const payload = await parseJson(response);

  if (!response.ok) {
    throw toPublicApiError(payload, response.status);
  }

  if (!validator(payload)) {
    throw new PublicApiError({
      status: response.status,
      code: 'INVALID_RESPONSE_SHAPE',
      message: 'Public API returned an unexpected success payload.',
    });
  }

  return payload;
}

export async function listPublications(
  query: PublicPublicationListQuery = {},
  init?: RequestInit,
): Promise<SuccessPublicPublicationListResponse> {
  const page =
    typeof query.page === 'number' && Number.isFinite(query.page) && query.page >= 1
      ? Math.trunc(query.page)
      : 1;
  const pageSize =
    typeof query.pageSize === 'number' &&
    Number.isFinite(query.pageSize) &&
    query.pageSize >= 1
      ? Math.min(50, Math.trunc(query.pageSize))
      : 12;
  const q = query.q?.trim();
  const category = query.category?.trim();
  const tag = query.tag?.trim();

  const endpointUrl = new URL(buildPublicApiUrl(API_PUBLIC_ROUTES.publications, {
    page,
    pageSize,
    q: q || undefined,
    category: category || undefined,
    tag: tag || undefined,
  }));

  const requestPath = `${endpointUrl.pathname}${endpointUrl.search}`;

  const raw = await requestPublicApi(
    requestPath,
    isRawSuccessPublicPublicationListResponseShape,
    init,
  );

  return {
    data: raw.data.map(normalizePublicationListItem),
    meta: raw.meta,
  };
}

export async function getPublicationBySlug(
  slug: string,
  init?: RequestInit,
): Promise<SuccessPublicPublicationDetailResponse> {
  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    throw new PublicApiError({
      status: 400,
      code: 'INVALID_SLUG',
      message: 'Publication slug is required.',
    });
  }

  const raw = await requestPublicApi(
    API_PUBLIC_ROUTES.publicationDetail(normalizedSlug),
    isRawSuccessPublicPublicationDetailResponseShape,
    init,
  );

  return {
    data: normalizePublicationDetail(raw.data),
    meta: raw.meta,
  };
}

export function isPublicApiError(error: unknown): error is PublicApiError {
  return error instanceof PublicApiError;
}
