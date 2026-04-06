import { describe, expect, it } from 'vitest';

import { buildDisposableTestApp } from '../test-utils/build-app.js';

describe('api/routes/publications-public', () => {
  it('lists only published publications with paginated envelope', async () => {
    const { app, dispose } = await buildDisposableTestApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/public/publications',
      });

      expect(response.statusCode).toBe(200);

      const payload = response.json() as {
        data: Array<{
          id: string;
          slug: string;
          title: string;
          summary: string;
          publishedAt: string;
        }>;
        meta: {
          traceId: string;
          page: number;
          pageSize: number;
          totalItems: number;
          totalPages: number;
        };
      };

      expect(Array.isArray(payload.data)).toBe(true);
      expect(payload.data.length).toBe(2);
      expect(payload.data.every((item) => item.slug !== 'rascunho-interno-nao-publico')).toBe(true);
      expect(payload.meta.page).toBe(1);
      expect(payload.meta.pageSize).toBe(12);
      expect(payload.meta.totalItems).toBe(2);
      expect(payload.meta.totalPages).toBe(1);
      expect(typeof payload.meta.traceId).toBe('string');
      expect(payload.meta.traceId.length).toBeGreaterThan(0);
    } finally {
      await dispose();
    }
  });

  it('supports public filters and pagination', async () => {
    const { app, dispose } = await buildDisposableTestApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/public/publications?category=governanca&page=1&pageSize=1',
      });

      expect(response.statusCode).toBe(200);

      const payload = response.json() as {
        data: Array<{
          slug: string;
          category?: { slug: string } | null;
        }>;
        meta: {
          page: number;
          pageSize: number;
          totalItems: number;
          totalPages: number;
          traceId: string;
        };
      };

      expect(payload.data.length).toBe(1);
      expect(payload.data[0]?.slug).toBe('fluxo-editorial-clareza-publica-consistencia-publicacao');
      expect(payload.data[0]?.category?.slug).toBe('governanca');
      expect(payload.meta.page).toBe(1);
      expect(payload.meta.pageSize).toBe(1);
      expect(payload.meta.totalItems).toBe(1);
      expect(payload.meta.totalPages).toBe(1);
      expect(typeof payload.meta.traceId).toBe('string');
    } finally {
      await dispose();
    }
  });

  it('returns detail by valid published slug', async () => {
    const { app, dispose } = await buildDisposableTestApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/public/publications/inteligencia-relacional-eixo-presenca-institucional',
      });

      expect(response.statusCode).toBe(200);

      const payload = response.json() as {
        data: {
          id: string;
          slug: string;
          content: string;
          seo?: {
            metaTitle?: string;
          };
        };
        meta: { traceId: string };
      };

      expect(payload.data.id).toBe('pub-001');
      expect(payload.data.slug).toBe('inteligencia-relacional-eixo-presenca-institucional');
      expect(typeof payload.data.content).toBe('string');
      expect(payload.data.content.length).toBeGreaterThan(0);
      expect(typeof payload.meta.traceId).toBe('string');
    } finally {
      await dispose();
    }
  });

  it('returns 404 when slug is valid but publication does not exist or is not published', async () => {
    const { app, dispose } = await buildDisposableTestApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/public/publications/rascunho-interno-nao-publico',
      });

      expect(response.statusCode).toBe(404);

      const payload = response.json() as {
        error: { code: string; message: string };
        meta: { traceId: string };
      };

      expect(payload.error.code).toBe('NOT_FOUND');
      expect(payload.error.message).toBe('Published publication not found.');
      expect(typeof payload.meta.traceId).toBe('string');
    } finally {
      await dispose();
    }
  });

  it('returns 422 for invalid query and invalid slug params', async () => {
    const { app, dispose } = await buildDisposableTestApp();

    try {
      const invalidQueryResponse = await app.inject({
        method: 'GET',
        url: '/v1/public/publications?page=0&pageSize=100&unknown=1',
      });

      expect(invalidQueryResponse.statusCode).toBe(422);

      const invalidQueryPayload = invalidQueryResponse.json() as {
        error: {
          code: string;
          message: string;
          details?: Array<{ field?: string; issue: string }>;
        };
        meta: { traceId: string };
      };

      expect(invalidQueryPayload.error.code).toBe('VALIDATION_ERROR');
      expect(invalidQueryPayload.error.message).toBe('The request query is invalid.');
      expect(Array.isArray(invalidQueryPayload.error.details)).toBe(true);
      expect(typeof invalidQueryPayload.meta.traceId).toBe('string');

      const invalidSlugResponse = await app.inject({
        method: 'GET',
        url: '/v1/public/publications/Slug-Invalido',
      });

      expect(invalidSlugResponse.statusCode).toBe(422);

      const invalidSlugPayload = invalidSlugResponse.json() as {
        error: {
          code: string;
          message: string;
          details?: Array<{ field?: string; issue: string }>;
        };
        meta: { traceId: string };
      };

      expect(invalidSlugPayload.error.code).toBe('VALIDATION_ERROR');
      expect(invalidSlugPayload.error.message).toBe('The route parameters are invalid.');
      expect(Array.isArray(invalidSlugPayload.error.details)).toBe(true);
      expect(typeof invalidSlugPayload.meta.traceId).toBe('string');
    } finally {
      await dispose();
    }
  });
});
