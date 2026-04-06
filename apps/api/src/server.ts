// apps/api/src/server.ts

import { randomUUID } from 'node:crypto';
import Fastify, {
  type FastifyError,
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import csrfProtection from '@fastify/csrf-protection';
import rateLimit from '@fastify/rate-limit';

import { buildErrorPayload } from './lib/http-contract.js';
import { env } from './lib/env.js';
import { authRoutes } from './routes/auth.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { healthRoutes } from './routes/health.js';
import { mediaRoutes } from './routes/media-admin.js';
import { adminPublicationsRoutes } from './routes/publications-admin.js';
import { publicPublicationsRoutes } from './routes/publications-public.js';

const DEFAULT_RATE_LIMIT = {
  max: 120,
  timeWindow: '1 minute',
} as const;

type ErrorLike = {
  statusCode?: number;
  code?: string;
  message: string;
  validation?: Array<{
    instancePath?: string;
    message?: string;
    keyword?: string;
  }>;
};

const MAX_TRACE_ID_LENGTH = 128;
const TRACE_ID_ALLOWED_PATTERN = /^[A-Za-z0-9._:-]+$/;

function buildLoggerConfig() {
  return {
    level: env.IS_PROD ? 'info' : 'debug',
    base: {
      service: 'api',
      env: env.NODE_ENV,
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]',
        'err.config.headers.authorization',
      ],
      censor: '[REDACTED]',
    },
    ...(env.IS_DEV
    ? {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    }
    : {}),
  };
}

function stripQueryString(url: string): string {
  const index = url.indexOf('?');
  return index === -1 ? url : url.slice(0, index);
}

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '');
}

function isAllowedCorsOrigin(origin: string): boolean {
  const normalizedOrigin = normalizeOrigin(origin);

  return env.CORS_ORIGINS.some(
    (allowedOrigin) => normalizeOrigin(allowedOrigin) === normalizedOrigin,
  );
}

function shouldDisableCache(url: string): boolean {
  const path = stripQueryString(url);

  return (
    path === '/health' ||
    path === '/ready' ||
    path.startsWith('/v1/admin')
  );
}

