// apps/admin/src/lib/session.ts

import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';

import {
  ADMIN_ROLES,
  type AdminRole,
  type AdminSessionUser,
  type SuccessSessionResponse,
} from '@william-albarello/contracts';

import {
  getCurrentAdminSession,
  isAdminApiError,
} from './api';
import {
  buildAdminLoginHref,
  buildProtectedRedirectHref,
  resolveProtectedAdminLoginHref,
} from './routes';

export { buildAdminLoginHref, buildProtectedRedirectHref } from './routes';

const DEFAULT_ALLOWED_ROLES: readonly AdminRole[] = ADMIN_ROLES;

export type ReadCurrentAdminUserServerOptions = {
  allowUnauthenticated?: boolean;
  allowedRoles?: readonly AdminRole[];
  returnTo?: string | null;
};

export type RequireAdminSessionServerOptions = {
  allowedRoles?: readonly AdminRole[];
  returnTo?: string | null;
};

function normalizeAllowedRoles(
  allowedRoles?: readonly AdminRole[],
): readonly AdminRole[] {
  if (!allowedRoles || allowedRoles.length === 0) {
    return DEFAULT_ALLOWED_ROLES;
  }

  return allowedRoles;
}

function isRoleAllowed(
  role: AdminRole,
  allowedRoles?: readonly AdminRole[],
): boolean {
  const normalizedAllowedRoles = normalizeAllowedRoles(allowedRoles);
  return normalizedAllowedRoles.includes(role);
}

function assertRoleAllowedOrRedirect(
  role: AdminRole,
  allowedRoles?: readonly AdminRole[],
): void {
  if (!isRoleAllowed(role, allowedRoles)) {
    redirect(buildProtectedRedirectHref());
  }
}

async function buildServerForwardedHeaders(): Promise<Record<string, string>> {
  const forwardedHeaders: Record<string, string> = {};

  const cookieStore = await Promise.resolve(cookies());
  const headerStore = await Promise.resolve(headers());

  const serializedCookies = cookieStore.toString();
  const traceId = headerStore.get('x-trace-id')?.trim();

  if (serializedCookies) {
    forwardedHeaders.cookie = serializedCookies;
  }

  if (traceId) {
    forwardedHeaders['x-trace-id'] = traceId;
  }

  /**
   * Ajuda observabilidade e debugging do lado da API sem inventar novo contrato.
   */
  forwardedHeaders['x-requested-with'] = 'next-server-component';

  return forwardedHeaders;
}

async function readAdminSessionFromApiUncached(): Promise<SuccessSessionResponse | null> {
  try {
    return await getCurrentAdminSession({
      headers: await buildServerForwardedHeaders(),
    });
  } catch (error: unknown) {
    if (
      isAdminApiError(error) &&
      (error.status === 401 || error.status === 403)
    ) {
      return null;
    }

    throw error;
  }
}

const readAdminSessionFromApi = cache(
  async (): Promise<SuccessSessionResponse | null> =>
    readAdminSessionFromApiUncached(),
);

export function getAdminUserFromSession(
  session: SuccessSessionResponse | null,
): AdminSessionUser | null {
  return session?.data.user ?? null;
}

/**
 * Mantido por compatibilidade com o estado atual do monorepo.
 * Agora representa a leitura server-side segura da sessão atual.
 */
export async function readAdminSession(): Promise<SuccessSessionResponse | null> {
  return readAdminSessionFromApi();
}

/**
 * Alias explícito para deixar claro o uso em server components / server actions.
 */
export async function readAdminSessionServer(): Promise<SuccessSessionResponse | null> {
  return readAdminSessionFromApi();
}

/**
 * Mantido por compatibilidade com o estado atual do monorepo.
 * Exige sessão válida e papel permitido.
 */
export async function requireAdminSession(
  allowedRoles: readonly AdminRole[] = DEFAULT_ALLOWED_ROLES,
): Promise<SuccessSessionResponse> {
  const session = await readAdminSessionFromApi();

  if (!session) {
    redirect(buildAdminLoginHref(buildProtectedRedirectHref()));
  }

  const user = session.data.user;

  assertRoleAllowedOrRedirect(user.role, allowedRoles);

  return session;
}

/**
 * Versão soberana para uso em páginas server-side do admin.
 */
export async function requireAdminSessionServer(
  options: RequireAdminSessionServerOptions = {},
): Promise<SuccessSessionResponse> {
  const { allowedRoles = DEFAULT_ALLOWED_ROLES, returnTo } = options;

  const session = await readAdminSessionFromApi();

  if (!session) {
    redirect(resolveProtectedAdminLoginHref(returnTo));
  }

  const user = session.data.user;

  assertRoleAllowedOrRedirect(user.role, allowedRoles);

  return session;
}

/**
 * Leitura direta do usuário autenticado para server components.
 * Pode operar em modo tolerante (`allowUnauthenticated: true`) ou em modo
 * protegido, redirecionando automaticamente para login.
 */
export async function readCurrentAdminUserServer(
  options: ReadCurrentAdminUserServerOptions = {},
): Promise<AdminSessionUser | null> {
  const {
    allowUnauthenticated = false,
    allowedRoles = DEFAULT_ALLOWED_ROLES,
    returnTo,
  } = options;

  const session = await readAdminSessionFromApi();

  if (!session) {
    if (allowUnauthenticated) {
      return null;
    }

    redirect(resolveProtectedAdminLoginHref(returnTo));
  }

  const user = session.data.user;

  assertRoleAllowedOrRedirect(user.role, allowedRoles);

  return user;
}
