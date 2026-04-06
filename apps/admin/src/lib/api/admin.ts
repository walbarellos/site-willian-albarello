// apps/admin/src/lib/api/admin.ts

import type {
  AdminPublicationListQuery,
  AdminPublicationStatusTransitionRequest,
  ApiErrorResponse,
  CreateAdminPublicationDraftRequest,
  DashboardSummary,
  EditorialStatus,
  LoginRequest,
  LogoutSuccessResponse,
  SuccessAdminPublicationDetailResponse,
  SuccessAdminPublicationListResponse,
  SuccessDashboardResponse,
  SuccessSessionResponse,
  UpdateAdminPublicationRequest,
} from '@william-albarello/contracts';
import {
  API_ADMIN_AUTH_ROUTES,
  API_ADMIN_ROUTES,
  isAdminPublication,
  isApiErrorResponse,
  isSuccessSessionResponse,
} from '@william-albarello/contracts';

const DEFAULT_ADMIN_API_BASE_URL = 'http://localhost:3002';
const NON_CSRF_MUTATION_PATHS = new Set<string>([
  API_ADMIN_AUTH_ROUTES.login,
]);

type RecordLike = Record<string, unknown>;

type QueryPrimitive = string | number | boolean | null | undefined;
type QueryValue = QueryPrimitive | QueryPrimitive[];
type QueryRecord = Record<string, QueryValue>;

export type AdminApiRequestOptions = Omit<RequestInit, 'headers'> & {
  query?: QueryRecord;
  headers?: HeadersInit;
  includeServerCookies?: boolean;
  autoCsrf?: boolean;
};

export class AdminApiError extends Error {
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
    this.name = 'AdminApiError';
    this.status = params.status;
    this.code = params.code ?? 'ADMIN_API_ERROR';
    this.traceId = params.traceId;
    this.details = params.details;
  }
}

function isRecord(value: unknown): value is RecordLike {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
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

function isDashboardSummaryShape(value: unknown): value is DashboardSummary {
  return (
    isRecord(value) &&
    isNumber(value.drafts) &&
    isNumber(value.review) &&
    isNumber(value.readyToPublish) &&
    isNumber(value.published) &&
    isNumber(value.archived) &&
    isNumber(value.seoPending)
  );
}

function isSuccessDashboardResponse(
  value: unknown,
): value is SuccessDashboardResponse {
  return (
    isRecord(value) &&
    isDashboardSummaryShape(value.data) &&
    isMetaShape(value.meta)
  );
}

function isSuccessAdminPublicationDetailResponse(
  value: unknown,
): value is SuccessAdminPublicationDetailResponse {
  return (
    isRecord(value) &&
    isAdminPublication(value.data) &&
    isMetaShape(value.meta)
  );
}

function isSuccessAdminPublicationListResponse(
  value: unknown,
): value is SuccessAdminPublicationListResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.data) &&
    value.data.every(isAdminPublication) &&
    isPaginationMetaShape(value.meta)
  );
}

function isLogoutSuccessResponse(
  value: unknown,
): value is LogoutSuccessResponse {
  return (
    isRecord(value) &&
    isRecord(value.data) &&
    value.data.success === true &&
    isMetaShape(value.meta)
  );
}

function ensureAbsoluteUrl(input: string): string {
  try {
    return new URL(input).toString().replace(/\/+$/, '');
  } catch {
    return DEFAULT_ADMIN_API_BASE_URL;
  }
}

function normalizePositiveInteger(
  value: unknown,
  fallback: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  const normalized = Math.trunc(value);

  if (normalized < 1) {
    return fallback;
  }

  return normalized;
}

export function resolveAdminApiBaseUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_API_URL,
    process.env.ADMIN_API_URL,
    process.env.API_URL,
  ];

  const resolved = candidates.find(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );

  return ensureAbsoluteUrl(resolved?.trim() ?? DEFAULT_ADMIN_API_BASE_URL);
}

function appendQueryValue(
  params: URLSearchParams,
  key: string,
  rawValue: QueryValue,
): void {
  if (rawValue === undefined || rawValue === null) {
    return;
  }

  const values = Array.isArray(rawValue) ? rawValue : [rawValue];

  for (const value of values) {
    if (value === undefined || value === null) {
      continue;
    }

    const normalized = String(value).trim();

    if (!normalized) {
      continue;
    }

    params.append(key, normalized);
  }
}

export function buildAdminApiUrl(path: string, query?: QueryRecord): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = resolveAdminApiBaseUrl();
  const url = new URL(normalizedPath, `${baseUrl}/`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      appendQueryValue(url.searchParams, key, value);
    }
  }

  return url.toString();
}

