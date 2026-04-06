// apps/api/src/routes/auth.ts

import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import {
  authenticateBootstrapAdminCredentials,
  buildAdminSessionSuccessPayload,
  clearAdminSessionCookie,
  createAdminSessionForUser,
  deleteAdminSessionById,
  getSignedAdminSessionId,
  readCurrentAdminSession,
  setAdminSessionCookie,
} from '../lib/admin-auth.js';
import {
  mapZodIssuesToErrorDetails,
  sendError,
  sendSuccess,
  sendValidationError,
} from '../lib/http-contract.js';

export const LOGIN_PATH = '/v1/admin/auth/login';
export const LOGOUT_PATH = '/v1/admin/auth/logout';
export const SESSION_PATH = '/v1/admin/auth/session';

const loginRequestSchema = z
.object({
  email: z.string().trim().email('Invalid email address.'),
  password: z
  .string()
  .min(8, 'Password must have at least 8 characters.')
  .max(256, 'Password is too long.'),
})
.strict();

type LoginRequestBody = z.infer<typeof loginRequestSchema>;
const NO_ACTIVE_ADMIN_SESSION_MESSAGE =
'No active administrative session was found.';

export interface AuthRoutesOptions {
  sessionTtlMs?: number;
}

function sendSessionSuccess(
  request: FastifyRequest,
  reply: FastifyReply,
  user: {
    id: string;
    email: string;
    displayName: string;
    role: 'admin' | 'editor';
  },
): FastifyReply {
  return reply.status(200).send(buildAdminSessionSuccessPayload(request, reply, user));
}

export const authRoutes: FastifyPluginAsync<AuthRoutesOptions> = async (
  app,
  options = {},
) => {
  app.post(
    LOGIN_PATH,
    async (
      request: FastifyRequest<{ Body: unknown }>,
      reply,
    ): Promise<FastifyReply> => {
      const parsed = loginRequestSchema.safeParse(request.body);

      if (!parsed.success) {
        return sendValidationError(
          request,
          reply,
          mapZodIssuesToErrorDetails(parsed.error.issues),
        );
      }

      const credentials: LoginRequestBody = parsed.data;
      const authenticatedUser =
        await authenticateBootstrapAdminCredentials(credentials);

      if (!authenticatedUser) {
        request.log.warn(
          {
            traceId: request.id,
            email: credentials.email,
          },
          'admin login failed: invalid credentials',
        );

        return sendError(
          request,
          reply,
          401,
          'UNAUTHENTICATED',
          'Invalid email or password.',
        );
      }

      const session = await createAdminSessionForUser(
        authenticatedUser,
        options.sessionTtlMs,
      );

      /**
       * Cookie administrativo explícito:
       * - httpOnly
       * - signed
       * - sameSite strict
       * - secure em produção
       * - TTL controlado pela sessão
       */
      setAdminSessionCookie(reply, session.id, options.sessionTtlMs);

      request.log.info(
        {
          traceId: request.id,
          userId: session.user.id,
          email: session.user.email,
          role: session.user.role,
          sessionId: session.id,
        },
        'admin login succeeded',
      );

      /**
       * O payload de sucesso de sessão permanece soberano em admin-auth.ts
       * porque ele já injeta csrfToken quando disponível no reply.
       */
      return sendSessionSuccess(request, reply, session.user);
    },
  );

  app.get(
    SESSION_PATH,
    async (request, reply): Promise<FastifyReply> => {
      /**
       * touch=true preserva o comportamento atual do backend:
       * ler a sessão atual atualiza lastAccessedAt quando aplicável.
       */
      const session = await readCurrentAdminSession(request, reply, {
        touch: true,
      });

      if (!session) {
        request.log.info(
          {
            traceId: request.id,
          },
          'admin session read failed: no active session',
        );

        return sendError(
          request,
          reply,
          401,
          'SESSION_EXPIRED',
          NO_ACTIVE_ADMIN_SESSION_MESSAGE,
        );
      }

      return sendSessionSuccess(request, reply, session.user);
    },
  );

  app.post(
    LOGOUT_PATH,
    async (request, reply): Promise<FastifyReply> => {
      /**
       * Logout permanece idempotente do ponto de vista do client:
       * se houver sessão, ela é removida;
       * se não houver, ainda assim o cookie é limpo e a operação conclui com 200.
       *
       * Isso preserva compatibilidade com o apps/admin atual.
       */
      const sessionId = getSignedAdminSessionId(request);

      if (sessionId) {
        await deleteAdminSessionById(sessionId);
      }

      clearAdminSessionCookie(reply);

      request.log.info(
        {
          traceId: request.id,
          hadSession: Boolean(sessionId),
          sessionId: sessionId ?? undefined,
        },
        'admin logout completed',
      );

      return sendSuccess(request, reply, {
        success: true as const,
      });
    },
  );
};
