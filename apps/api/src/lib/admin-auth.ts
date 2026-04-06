// apps/api/src/lib/admin-auth.ts

import { timingSafeEqual } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { env } from './env.js';
import {
  adminSessionStore,
  DEFAULT_ADMIN_SESSION_TTL_MS,
  type AdminRole,
  type AdminSessionRecord,
  type AuthenticatedAdminUser,
} from './admin-session-store.js';

export const ADMIN_SESSION_COOKIE_NAME = 'wa_admin_session';
export const DEFAULT_ALLOWED_ADMIN_ROLES: AdminRole[] = ['admin', 'editor'];

type CookieRequest = FastifyRequest & {
  unsignCookie?: (value: string) => { valid: boolean; value: string };
};

type CsrfReply = FastifyReply & {
  generateCsrf?: () => string;
};

export interface AdminBootstrapCredentials {
  email: string;
  password: string;
  displayName: string;
  role: AdminRole;
}

export interface AdminLoginCredentialsInput {
  email: string;
  password: string;
}

export interface AdminAuthErrorDetail {
  field?: string;
  issue: string;
}

export interface AdminAuthErrorPayload {
  error: {
    code: string;
    message: string;
    details?: AdminAuthErrorDetail[];
  };
  meta: {
    traceId: string;
  };
}

export interface AdminSessionSuccessPayload {
  data: {
    user: AuthenticatedAdminUser;
    csrfToken?: string;
  };
  meta: {
    traceId: string;
  };
}

