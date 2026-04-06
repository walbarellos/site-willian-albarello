import { describe, expect, it } from 'vitest';

import { buildDisposableTestApp } from '../test-utils/build-app.js';
import { LOGIN_PATH, LOGOUT_PATH, SESSION_PATH } from './auth.js';

function extractSessionCookie(setCookieHeader: string[] | string | undefined): string | null {
  if (!setCookieHeader) {
    return null;
  }

  const values = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  const target = values.find((value) => value.startsWith('wa_admin_session='));

  if (!target) {
    return null;
  }

  return target.split(';')[0] ?? null;
}

describe('api/routes/auth', () => {
  it('returns 422 when login payload is invalid', async () => {
    const { app, dispose } = await buildDisposableTestApp();

    try {
      const response = await app.inject({
        method: 'POST',
        url: LOGIN_PATH,
        payload: {
          email: 'invalid-email',
          password: '123',
        },
      });

      expect(response.statusCode).toBe(422);

      const payload = response.json() as {
        error: {
          code: string;
          message: string;
          details?: Array<{ field?: string; issue: string }>;
        };
        meta: { traceId: string };
      };

      expect(payload.error.code).toBe('VALIDATION_ERROR');
      expect(payload.error.message).toBe('The request payload is invalid.');
      expect(Array.isArray(payload.error.details)).toBe(true);
      expect(typeof payload.meta.traceId).toBe('string');
    } finally {
      await dispose();
    }
  });

  it('returns 401 when bootstrap credentials are invalid', async () => {
    const { app, dispose } = await buildDisposableTestApp();

    try {
      const response = await app.inject({
        method: 'POST',
        url: LOGIN_PATH,
        payload: {
          email: 'admin@local.test',
          password: 'WrongPassword123!',
        },
      });

      expect(response.statusCode).toBe(401);

      const payload = response.json() as {
        error: { code: string; message: string };
        meta: { traceId: string };
      };

      expect(payload.error.code).toBe('UNAUTHENTICATED');
      expect(payload.error.message).toBe('Invalid email or password.');
      expect(typeof payload.meta.traceId).toBe('string');
    } finally {
      await dispose();
    }
  });

  it('allows login with bootstrap credentials and reads current session', async () => {
    const { app, dispose } = await buildDisposableTestApp();

    try {
      const loginResponse = await app.inject({
        method: 'POST',
        url: LOGIN_PATH,
        payload: {
          email: 'admin@local.test',
          password: 'ChangeMe123!',
        },
      });

      expect(loginResponse.statusCode).toBe(200);

      const sessionCookie = extractSessionCookie(loginResponse.headers['set-cookie']);
      expect(typeof sessionCookie).toBe('string');

      const loginPayload = loginResponse.json() as {
        data: {
          user: {
            id: string;
            email: string;
            displayName: string;
            role: 'admin' | 'editor';
          };
          csrfToken?: string;
        };
        meta: { traceId: string };
      };

      expect(loginPayload.data.user.email).toBe('admin@local.test');
      expect(['admin', 'editor']).toContain(loginPayload.data.user.role);
      expect(typeof loginPayload.meta.traceId).toBe('string');

      const sessionResponse = await app.inject({
        method: 'GET',
        url: SESSION_PATH,
        headers: {
          cookie: sessionCookie ?? '',
        },
      });

      expect(sessionResponse.statusCode).toBe(200);

      const sessionPayload = sessionResponse.json() as {
        data: {
          user: {
            id: string;
            email: string;
            role: 'admin' | 'editor';
          };
        };
        meta: { traceId: string };
      };

      expect(sessionPayload.data.user.email).toBe('admin@local.test');
      expect(typeof sessionPayload.meta.traceId).toBe('string');

      const logoutResponse = await app.inject({
        method: 'POST',
        url: LOGOUT_PATH,
        headers: {
          cookie: sessionCookie ?? '',
        },
      });

      expect(logoutResponse.statusCode).toBe(200);
    } finally {
      await dispose();
    }
  });

  it('returns 401 on session endpoint when no active session exists', async () => {
    const { app, dispose } = await buildDisposableTestApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: SESSION_PATH,
      });

      expect(response.statusCode).toBe(401);

      const payload = response.json() as {
        error: { code: string; message: string };
        meta: { traceId: string };
      };

      expect(payload.error.code).toBe('SESSION_EXPIRED');
      expect(payload.error.message).toBe('No active administrative session was found.');
      expect(typeof payload.meta.traceId).toBe('string');
    } finally {
      await dispose();
    }
  });

  it('keeps logout idempotent with and without active cookie', async () => {
    const { app, dispose } = await buildDisposableTestApp();

    try {
      const firstLogout = await app.inject({
        method: 'POST',
        url: LOGOUT_PATH,
      });

      expect(firstLogout.statusCode).toBe(200);
      expect(firstLogout.json()).toMatchObject({
        data: { success: true },
      });

      const loginResponse = await app.inject({
        method: 'POST',
        url: LOGIN_PATH,
        payload: {
          email: 'admin@local.test',
          password: 'ChangeMe123!',
        },
      });

      expect(loginResponse.statusCode).toBe(200);
      const sessionCookie = extractSessionCookie(loginResponse.headers['set-cookie']);
      expect(typeof sessionCookie).toBe('string');

      const secondLogout = await app.inject({
        method: 'POST',
        url: LOGOUT_PATH,
        headers: {
          cookie: sessionCookie ?? '',
        },
      });

      expect(secondLogout.statusCode).toBe(200);
      expect(secondLogout.json()).toMatchObject({
        data: { success: true },
      });
    } finally {
      await dispose();
    }
  });
});
