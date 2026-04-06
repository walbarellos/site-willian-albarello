import { afterEach, describe, expect, it } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';

import { buildDisposableTestApp } from '../test-utils/build-app.js';
import { healthRoutes } from './health.js';

const appsToClose: FastifyInstance[] = [];

async function createHealthOnlyApp(
  options?: Parameters<typeof healthRoutes>[1],
): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  if (options) {
    await app.register(healthRoutes, options);
  } else {
    await app.register(healthRoutes, {});
  }
  await app.ready();
  appsToClose.push(app);
  return app;
}

afterEach(async () => {
  while (appsToClose.length > 0) {
    const app = appsToClose.pop();
    if (app) {
      await app.close();
    }
  }
});

describe('api/routes/health', () => {
  it('returns 200 on /health with service metadata and traceId', async () => {
    const { app, dispose } = await buildDisposableTestApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);

      const payload = response.json() as {
        data: {
          status: string;
          service: string;
          environment: string;
          timestamp: string;
        };
        meta: { traceId: string };
      };

      expect(payload.data.status).toBe('ok');
      expect(payload.data.service).toBe('api');
      expect(typeof payload.data.environment).toBe('string');
      expect(typeof payload.data.timestamp).toBe('string');
      expect(payload.data.timestamp.length).toBeGreaterThan(0);
      expect(typeof payload.meta.traceId).toBe('string');
      expect(payload.meta.traceId.length).toBeGreaterThan(0);
    } finally {
      await dispose();
    }
  });

  it('returns 200 on /ready when default checks pass', async () => {
    const { app, dispose } = await buildDisposableTestApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: '/ready',
      });

      expect(response.statusCode).toBe(200);

      const payload = response.json() as {
        data: {
          status: string;
          ready: boolean;
          checks: Array<{
            name: string;
            status: string;
            latencyMs: number;
          }>;
        };
        meta: { traceId: string };
      };

      expect(payload.data.status).toBe('ok');
      expect(payload.data.ready).toBe(true);
      expect(Array.isArray(payload.data.checks)).toBe(true);
      expect(payload.data.checks.length).toBeGreaterThan(0);
      expect(payload.data.checks[0]?.name).toBe('runtime');
      expect(payload.data.checks[0]?.status).toBe('ok');
      expect(typeof payload.meta.traceId).toBe('string');
    } finally {
      await dispose();
    }
  });

  it('keeps /ready as 200 when only optional dependency fails', async () => {
    const app = await createHealthOnlyApp({
      dependencies: [
        {
          name: 'runtime',
          check: () => undefined,
        },
        {
          name: 'optional-cache',
          optional: true,
          check: () => {
            throw new Error('cache unavailable');
          },
        },
      ],
    });

    const response = await app.inject({
      method: 'GET',
      url: '/ready',
    });

    expect(response.statusCode).toBe(200);

    const payload = response.json() as {
      data: {
        ready: boolean;
        checks: Array<{ name: string; status: string }>;
      };
      meta: { traceId: string };
    };

    expect(payload.data.ready).toBe(true);
    expect(payload.data.checks.some((check) => check.name === 'runtime')).toBe(true);
    expect(payload.data.checks.some((check) => check.name === 'optional-cache')).toBe(false);
    expect(typeof payload.meta.traceId).toBe('string');
  });

  it('returns 503 on /ready when blocking dependency fails', async () => {
    const app = await createHealthOnlyApp({
      dependencies: [
        {
          name: 'database',
          check: () => {
            throw new Error('database timeout');
          },
        },
      ],
    });

    const response = await app.inject({
      method: 'GET',
      url: '/ready',
    });

    expect(response.statusCode).toBe(503);

    const payload = response.json() as {
      error: {
        code: string;
        message: string;
        details: Array<{ field?: string; issue: string }>;
      };
      meta: { traceId: string };
    };

    expect(payload.error.code).toBe('SERVICE_UNAVAILABLE');
    expect(payload.error.message).toBe('Readiness checks failed.');
    expect(Array.isArray(payload.error.details)).toBe(true);
    expect(payload.error.details.length).toBe(1);
    expect(payload.error.details[0]?.field).toBe('database');
    expect(payload.error.details[0]?.issue).toContain('database timeout');
    expect(payload.error.details[0]?.issue).toContain('optional=false');
    expect(typeof payload.meta.traceId).toBe('string');
  });
});