export interface ReadAdminSessionOptions {
  touch?: boolean;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function parseAdminRole(rawValue: string | undefined): AdminRole {
  const normalized = rawValue?.trim();

  if (!normalized || normalized === 'admin') {
    return 'admin';
  }

  if (normalized === 'editor') {
    return 'editor';
  }

  throw new Error('Invalid ADMIN_BOOTSTRAP_ROLE. Use "admin" or "editor".');
}

function loadBootstrapCredentials(): AdminBootstrapCredentials {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  const displayName =
    process.env.ADMIN_BOOTSTRAP_DISPLAY_NAME?.trim() || 'Administrador';
  const role = parseAdminRole(process.env.ADMIN_BOOTSTRAP_ROLE);

  if (email && password) {
    return {
      email,
      password,
      displayName,
      role,
    };
  }

  if (env.IS_PROD) {
    throw new Error(
      'Missing ADMIN_BOOTSTRAP_EMAIL or ADMIN_BOOTSTRAP_PASSWORD in production.',
    );
  }

  return {
    email: 'admin@local.test',
    password: 'ChangeMe123!',
    displayName,
    role,
  };
}

/**
 * Fail-closed em produção: a ausência de credenciais bootstrap deve impedir
 * que o backend suba sem configuração mínima explícita.
 */
export const adminBootstrapCredentials = loadBootstrapCredentials();

export function getRequestMeta(request: FastifyRequest): {
  traceId: string;
} {
  return {
    traceId: request.id,
  };
}

export function buildAdminAuthErrorPayload(
  request: FastifyRequest,
  code: string,
  message: string,
  details?: AdminAuthErrorDetail[],
): AdminAuthErrorPayload {
  return {
    error: {
      code,
      message,
      ...(details && details.length > 0 ? { details } : {}),
    },
    meta: getRequestMeta(request),
  };
}

export function sendUnauthenticated(
  request: FastifyRequest,
  reply: FastifyReply,
  message = 'No active administrative session was found.',
): FastifyReply {
  return reply.status(401).send(
    buildAdminAuthErrorPayload(request, 'SESSION_EXPIRED', message),
  );
}

export function sendForbidden(
  request: FastifyRequest,
  reply: FastifyReply,
  message = 'You do not have permission to access this resource.',
): FastifyReply {
  return reply
    .status(403)
    .send(buildAdminAuthErrorPayload(request, 'FORBIDDEN', message));
}

export function getSignedAdminSessionId(
  request: FastifyRequest,
): string | null {
  const cookieRequest = request as CookieRequest;
  const rawCookie = request.cookies[ADMIN_SESSION_COOKIE_NAME];

  if (!rawCookie) {
    return null;
  }

  if (typeof cookieRequest.unsignCookie !== 'function') {
    return rawCookie;
  }

  const unsigned = cookieRequest.unsignCookie(rawCookie);

  if (!unsigned.valid || !unsigned.value) {
    return null;
  }

  return unsigned.value;
}

export function setAdminSessionCookie(
  reply: FastifyReply,
  sessionId: string,
  ttlMs = DEFAULT_ADMIN_SESSION_TTL_MS,
): void {
  reply.setCookie(ADMIN_SESSION_COOKIE_NAME, sessionId, {
    path: '/',
    httpOnly: true,
    signed: true,
    sameSite: 'strict',
    secure: env.IS_PROD,
    maxAge: Math.floor(ttlMs / 1000),
  });
}

export function clearAdminSessionCookie(reply: FastifyReply): void {
  reply.clearCookie(ADMIN_SESSION_COOKIE_NAME, {
    path: '/',
    httpOnly: true,
    signed: true,
    sameSite: 'strict',
    secure: env.IS_PROD,
  });
}

export function getCsrfToken(reply: FastifyReply): string | undefined {
  const csrfReply = reply as CsrfReply;

  if (typeof csrfReply.generateCsrf !== 'function') {
    return undefined;
  }

  return csrfReply.generateCsrf();
}

export function buildAdminSessionSuccessPayload(
  request: FastifyRequest,
  reply: FastifyReply,
  user: AuthenticatedAdminUser,
): AdminSessionSuccessPayload {
  return {
    data: {
      user,
      csrfToken: getCsrfToken(reply),
    },
    meta: getRequestMeta(request),
  };
}

export async function authenticateBootstrapAdminCredentials(
  credentials: AdminLoginCredentialsInput,
): Promise<AuthenticatedAdminUser | null> {
  const normalizedEmail = normalizeEmail(credentials.email);
  const password = credentials.password;

  const emailMatches = normalizedEmail === adminBootstrapCredentials.email;
  const passwordMatches = safeCompare(
    password,
    adminBootstrapCredentials.password,
  );

  if (!emailMatches || !passwordMatches) {
    return null;
  }

  return {
    id: 'bootstrap-admin',
    email: adminBootstrapCredentials.email,
    displayName: adminBootstrapCredentials.displayName,
    role: adminBootstrapCredentials.role,
  };
}

export async function createAdminSessionForUser(
  user: AuthenticatedAdminUser,
  ttlMs = DEFAULT_ADMIN_SESSION_TTL_MS,
): Promise<AdminSessionRecord> {
  return adminSessionStore.createSession({
    user,
    ttlMs,
  });
}

export async function deleteAdminSessionById(
  sessionId: string,
): Promise<void> {
  await adminSessionStore.deleteSession(sessionId);
}

export async function readCurrentAdminSession(
  request: FastifyRequest,
  reply: FastifyReply,
  options: ReadAdminSessionOptions = {},
): Promise<AdminSessionRecord | null> {
  const sessionId = getSignedAdminSessionId(request);

  if (!sessionId) {
    clearAdminSessionCookie(reply);
    return null;
  }

  const session = await adminSessionStore.getSessionById(sessionId, {
    touch: options.touch ?? true,
  });

  if (!session) {
    clearAdminSessionCookie(reply);
    return null;
  }

  return session;
}

export async function requireAdminSession(
  request: FastifyRequest,
  reply: FastifyReply,
  allowedRoles: AdminRole[] = DEFAULT_ALLOWED_ADMIN_ROLES,
): Promise<AdminSessionRecord | FastifyReply> {
  const session = await readCurrentAdminSession(request, reply, {
    touch: true,
  });

  if (!session) {
    return sendUnauthenticated(request, reply);
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
    return sendForbidden(request, reply);
  }

  return session;
}

export function isAuthenticatedAdminUser(
  value: unknown,
): value is AuthenticatedAdminUser {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<AuthenticatedAdminUser>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.displayName === 'string' &&
    (candidate.role === 'admin' || candidate.role === 'editor')
  );
}
