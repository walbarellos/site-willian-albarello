// apps/api/src/lib/admin-session-store.ts

import { randomUUID } from 'node:crypto';

export const DEFAULT_ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8h

export type AdminRole = 'admin' | 'editor';

export interface AuthenticatedAdminUser {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
}

export interface AdminSessionRecord {
  id: string;
  user: AuthenticatedAdminUser;
  createdAt: number;
  expiresAt: number;
  lastAccessedAt: number;
}

export interface CreateAdminSessionInput {
  user: AuthenticatedAdminUser;
  ttlMs?: number;
  sessionId?: string;
}

export interface GetAdminSessionOptions {
  /**
   * Quando true, atualiza o lastAccessedAt ao ler a sessão.
   * Útil para auditoria leve e leitura operacional.
   */
  touch?: boolean;
}

export interface CreateAdminSessionStoreOptions {
  defaultTtlMs?: number;
  idGenerator?: () => string;
  now?: () => number;
}

export interface AdminSessionStore {
  createSession(input: CreateAdminSessionInput): Promise<AdminSessionRecord>;
  getSessionById(
    sessionId: string,
    options?: GetAdminSessionOptions,
  ): Promise<AdminSessionRecord | null>;
  deleteSession(sessionId: string): Promise<void>;
  purgeExpiredSessions(): Promise<number>;
  clear(): Promise<void>;
  size(): number;
}

function cloneUser(user: AuthenticatedAdminUser): AuthenticatedAdminUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
}

function cloneSession(session: AdminSessionRecord): AdminSessionRecord {
  return {
    id: session.id,
    user: cloneUser(session.user),
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    lastAccessedAt: session.lastAccessedAt,
  };
}

function ensureValidSessionId(sessionId: string): string {
  const normalized = sessionId.trim();

  if (!normalized) {
    throw new Error('Session id is required.');
  }

  return normalized;
}

function ensurePositiveTtl(ttlMs: number): number {
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
    throw new Error('Session TTL must be a positive finite number.');
  }

  return Math.floor(ttlMs);
}

export function createInMemoryAdminSessionStore(
  options: CreateAdminSessionStoreOptions = {},
): AdminSessionStore {
  const sessions = new Map<string, AdminSessionRecord>();
  const now = options.now ?? (() => Date.now());
  const idGenerator = options.idGenerator ?? (() => randomUUID());
  const defaultTtlMs = ensurePositiveTtl(
    options.defaultTtlMs ?? DEFAULT_ADMIN_SESSION_TTL_MS,
  );

  function purgeExpiredSessionsSync(): number {
    const currentTime = now();
    let removed = 0;

    for (const [sessionId, session] of sessions.entries()) {
      if (session.expiresAt <= currentTime) {
        sessions.delete(sessionId);
        removed += 1;
      }
    }

    return removed;
  }

  return {
    async createSession(input: CreateAdminSessionInput): Promise<AdminSessionRecord> {
      purgeExpiredSessionsSync();

      const currentTime = now();
      const ttlMs = ensurePositiveTtl(input.ttlMs ?? defaultTtlMs);
      const sessionId = ensureValidSessionId(input.sessionId ?? idGenerator());

      const session: AdminSessionRecord = {
        id: sessionId,
        user: cloneUser(input.user),
        createdAt: currentTime,
        expiresAt: currentTime + ttlMs,
        lastAccessedAt: currentTime,
      };

      sessions.set(session.id, session);

      return cloneSession(session);
    },

    async getSessionById(
      sessionId: string,
      options: GetAdminSessionOptions = {},
    ): Promise<AdminSessionRecord | null> {
      purgeExpiredSessionsSync();

      const normalizedSessionId = ensureValidSessionId(sessionId);
      const current = sessions.get(normalizedSessionId);

      if (!current) {
        return null;
      }

      if (current.expiresAt <= now()) {
        sessions.delete(normalizedSessionId);
        return null;
      }

      if (options.touch) {
        current.lastAccessedAt = now();
        sessions.set(normalizedSessionId, current);
      }

      return cloneSession(current);
    },

    async deleteSession(sessionId: string): Promise<void> {
      const normalizedSessionId = ensureValidSessionId(sessionId);
      sessions.delete(normalizedSessionId);
    },

    async purgeExpiredSessions(): Promise<number> {
      return purgeExpiredSessionsSync();
    },

    async clear(): Promise<void> {
      sessions.clear();
    },

    size(): number {
      purgeExpiredSessionsSync();
      return sessions.size;
    },
  };
}

/**
 * Instância padrão P0 do backend.
 * Em ciclos futuros, este export pode ser substituído por uma implementação
 * com Redis, banco ou outro mecanismo persistente sem quebrar as rotas.
 */
export const adminSessionStore = createInMemoryAdminSessionStore();
