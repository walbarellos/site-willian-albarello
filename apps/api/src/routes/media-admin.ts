import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { requireAdminSession } from '../lib/admin-auth.js';
import { isFastifyReply, sendCreated, sendError, sendSuccess, sendValidationError } from '../lib/http-contract.js';

const ADMIN_UPLOAD_PATH = '/v1/admin/media/upload';
const PUBLIC_MEDIA_PATH = '/v1/public/media/:fileName';
const MEDIA_DIR = resolve(process.cwd(), 'uploads');
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

const uploadBodySchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(120),
  base64Data: z.string().trim().min(1),
}).strict();

const fileNameParamsSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
}).strict();

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'video/mp4',
]);

function sanitizeFileName(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180) || 'asset';
}

function extensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'image/png':
      return '.png';
    case 'image/jpeg':
      return '.jpg';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    case 'video/mp4':
      return '.mp4';
    default:
      return '';
  }
}

function buildPublicMediaUrl(request: FastifyRequest, fileName: string): string {
  const host = request.headers.host ?? `localhost:${process.env.PORT ?? '3002'}`;
  return `${request.protocol}://${host}/v1/public/media/${encodeURIComponent(fileName)}`;
}

export const mediaRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    ADMIN_UPLOAD_PATH,
    async (
      request: FastifyRequest<{ Body: unknown }>,
      reply: FastifyReply,
    ): Promise<FastifyReply> => {
      const sessionResult = await requireAdminSession(request, reply, ['admin', 'editor']);
      if (isFastifyReply(sessionResult)) {
        return sessionResult;
      }

      const parsed = uploadBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return sendValidationError(
          request,
          reply,
          parsed.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            issue: issue.message,
          })),
        );
      }

      const { fileName, mimeType, base64Data } = parsed.data;

      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return sendError(
          request,
          reply,
          415,
          'UNSUPPORTED_MEDIA_TYPE',
          'Unsupported media type. Allowed: png, jpg, webp, gif, mp4.',
        );
      }

      let buffer: Buffer;
      try {
        buffer = Buffer.from(base64Data, 'base64');
      } catch {
        return sendError(
          request,
          reply,
          422,
          'VALIDATION_ERROR',
          'Invalid base64 payload.',
        );
      }

      if (!buffer.length) {
        return sendError(
          request,
          reply,
          422,
          'VALIDATION_ERROR',
          'Uploaded file is empty.',
        );
      }

      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return sendError(
          request,
          reply,
          413,
          'PAYLOAD_TOO_LARGE',
          'File exceeds 100MB limit.',
        );
      }

      await mkdir(MEDIA_DIR, { recursive: true });

      const originalName = sanitizeFileName(fileName.replace(extname(fileName), ''));
      const extension = extensionFromMimeType(mimeType);
      const finalFileName = `${Date.now()}-${randomUUID().slice(0, 8)}-${originalName}${extension}`;
      const absolutePath = join(MEDIA_DIR, finalFileName);

      await writeFile(absolutePath, buffer);

      return sendCreated(request, reply, {
        url: buildPublicMediaUrl(request, finalFileName),
        fileName: finalFileName,
        mimeType,
        size: buffer.length,
      });
    },
  );

  app.get(
    PUBLIC_MEDIA_PATH,
    async (
      request: FastifyRequest<{ Params: unknown }>,
      reply: FastifyReply,
    ): Promise<FastifyReply> => {
      const parsedParams = fileNameParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        return sendError(request, reply, 404, 'NOT_FOUND', 'Media file not found.');
      }

      const safeFileName = sanitizeFileName(parsedParams.data.fileName);
      const absolutePath = join(MEDIA_DIR, safeFileName);

      try {
        const content = await readFile(absolutePath);
        const ext = extname(safeFileName).toLowerCase();
        const mimeType =
          ext === '.png'
            ? 'image/png'
            : ext === '.jpg' || ext === '.jpeg'
              ? 'image/jpeg'
              : ext === '.webp'
                ? 'image/webp'
                : ext === '.gif'
                  ? 'image/gif'
                  : ext === '.mp4'
                    ? 'video/mp4'
                    : 'application/octet-stream';

        reply.header('content-type', mimeType);
        reply.header('cache-control', 'public, max-age=31536000, immutable');
        return reply.send(content);
      } catch {
        return sendError(request, reply, 404, 'NOT_FOUND', 'Media file not found.');
      }
    },
  );

  app.get('/v1/public/media', async (request, reply) =>
    sendSuccess(request, reply, {
      available: true,
    }));
};
