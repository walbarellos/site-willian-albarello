// apps/api/src/index.ts

import type { FastifyInstance } from 'fastify';

import { env } from './lib/env.js';
import { buildServer } from './server.js';

const HOST = '0.0.0.0';

async function closeServer(
  app: FastifyInstance,
  signalOrReason: string,
  exitCode: number,
): Promise<never> {
  try {
    app.log.info({ signalOrReason }, 'shutting down server');

    await app.close();

    app.log.info({ signalOrReason }, 'server shutdown completed');
  } catch (error) {
    app.log.error(
      { err: error, signalOrReason },
      'server shutdown failed',
    );
  }

  process.exit(exitCode);
}

async function start(): Promise<void> {
  const app = await buildServer();
  let isShuttingDown = false;

  const shutdown = async (
    signalOrReason: string,
    exitCode: number,
  ): Promise<void> => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    await closeServer(app, signalOrReason, exitCode);
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT', 0);
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM', 0);
  });

  process.on('unhandledRejection', (reason) => {
    app.log.error({ reason }, 'unhandled promise rejection');
    void shutdown('unhandledRejection', 1);
  });

  process.on('uncaughtException', (error) => {
    app.log.error({ err: error }, 'uncaught exception');
    void shutdown('uncaughtException', 1);
  });

  try {
    await app.listen({
      host: HOST,
      port: env.PORT,
    });

    app.log.info(
      {
        host: HOST,
        port: env.PORT,
        env: env.NODE_ENV,
      },
      'api server started',
    );
  } catch (error) {
    app.log.error({ err: error }, 'api server failed to start');
    await shutdown('startup_failure', 1);
  }
}

void start();
