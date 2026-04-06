// apps/api/src/routes/health.ts

import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from 'fastify';

import { env } from '../lib/env.js';

type HealthMeta = {
  traceId: string;
};

type HealthBaseData = {
  status: 'ok';
  service: string;
  version?: string;
  environment: string;
  timestamp: string;
};

type HealthResponse = {
  data: HealthBaseData;
  meta: HealthMeta;
};

type ReadinessCheckSuccess = {
  name: string;
  status: 'ok';
  latencyMs: number;
};

type ReadinessCheckFailure = {
  name: string;
  status: 'fail';
  latencyMs: number;
  optional: boolean;
  message: string;
};

type ReadinessResponse = {
  data: HealthBaseData & {
    ready: true;
    checks: ReadinessCheckSuccess[];
  };
  meta: HealthMeta;
};

type ReadinessErrorResponse = {
  error: {
    code: 'SERVICE_UNAVAILABLE';
    message: string;
    details: Array<{
      field?: string;
      issue: string;
    }>;
  };
  meta: HealthMeta;
};

export interface HealthDependencyCheck {
  name: string;
  optional?: boolean;
  check: (app: FastifyInstance) => Promise<void> | void;
}

export interface HealthRoutesOptions {
  serviceName?: string;
  version?: string;
  dependencies?: HealthDependencyCheck[];
}

const DEFAULT_SERVICE_NAME = 'api';

function getMeta(request: FastifyRequest): HealthMeta {
  return {
    traceId: request.id,
  };
}

function getBasePayload(options: HealthRoutesOptions = {}): HealthBaseData {
  return {
    status: 'ok',
    service: options.serviceName ?? DEFAULT_SERVICE_NAME,
    version: options.version ?? process.env.npm_package_version,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };
}

async function runDependencyChecks(
  app: FastifyInstance,
  dependencies: HealthDependencyCheck[],
): Promise<{
  successes: ReadinessCheckSuccess[];
  failures: ReadinessCheckFailure[];
}> {
  const successes: ReadinessCheckSuccess[] = [];
  const failures: ReadinessCheckFailure[] = [];

  for (const dependency of dependencies) {
    const startedAt = performance.now();

    try {
      await dependency.check(app);

      successes.push({
        name: dependency.name,
        status: 'ok',
        latencyMs: Number((performance.now() - startedAt).toFixed(2)),
      });
    } catch (error) {
      failures.push({
        name: dependency.name,
        status: 'fail',
        latencyMs: Number((performance.now() - startedAt).toFixed(2)),
        optional: Boolean(dependency.optional),
        message:
          error instanceof Error
            ? error.message
            : 'Dependency check failed unexpectedly.',
      });
    }
  }

  return {
    successes,
    failures,
  };
}

function buildReadinessFailureResponse(
  request: FastifyRequest,
  failures: ReadinessCheckFailure[],
): ReadinessErrorResponse {
  return {
    error: {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Readiness checks failed.',
      details: failures.map((failure) => ({
        field: failure.name,
        issue: `${failure.message} (latency=${failure.latencyMs}ms, optional=${failure.optional})`,
      })),
    },
    meta: getMeta(request),
  };
}

function getDefaultDependencies(): HealthDependencyCheck[] {
  return [
    {
      name: 'runtime',
      check() {
        return;
      },
    },
  ];
}

/**
 * Health and readiness routes.
 *
 * Future dependency checks can be injected through the plugin options.
 * Example for a future DB check:
 *
 * {
 *   name: 'database',
 *   check: async (app) => {
 *     await app.someDbClient.query('select 1');
 *   }
 * }
 */
export const healthRoutes: FastifyPluginAsync<HealthRoutesOptions> = async (
  app,
  options = {},
) => {
  const dependencies =
    options.dependencies && options.dependencies.length > 0
      ? options.dependencies
      : getDefaultDependencies();

  app.get(
    '/health',
    async (
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<HealthResponse> => {
      reply.code(200);

      return {
        data: getBasePayload(options),
        meta: getMeta(request),
      };
    },
  );

  app.get(
    '/ready',
    async (
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<ReadinessResponse | ReadinessErrorResponse> => {
      const { successes, failures } = await runDependencyChecks(
        app,
        dependencies,
      );

      const blockingFailures = failures.filter((failure) => !failure.optional);

      if (blockingFailures.length > 0) {
        reply.code(503);
        return buildReadinessFailureResponse(request, blockingFailures);
      }

      reply.code(200);

      return {
        data: {
          ...getBasePayload(options),
          ready: true,
          checks: successes,
        },
        meta: getMeta(request),
      };
    },
  );
};
