// apps/api/src/routes/dashboard.ts

import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

import { requireAdminSession } from '../lib/admin-auth.js';
import type { AuthenticatedAdminUser } from '../lib/admin-session-store.js';

const DASHBOARD_PATH = '/v1/admin/dashboard';

type Meta = {
  traceId: string;
};

export type DashboardSummary = {
  drafts: number;
  published: number;
  archived: number;
  seoPending: number;
  review: number;
  readyToPublish: number;
};

type DashboardResponse = {
  data: DashboardSummary;
  meta: Meta;
};

export interface DashboardSummaryAdapter {
  getSummary(user: AuthenticatedAdminUser): Promise<DashboardSummary>;
}

export interface DashboardRoutesOptions {
  adapter?: DashboardSummaryAdapter;
}

function getMeta(request: FastifyRequest): Meta {
  return {
    traceId: request.id,
  };
}

function isFastifyReply(value: unknown): value is FastifyReply {
  return (
    typeof value === 'object' &&
    value !== null &&
    'statusCode' in value &&
    'send' in value
  );
}

function createInMemoryDashboardAdapter(): DashboardSummaryAdapter {
  return {
    async getSummary(): Promise<DashboardSummary> {
      return {
        drafts: 3,
        review: 2,
        readyToPublish: 1,
        published: 12,
        archived: 4,
        seoPending: 2,
      };
    },
  };
}

export const dashboardRoutes: FastifyPluginAsync<DashboardRoutesOptions> = async (
  app,
  options = {},
) => {
  const adapter = options.adapter ?? createInMemoryDashboardAdapter();

  app.get(
    DASHBOARD_PATH,
    async (
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<FastifyReply> => {
      const sessionResult = await requireAdminSession(request, reply, [
        'admin',
        'editor',
      ]);

      if (isFastifyReply(sessionResult)) {
        return sessionResult;
      }

      const summary = await adapter.getSummary(sessionResult.user);

      request.log.info(
        {
          traceId: request.id,
          userId: sessionResult.user.id,
          email: sessionResult.user.email,
          role: sessionResult.user.role,
        },
        'admin dashboard summary loaded',
      );

      const payload: DashboardResponse = {
        data: summary,
        meta: getMeta(request),
      };

      return reply.status(200).send(payload);
    },
  );
};