function setSecurityHeaders(reply: FastifyReply): void {
  reply.header('x-content-type-options', 'nosniff');
  reply.header('x-frame-options', 'DENY');
  reply.header('referrer-policy', 'strict-origin-when-cross-origin');
  reply.header(
    'permissions-policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  );
  reply.header(
    'content-security-policy-report-only',
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  );
}

function isExpectedClientError(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 500;
}

function normalizeStatusCode(error: ErrorLike): number {
  if (
    typeof error.statusCode === 'number' &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
  ) {
    return error.statusCode;
  }

  return 500;
}

function mapErrorCode(statusCode: number, error: ErrorLike): string {
  if (error.code === 'INVALID_STATE_TRANSITION') return 'INVALID_STATE_TRANSITION';
  if (statusCode === 400) return 'BAD_REQUEST';
  if (statusCode === 401) return 'UNAUTHENTICATED';
  if (statusCode === 403) {
    if (error.code?.startsWith('FST_CSRF')) {
      return 'CSRF_INVALID_TOKEN';
    }

    return 'FORBIDDEN';
  }
  if (statusCode === 404) return 'NOT_FOUND';
  if (statusCode === 405) return 'METHOD_NOT_ALLOWED';
  if (statusCode === 409) return 'CONFLICT';
  if (statusCode === 413) return 'PAYLOAD_TOO_LARGE';
  if (statusCode === 415) return 'UNSUPPORTED_MEDIA_TYPE';
  if (statusCode === 422) return 'VALIDATION_ERROR';
  if (statusCode === 429) return 'RATE_LIMITED';
  if (statusCode === 503) return 'SERVICE_UNAVAILABLE';

  return 'INTERNAL_SERVER_ERROR';
}

function extractErrorDetails(statusCode: number, error: ErrorLike) {
  if (statusCode !== 422 || !Array.isArray(error.validation)) {
    return undefined;
  }

  const details = error.validation
    .map((issue) => {
      const field = issue.instancePath
        ?.trim()
        .replace(/^\//, '')
        .replace(/\//g, '.');
      const message = issue.message?.trim();

      if (!message) {
        return null;
      }

      return {
        ...(field ? { field } : {}),
        issue: message,
      };
    })
    .filter((detail): detail is { field?: string; issue: string } => detail !== null);

  return details.length > 0 ? details : undefined;
}

function buildErrorMessage(statusCode: number, error: ErrorLike): string {
  if (statusCode === 404) {
    return 'Route not found.';
  }

  if (statusCode === 429) {
    return 'Too many requests. Please try again later.';
  }

  if (statusCode === 403 && error.code?.startsWith('FST_CSRF')) {
    return 'Invalid CSRF token.';
  }

  if (isExpectedClientError(statusCode) && error.message) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

function normalizeIncomingTraceId(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  if (!normalized || normalized.length > MAX_TRACE_ID_LENGTH) {
    return null;
  }

  if (!TRACE_ID_ALLOWED_PATTERN.test(normalized)) {
    return null;
  }

  return normalized;
}

async function registerCorePlugins(app: FastifyInstance): Promise<void> {
  await app.register(cors, {
    credentials: true,
    maxAge: 86400,
    methods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'accept',
      'content-type',
      'x-csrf-token',
      'x-requested-with',
      'x-trace-id',
    ],
    exposedHeaders: ['x-trace-id'],
    origin(origin, callback) {
      /**
       * Sem origin geralmente significa:
       * - curl
       * - health checks
       * - chamadas server-to-server
       * Mantemos permitido para não quebrar observabilidade e integrações locais.
       */
      if (!origin) {
        callback(null, true);
        return;
      }

      if (isAllowedCorsOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin not allowed.'), false);
    },
  });

  await app.register(cookie, {
    secret: env.SESSION_SECRET,
    hook: 'onRequest',
  });

  /**
   * O backend já está preparado para CSRF no contexto administrativo.
   * O apps/admin ainda precisa fechar plenamente o uso do token ponta a ponta,
   * mas o servidor já deve registrar o plugin de forma consistente.
   */
  await app.register(csrfProtection, {
    cookieOpts: {
      path: '/',
      sameSite: 'strict',
      secure: env.IS_PROD,
      httpOnly: true,
    },
  });

  await app.register(rateLimit, {
    global: true,
    max: DEFAULT_RATE_LIMIT.max,
    timeWindow: DEFAULT_RATE_LIMIT.timeWindow,
    hook: 'onRequest',
    continueExceeding: false,
    errorResponseBuilder(request, context) {
      return buildErrorPayload(
        request,
        'RATE_LIMITED',
        'Too many requests. Please try again later.',
        [
          {
            issue: `Retry after ${context.after}`,
          },
        ],
      );
    },
  });
}

function registerLifecycleHooks(app: FastifyInstance): void {
  app.addHook('onRequest', async (request, reply) => {
    setSecurityHeaders(reply);
    reply.header('x-trace-id', request.id);
  });

  app.addHook('onSend', async (request, reply, payload) => {
    if (shouldDisableCache(request.url)) {
      reply.header(
        'cache-control',
        'no-store, no-cache, must-revalidate, proxy-revalidate',
      );
      reply.header('pragma', 'no-cache');
      reply.header('expires', '0');
    }

    return payload;
  });

  app.addHook('onResponse', async (request, reply) => {
    request.log.info(
      {
        traceId: request.id,
        method: request.method,
        route: request.routeOptions.url ?? request.url,
        statusCode: reply.statusCode,
        responseTimeMs: reply.elapsedTime,
      },
      'request completed',
    );
  });
}

async function registerRoutes(app: FastifyInstance): Promise<void> {
  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(dashboardRoutes);
  await app.register(publicPublicationsRoutes);
  await app.register(adminPublicationsRoutes);
  await app.register(mediaRoutes);
}

function registerGlobalHandlers(app: FastifyInstance): void {
  app.setNotFoundHandler((request, reply) => {
    const payload = buildErrorPayload(
      request,
      'NOT_FOUND',
      'Route not found.',
    );

    return reply.status(404).send(payload);
  });

  app.setErrorHandler((error, request, reply) => {
    const normalizedError: ErrorLike = {
      message: error instanceof Error ? error.message : 'Unknown error',
      ...(typeof (error as Partial<FastifyError>).statusCode === 'number'
      ? { statusCode: (error as Partial<FastifyError>).statusCode }
      : {}),
      ...(typeof (error as Partial<FastifyError>).code === 'string'
      ? { code: (error as Partial<FastifyError>).code }
      : {}),
      ...(Array.isArray((error as Partial<FastifyError> & { validation?: unknown }).validation)
      ? {
        validation: (error as Partial<FastifyError> & {
          validation?: Array<{
            instancePath?: string;
            message?: string;
            keyword?: string;
          }>;
        }).validation,
      }
      : {}),
    };

    const statusCode = normalizeStatusCode(normalizedError);
    const errorCode = mapErrorCode(statusCode, normalizedError);
    const errorDetails = extractErrorDetails(statusCode, normalizedError);
    const payload = buildErrorPayload(
      request,
      errorCode,
      buildErrorMessage(statusCode, normalizedError),
      errorDetails,
    );

    if (isExpectedClientError(statusCode)) {
      request.log.warn(
        {
          traceId: request.id,
          method: request.method,
          route: request.routeOptions.url ?? request.url,
          statusCode,
          errorCode,
          reason: normalizedError.message,
        },
        'request failed with expected client error',
      );
    } else {
      request.log.error(
        {
          traceId: request.id,
          method: request.method,
          route: request.routeOptions.url ?? request.url,
          statusCode,
          errorCode,
          err: error,
        },
        'request failed with unexpected server error',
      );
    }

    return reply.status(statusCode).send(payload);
  });
}

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: buildLoggerConfig(),
    trustProxy: env.IS_PROD,
    disableRequestLogging: true,
    requestIdHeader: 'x-trace-id',
    requestIdLogLabel: 'traceId',
    genReqId(request) {
      const normalizedTraceId = normalizeIncomingTraceId(
        request.headers['x-trace-id'],
      );

      if (normalizedTraceId) {
        return normalizedTraceId;
      }

      return randomUUID();
    },
  });

  await registerCorePlugins(app);
  registerLifecycleHooks(app);
  registerGlobalHandlers(app);
  await registerRoutes(app);

  return app;
}
