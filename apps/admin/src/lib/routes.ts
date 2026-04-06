// apps/admin/src/lib/routes.ts

import {
  ADMIN_APP_ROUTES,
  type EditorialStatusRouteFilter,
} from '@william-albarello/contracts';

export type AdminRouteQueryPrimitive =
  | string
  | number
  | boolean
  | null
  | undefined;

export type AdminRouteQueryValue =
  | AdminRouteQueryPrimitive
  | AdminRouteQueryPrimitive[];

export type AdminRouteQuery = Record<string, AdminRouteQueryValue>;

function stripHash(value: string): string {
  const hashIndex = value.indexOf('#');
  return hashIndex === -1 ? value : value.slice(0, hashIndex);
}

function normalizeRelativePath(input?: string | null): string | null {
  if (!input) {
    return null;
  }

  const trimmed = stripHash(input.trim());

  if (!trimmed) {
    return null;
  }

  if (!trimmed.startsWith('/')) {
    return null;
  }

  if (trimmed.startsWith('//')) {
    return null;
  }

  return trimmed;
}

function stripQuery(value: string): string {
  const queryIndex = value.indexOf('?');
  return queryIndex === -1 ? value : value.slice(0, queryIndex);
}

function isAllowedAdminNextPath(pathname: string): boolean {
  if (pathname === ADMIN_ROUTES.entry) {
    return true;
  }

  if (pathname === ADMIN_ROUTES.dashboard) {
    return true;
  }

  if (pathname === ADMIN_ROUTES.publications) {
    return true;
  }

  return /^\/painel\/publicacoes\/[^/]+\/editar$/.test(pathname);
}

export type AdminPublicationsRouteQuery = {
  q?: string;
  page?: number;
  pageSize?: number;
  status?: EditorialStatusRouteFilter;
};

export const ADMIN_ROUTES = ADMIN_APP_ROUTES;

export type AdminStaticRoute =
  | typeof ADMIN_ROUTES.entry
  | typeof ADMIN_ROUTES.login
  | typeof ADMIN_ROUTES.dashboard
  | typeof ADMIN_ROUTES.publications
  | typeof ADMIN_ROUTES.protectedDefaultRedirect;

export type AdminPublicationEditRoute = ReturnType<
  typeof ADMIN_ROUTES.publicationEdit
>;

export function isAdminLoginPath(pathname?: string | null): boolean {
  return normalizeRelativePath(pathname) === ADMIN_ROUTES.login;
}

export function isAdminEntryPath(pathname?: string | null): boolean {
  return normalizeRelativePath(pathname) === ADMIN_ROUTES.entry;
}

export function isAdminPublicationsPath(pathname?: string | null): boolean {
  return normalizeRelativePath(pathname) === ADMIN_ROUTES.publications;
}

export function isAdminPublicationEditPath(pathname?: string | null): boolean {
  const normalized = normalizeRelativePath(pathname);

  if (!normalized) {
    return false;
  }

  return /^\/painel\/publicacoes\/[^/]+\/editar(?:\?.*)?$/.test(normalized);
}

export function buildAdminEntryHref(): typeof ADMIN_ROUTES.entry {
  return ADMIN_ROUTES.entry;
}

export function buildAdminLoginHref(next?: string | null): string {
  const safeNext = getSafeAdminNextPath(next);
  return ADMIN_ROUTES.loginWithNext(safeNext ?? undefined);
}

export function buildAdminDashboardHref(): typeof ADMIN_ROUTES.dashboard {
  return ADMIN_ROUTES.dashboard;
}

export function buildAdminPublicationsHref(
  query?: AdminPublicationsRouteQuery,
): string {
  return ADMIN_ROUTES.publicationsWithQuery(query);
}

export function buildAdminPublicationEditHref(id: string): string {
  return ADMIN_ROUTES.publicationEdit(id);
}

export function buildProtectedRedirectHref(): string {
  return ADMIN_ROUTES.protectedDefaultRedirect;
}

export function getSafeAdminNextPath(input?: string | null): string | null {
  const normalized = normalizeRelativePath(input);

  if (!normalized) {
    return null;
  }

  const pathname = stripQuery(normalized);

  if (pathname === ADMIN_ROUTES.login) {
    return null;
  }

  if (pathname.startsWith('/api/')) {
    return null;
  }

  if (!isAllowedAdminNextPath(pathname)) {
    return null;
  }

  return normalized;
}

export function resolveAdminPostLoginHref(next?: string | null): string {
  return getSafeAdminNextPath(next) ?? buildProtectedRedirectHref();
}

export function resolveProtectedAdminLoginHref(
  attemptedPath?: string | null,
): string {
  const safeAttemptedPath = getSafeAdminNextPath(attemptedPath);
  return buildAdminLoginHref(safeAttemptedPath);
}