function isServerRuntime(): boolean {
  return typeof window === 'undefined';
}

async function readServerForwardedHeaders(
  includeServerCookies: boolean,
): Promise<Headers> {
  const result = new Headers();

  if (!isServerRuntime()) {
    return result;
  }

  const nextHeadersModule = await import('next/headers');
  const cookieStore = await nextHeadersModule.cookies();
  const headerStore = await nextHeadersModule.headers();

  if (includeServerCookies) {
    const serializedCookies = cookieStore.toString();

    if (serializedCookies) {
      result.set('cookie', serializedCookies);
    }
  }

  const traceId = headerStore.get('x-trace-id')?.trim();

  if (traceId) {
    result.set('x-trace-id', traceId);
  }

  result.set('x-requested-with', 'next-server-runtime');

  return result;
}

function isMutatingMethod(method?: string): boolean {
  if (!method) {
    return false;
  }

  const normalized = method.toUpperCase();
  return (
    normalized === 'POST' ||
    normalized === 'PUT' ||
    normalized === 'PATCH' ||
    normalized === 'DELETE'
  );
}

function shouldAttachCsrfForPath(path: string): boolean {
  return !NON_CSRF_MUTATION_PATHS.has(path);
}

async function parseJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    throw new AdminApiError({
      status: response.status,
      code: 'INVALID_CONTENT_TYPE',
      message: 'Admin API returned a non-JSON response.',
    });
  }

  try {
    return (await response.json()) as unknown;
  } catch {
    throw new AdminApiError({
      status: response.status,
      code: 'INVALID_JSON',
      message: 'Admin API returned malformed JSON.',
    });
  }
}

function toAdminApiError(payload: unknown, status: number): AdminApiError {
  if (isApiErrorResponse(payload)) {
    return new AdminApiError({
      status,
      code: payload.error.code,
      message: payload.error.message,
      traceId: payload.meta.traceId,
      details: payload.error.details,
    });
  }

  return new AdminApiError({
    status,
    code: 'UNEXPECTED_API_ERROR',
    message: 'Admin API returned an unexpected error payload.',
  });
}

async function readCsrfToken(
  options: AdminApiRequestOptions,
): Promise<string | undefined> {
  /**
   * O token CSRF só é útil para mutações com sessão já existente.
   * Se a leitura da sessão falhar com 401/403, apenas seguimos sem token.
   */
  try {
    const session = await requestAdminApiInternal(
      API_ADMIN_AUTH_ROUTES.session,
      isSuccessSessionResponse,
      {
        method: 'GET',
        cache: 'no-store',
        includeServerCookies: options.includeServerCookies ?? false,
        autoCsrf: false,
        headers: options.headers,
      },
    );

    return session.data.csrfToken;
  } catch (error: unknown) {
    if (
      isAdminApiError(error) &&
      (error.status === 401 || error.status === 403)
    ) {
      return undefined;
    }

    throw error;
  }
}

