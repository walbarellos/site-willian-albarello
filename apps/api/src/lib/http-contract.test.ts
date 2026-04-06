import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';

import {
  buildErrorPayload,
  buildPaginatedSuccessPayload,
  buildSuccessPayload,
  getPaginationMeta,
  getTraceMeta,
  isFastifyReply,
  mapZodIssuesToErrorDetails,
  sendCreated,
  sendError,
  sendPaginatedSuccess,
  sendParamsValidationError,
  sendQueryValidationError,
  sendSuccess,
  sendValidationError,
} from './http-contract.js';

type ReplyDouble = {
  statusCode: number;
  payload: unknown;
  status: (code: number) => ReplyDouble;
  send: (payload: unknown) => ReplyDouble;
};

function createRequest(traceId = 'trace-test-001'): FastifyRequest {
  return { id: traceId } as FastifyRequest;
}

function createReply(): FastifyReply {
  const reply: ReplyDouble = {
    statusCode: 200,
    payload: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send(payload: unknown) {
      this.payload = payload;
      return this;
    },
  };

  return reply as unknown as FastifyReply;
}

describe('api/http-contract', () => {
  it('builds trace meta from request id', () => {
    const request = createRequest('trace-abc');
    expect(getTraceMeta(request)).toEqual({ traceId: 'trace-abc' });
  });

  it('builds pagination meta with positive normalization rules', () => {
    const request = createRequest('trace-abc');

    expect(
      getPaginationMeta(request, {
        page: 2,
        pageSize: 20,
        totalItems: 150,
        totalPages: 8,
      }),
    ).toEqual({
      traceId: 'trace-abc',
      page: 2,
      pageSize: 20,
      totalItems: 150,
      totalPages: 8,
    });

    expect(
      getPaginationMeta(request, {
        page: 0,
        pageSize: -2,
        totalItems: -100,
        totalPages: Number.NaN,
      }),
    ).toEqual({
      traceId: 'trace-abc',
      page: 1,
      pageSize: 1,
      totalItems: 0,
      totalPages: 0,
    });
  });

  it('builds success and paginated success payloads with traceId', () => {
    const request = createRequest('trace-payload');

    expect(buildSuccessPayload(request, { ok: true })).toEqual({
      data: { ok: true },
      meta: { traceId: 'trace-payload' },
    });

    expect(
      buildPaginatedSuccessPayload(request, [{ id: '1' }], {
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
      }),
    ).toEqual({
      data: [{ id: '1' }],
      meta: {
        traceId: 'trace-payload',
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
      },
    });
  });

  it('builds error payload and normalizes details', () => {
    const request = createRequest('trace-error');

    const payload = buildErrorPayload(
      request,
      'VALIDATION_ERROR',
      'The request payload is invalid.',
      [
        { field: ' email ', issue: ' Required. ' },
        { issue: ' Invalid format ' },
        { field: 'ignored', issue: '   ' },
      ],
    );

    expect(payload).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The request payload is invalid.',
        details: [
          { field: 'email', issue: 'Required.' },
          { issue: 'Invalid format' },
        ],
      },
      meta: { traceId: 'trace-error' },
    });
  });

  it('sends success payloads with proper status codes', () => {
    const request = createRequest('trace-send-success');
    const reply = createReply();

    sendSuccess(request, reply, { ok: true });

    expect((reply as unknown as ReplyDouble).statusCode).toBe(200);
    expect((reply as unknown as ReplyDouble).payload).toEqual({
      data: { ok: true },
      meta: { traceId: 'trace-send-success' },
    });

    sendCreated(request, reply, { id: 'new-id' });

    expect((reply as unknown as ReplyDouble).statusCode).toBe(201);
    expect((reply as unknown as ReplyDouble).payload).toEqual({
      data: { id: 'new-id' },
      meta: { traceId: 'trace-send-success' },
    });

    sendPaginatedSuccess(
      request,
      reply,
      [{ id: '1' }, { id: '2' }],
      {
        page: 1,
        pageSize: 2,
        totalItems: 2,
        totalPages: 1,
      },
      206,
    );

    expect((reply as unknown as ReplyDouble).statusCode).toBe(206);
    expect((reply as unknown as ReplyDouble).payload).toEqual({
      data: [{ id: '1' }, { id: '2' }],
      meta: {
        traceId: 'trace-send-success',
        page: 1,
        pageSize: 2,
        totalItems: 2,
        totalPages: 1,
      },
    });
  });

  it('sends error payloads and validation wrappers with expected shape', () => {
    const request = createRequest('trace-send-error');
    const reply = createReply();

    sendError(request, reply, 403, 'FORBIDDEN', 'You do not have permission.', [
      { issue: 'Role missing.' },
    ]);

    expect((reply as unknown as ReplyDouble).statusCode).toBe(403);
    expect((reply as unknown as ReplyDouble).payload).toEqual({
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have permission.',
        details: [{ issue: 'Role missing.' }],
      },
      meta: { traceId: 'trace-send-error' },
    });

    sendValidationError(request, reply, [{ field: 'title', issue: 'Required.' }]);
    expect((reply as unknown as ReplyDouble).statusCode).toBe(422);
    expect((reply as unknown as ReplyDouble).payload).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The request payload is invalid.',
        details: [{ field: 'title', issue: 'Required.' }],
      },
      meta: { traceId: 'trace-send-error' },
    });

    sendQueryValidationError(request, reply, [{ field: 'page', issue: 'Invalid.' }]);
    expect((reply as unknown as ReplyDouble).statusCode).toBe(422);
    expect((reply as unknown as ReplyDouble).payload).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The request query is invalid.',
        details: [{ field: 'page', issue: 'Invalid.' }],
      },
      meta: { traceId: 'trace-send-error' },
    });

    sendParamsValidationError(request, reply, [{ field: 'slug', issue: 'Invalid.' }]);
    expect((reply as unknown as ReplyDouble).statusCode).toBe(422);
    expect((reply as unknown as ReplyDouble).payload).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The route parameters are invalid.',
        details: [{ field: 'slug', issue: 'Invalid.' }],
      },
      meta: { traceId: 'trace-send-error' },
    });
  });

  it('maps zod issues into error details', () => {
    const schema = z.object({
      slug: z.string().regex(/^[a-z0-9-]+$/),
      page: z.coerce.number().int().min(1),
    });

    const result = schema.safeParse({
      slug: 'Slug Invalido',
      page: 0,
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error('Expected zod parse to fail for invalid input');
    }

    const details = mapZodIssuesToErrorDetails(result.error.issues);

    expect(details.length).toBeGreaterThan(0);
    expect(details.every((detail) => typeof detail.issue === 'string')).toBe(true);
    expect(details.some((detail) => detail.field === 'slug')).toBe(true);
    expect(details.some((detail) => detail.field === 'page')).toBe(true);
  });

  it('detects fastify-like reply shape', () => {
    const reply = createReply();

    expect(isFastifyReply(reply)).toBe(true);
    expect(isFastifyReply({})).toBe(false);
    expect(isFastifyReply(null)).toBe(false);
    expect(isFastifyReply({ statusCode: 200, send: 'not-a-function' })).toBe(true);
  });
});