async function buildRequestHeaders(
  path: string,
  options: AdminApiRequestOptions,
): Promise<Headers> {
  const headers = new Headers();

  headers.set('accept', 'application/json');

  const forwardedHeaders = await readServerForwardedHeaders(
    options.includeServerCookies ?? false,
  );

  forwardedHeaders.forEach((value, key) => {
    headers.set(key, value);
  });

  if (options.headers) {
    new Headers(options.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const hasBody =
  options.body !== undefined && options.body !== null && options.body !== '';

  if (hasBody && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const method = (options.method ?? 'GET').toUpperCase();
  const shouldAutoAttachCsrf =
  options.autoCsrf !== false &&
  isMutatingMethod(method) &&
  shouldAttachCsrfForPath(path) &&
  !headers.has('x-csrf-token');

  if (shouldAutoAttachCsrf) {
    /**
     * Não tentamos forçar CSRF em login se ainda não houver sessão.
     * Mesmo assim, a leitura abaixo é segura: se não houver sessão, seguimos sem token.
     */
    const csrfToken = await readCsrfToken({
      ...options,
      method: 'GET',
      autoCsrf: false,
    });

    if (csrfToken) {
      headers.set('x-csrf-token', csrfToken);
    }
  }

  return headers;
}

async function requestAdminApiInternal<T>(
  path: string,
  validator: (payload: unknown) => payload is T,
                                          options: AdminApiRequestOptions = {},
): Promise<T> {
  const { query, ...restOptions } = options;

  let response: Response;

  try {
    response = await fetch(buildAdminApiUrl(path, query), {
      cache: 'no-store',
      credentials: 'include',
      ...restOptions,
      headers: await buildRequestHeaders(path, restOptions),
    });
  } catch {
    throw new AdminApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Unable to reach the admin API.',
    });
  }

  const payload = await parseJson(response);

  if (!response.ok) {
    throw toAdminApiError(payload, response.status);
  }

  if (!validator(payload)) {
    throw new AdminApiError({
      status: response.status,
      code: 'INVALID_RESPONSE_SHAPE',
      message: 'Admin API returned an unexpected success payload.',
    });
  }

  return payload;
}

async function requestAdminApi<T>(
  path: string,
  validator: (payload: unknown) => payload is T,
                                  options: AdminApiRequestOptions = {},
): Promise<T> {
  return requestAdminApiInternal(path, validator, options);
}

export async function loginAdmin(
  input: LoginRequest,
  options: AdminApiRequestOptions = {},
): Promise<SuccessSessionResponse> {
  return requestAdminApi(API_ADMIN_AUTH_ROUTES.login, isSuccessSessionResponse, {
    ...options,
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function logoutAdmin(
  options: AdminApiRequestOptions = {},
): Promise<LogoutSuccessResponse> {
  return requestAdminApi(API_ADMIN_AUTH_ROUTES.logout, isLogoutSuccessResponse, {
    ...options,
    method: 'POST',
  });
}

export async function getCurrentAdminSession(
  options: AdminApiRequestOptions = {},
): Promise<SuccessSessionResponse> {
  return requestAdminApi(
    API_ADMIN_AUTH_ROUTES.session,
    isSuccessSessionResponse,
    {
      ...options,
      autoCsrf: false,
    },
  );
}

export async function getDashboardSummary(
  options: AdminApiRequestOptions = {},
): Promise<SuccessDashboardResponse> {
  return requestAdminApi(API_ADMIN_ROUTES.dashboard, isSuccessDashboardResponse, {
    ...options,
    autoCsrf: false,
  });
}

export async function listAdminPublications(
  query: AdminPublicationListQuery = {},
  options: AdminApiRequestOptions = {},
): Promise<SuccessAdminPublicationListResponse> {
  const page = normalizePositiveInteger(query.page, 1);
  const pageSize = Math.min(50, normalizePositiveInteger(query.pageSize, 12));
  const normalizedQuery = query.q?.trim();

  return requestAdminApi(
    API_ADMIN_ROUTES.publications,
    isSuccessAdminPublicationListResponse,
    {
      ...options,
      autoCsrf: false,
      query: {
        page,
        pageSize,
        q: normalizedQuery && normalizedQuery.length > 0 ? normalizedQuery : undefined,
        status: query.status,
      },
    },
  );
}

export async function getAdminPublicationById(
  id: string,
  options: AdminApiRequestOptions = {},
): Promise<SuccessAdminPublicationDetailResponse> {
  return requestAdminApi(
    API_ADMIN_ROUTES.publicationById(id),
                         isSuccessAdminPublicationDetailResponse,
                         {
                           ...options,
                           autoCsrf: false,
                         },
  );
}

export async function createAdminPublicationDraft(
  input: CreateAdminPublicationDraftRequest,
  options: AdminApiRequestOptions = {},
): Promise<SuccessAdminPublicationDetailResponse> {
  return requestAdminApi(
    API_ADMIN_ROUTES.publications,
    isSuccessAdminPublicationDetailResponse,
    {
      ...options,
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export async function updateAdminPublication(
  id: string,
  input: UpdateAdminPublicationRequest,
  options: AdminApiRequestOptions = {},
): Promise<SuccessAdminPublicationDetailResponse> {
  return requestAdminApi(
    API_ADMIN_ROUTES.publicationById(id),
                         isSuccessAdminPublicationDetailResponse,
                         {
                           ...options,
                           method: 'PATCH',
                           body: JSON.stringify(input),
                         },
  );
}

export async function transitionAdminPublicationStatus(
  id: string,
  input: AdminPublicationStatusTransitionRequest | EditorialStatus,
  options: AdminApiRequestOptions = {},
): Promise<SuccessAdminPublicationDetailResponse> {
  const normalizedInput =
  typeof input === 'string'
  ? { status: input }
  : input;

  return requestAdminApi(
    API_ADMIN_ROUTES.publicationStatus(id),
                         isSuccessAdminPublicationDetailResponse,
                         {
                           ...options,
                           method: 'PATCH',
                           body: JSON.stringify(normalizedInput),
                         },
  );
}

export function isAdminApiError(error: unknown): error is AdminApiError {
  return error instanceof AdminApiError;
}
