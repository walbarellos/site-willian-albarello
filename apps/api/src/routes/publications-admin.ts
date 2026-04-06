// apps/api/src/routes/publications-admin.ts

import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import {
  requireAdminSession,
} from '../lib/admin-auth.js';
import type {
  AdminRole,
  AuthenticatedAdminUser,
} from '../lib/admin-session-store.js';
import {
  isFastifyReply,
  mapZodIssuesToErrorDetails,
  sendCreated,
  sendError,
  sendPaginatedSuccess,
  sendParamsValidationError,
  sendQueryValidationError,
  sendSuccess,
  sendValidationError,
} from '../lib/http-contract.js';

const BASE_PATH = '/v1/admin/publications';
const DETAIL_PATH = '/v1/admin/publications/:id';
const STATUS_PATH = '/v1/admin/publications/:id/status';
const PUBLICATION_NOT_FOUND_MESSAGE = 'Publication not found.';
const DEFAULT_SLUG_BASE = 'publicacao';

const editorialStatusSchema = z.enum([
  'draft',
  'review',
  'ready_to_publish',
  'published',
  'archived',
]);

const seoSchema = z
.object({
  metaTitle: z.string().trim().min(1).max(160).optional(),
        metaDescription: z.string().trim().min(1).max(320).optional(),
        canonicalUrl: z.string().trim().url().optional(),
        ogTitle: z.string().trim().min(1).max(160).optional(),
        ogDescription: z.string().trim().min(1).max(320).optional(),
        ogImageUrl: z.string().trim().url().optional(),
})
.strict();

const listQuerySchema = z
.object({
  page: z.coerce.number().int().min(1).optional(),
        pageSize: z.coerce.number().int().min(1).max(50).optional(),
        q: z.string().trim().min(1).max(200).optional(),
        status: editorialStatusSchema.optional(),
})
.strict();

const idParamsSchema = z
.object({
  id: z
  .string()
  .trim()
  .min(1, 'Publication id is required.')
  .max(120, 'Publication id is too long.'),
})
.strict();

const createDraftBodySchema = z
.object({
  title: z.string().trim().min(3, 'Title must have at least 3 characters.'),
        slug: z
        .string()
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe.')
        .optional(),
        summary: z.string().trim().max(500).optional(),
        content: z.string().trim().optional(),
        categoryId: z.string().trim().min(1).optional().nullable(),
        tagIds: z.array(z.string().trim().min(1)).max(25).optional(),
        seo: seoSchema.optional(),
        status: z.literal('draft').optional(),
})
.strict();

const updatePublicationBodySchema = z
.object({
  title: z
  .string()
  .trim()
  .min(3, 'Title must have at least 3 characters.')
  .optional(),
        slug: z
        .string()
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe.')
        .optional(),
        summary: z.string().trim().max(500).optional(),
        content: z.string().trim().optional(),
        categoryId: z.string().trim().min(1).optional().nullable(),
        tagIds: z.array(z.string().trim().min(1)).max(25).optional(),
        seo: seoSchema.optional(),
})
.strict()
.refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be provided.',
});

const transitionBodySchema = z
.object({
  status: editorialStatusSchema,
})
.strict();

export type EditorialStatus = z.infer<typeof editorialStatusSchema>;
type SeoPayload = z.infer<typeof seoSchema>;
type ListQueryInput = z.infer<typeof listQuerySchema>;
type CreateDraftBody = z.infer<typeof createDraftBodySchema>;
type UpdatePublicationBody = z.infer<typeof updatePublicationBodySchema>;
type TransitionBody = z.infer<typeof transitionBodySchema>;

type NormalizedListQuery = Required<
Pick<ListQueryInput, 'page' | 'pageSize'>
> &
Omit<ListQueryInput, 'page' | 'pageSize'>;

type CategoryRef = {
  id: string;
  name: string;
  slug: string;
};

type TagRef = {
  id: string;
  name: string;
  slug: string;
};

export type AdminPublication = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: EditorialStatus;
  categoryId?: string | null;
  tagIds: string[];
  category?: CategoryRef | null;
  tags: TagRef[];
  seo?: SeoPayload;
  publishedAt?: string | null;
  updatedAt: string;
  readingTimeMinutes?: number | null;
};

type PublicationListResult = {
  items: AdminPublication[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

class InvalidEditorialTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidEditorialTransitionError';
  }
}

export interface AdminPublicationsAdapter {
  listPublications(
    query: NormalizedListQuery,
    actor: AuthenticatedAdminUser,
  ): Promise<PublicationListResult>;
  getPublicationById(
    id: string,
    actor: AuthenticatedAdminUser,
  ): Promise<AdminPublication | null>;
  createDraft(
    input: CreateDraftBody,
    actor: AuthenticatedAdminUser,
  ): Promise<AdminPublication>;
  updatePublication(
    id: string,
    input: UpdatePublicationBody,
    actor: AuthenticatedAdminUser,
  ): Promise<AdminPublication | null>;
  transitionPublicationStatus(
    id: string,
    nextStatus: EditorialStatus,
    actor: AuthenticatedAdminUser,
  ): Promise<AdminPublication | null>;
}

export interface AdminPublicationsRoutesOptions {
  adapter?: AdminPublicationsAdapter;
}

const ALLOWED_EDITORIAL_ROLES: AdminRole[] = ['admin', 'editor'];

const ALLOWED_TRANSITIONS: Record<EditorialStatus, EditorialStatus[]> = {
  draft: ['review', 'archived'],
  review: ['draft', 'ready_to_publish', 'archived'],
  ready_to_publish: ['review', 'published', 'archived'],
  published: ['archived'],
  archived: ['draft'],
};

function slugify(value: string): string {
  return value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .replace(/-{2,}/g, '-');
}

function nowIso(): string {
  return new Date().toISOString();
}

function parseDateToTimestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function computeReadingTimeMinutes(content: string): number | null {
  const words = content.trim().split(/\s+/).filter(Boolean).length;

  if (words === 0) {
    return null;
  }

  return Math.max(1, Math.ceil(words / 200));
}

function normalizeListQuery(query: ListQueryInput): NormalizedListQuery {
  const normalizedQuery = query.q?.trim();

  return {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 12,
    q: normalizedQuery && normalizedQuery.length > 0 ? normalizedQuery : undefined,
    status: query.status,
  };
}

async function requireEditorialSession(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<AuthenticatedAdminUser | FastifyReply> {
  const sessionResult = await requireAdminSession(
    request,
    reply,
    ALLOWED_EDITORIAL_ROLES,
  );

  if (isFastifyReply(sessionResult)) {
    return sessionResult;
  }

  return sessionResult.user;
}

function createInMemoryAdapter(): AdminPublicationsAdapter {
  const artigosCategory: CategoryRef = {
    id: 'cat-001',
    name: 'Artigos',
    slug: 'artigos',
  };

  const governancaCategory: CategoryRef = {
    id: 'cat-002',
    name: 'Governança',
    slug: 'governanca',
  };

  const institucionalTag: TagRef = {
    id: 'tag-001',
    name: 'Institucional',
    slug: 'institucional',
  };

  const estrategiaTag: TagRef = {
    id: 'tag-002',
    name: 'Estratégia',
    slug: 'estrategia',
  };

  const editorialTag: TagRef = {
    id: 'tag-003',
    name: 'Editorial',
    slug: 'editorial',
  };

  const categories: CategoryRef[] = [artigosCategory, governancaCategory];
  const tags: TagRef[] = [institucionalTag, estrategiaTag, editorialTag];
  const records = new Map<string, AdminPublication>();

  records.set('pub-001', {
    id: 'pub-001',
    title: 'A inteligência relacional como eixo de presença institucional',
    slug: 'inteligencia-relacional-eixo-presenca-institucional',
    summary:
    'Uma introdução pública ao posicionamento institucional e à forma de produção de presença digital disciplinada.',
    content:
    'Conteúdo demonstrativo inicial para scaffold P0. Substituir por persistência real e conteúdo editorial real nas próximas ondas.',
    status: 'published',
    categoryId: artigosCategory.id,
    tagIds: [institucionalTag.id, estrategiaTag.id],
    category: artigosCategory,
    tags: [institucionalTag, estrategiaTag],
    seo: {
      metaTitle:
      'A inteligência relacional como eixo de presença institucional',
      metaDescription:
      'Introdução pública ao posicionamento institucional do projeto.',
    },
    publishedAt: '2026-04-01T12:00:00.000Z',
    updatedAt: '2026-04-01T12:00:00.000Z',
    readingTimeMinutes: 4,
  });

  records.set('pub-002', {
    id: 'pub-002',
    title: 'Fluxo editorial, clareza pública e consistência de publicação',
    slug: 'fluxo-editorial-clareza-publica-consistencia-publicacao',
    summary:
    'Como a governança editorial protege a qualidade pública sem sacrificar agilidade operacional.',
    content:
    'Conteúdo demonstrativo inicial para scaffold P0. Este registro existe para permitir paginação e edição no bootstrap.',
    status: 'review',
    categoryId: governancaCategory.id,
    tagIds: [editorialTag.id],
    category: governancaCategory,
    tags: [editorialTag],
    seo: {
      metaTitle:
      'Fluxo editorial, clareza pública e consistência de publicação',
      metaDescription:
      'Como a governança editorial sustenta qualidade e consistência.',
    },
    publishedAt: null,
    updatedAt: '2026-04-03T10:30:00.000Z',
    readingTimeMinutes: 5,
  });

  function hydrateCategory(categoryId?: string | null): CategoryRef | null {
    if (!categoryId) {
      return null;
    }

    return categories.find((category) => category.id === categoryId) ?? null;
  }

  function hydrateTags(tagIds?: string[]): TagRef[] {
    if (!tagIds || tagIds.length === 0) {
      return [];
    }

    return tags.filter((tag) => tagIds.includes(tag.id));
  }

  function ensureUniqueSlug(candidate: string, currentId?: string): string {
    const baseCandidate = candidate.trim() || DEFAULT_SLUG_BASE;
    let slug = baseCandidate;
    let suffix = 2;

    while (
      Array.from(records.values()).some(
        (record) => record.slug === slug && record.id !== currentId,
      )
    ) {
      slug = `${baseCandidate}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  return {
    async listPublications(query, _actor) {
      const normalizedQuery = query.q?.trim().toLowerCase();

      const filtered = Array.from(records.values())
      .filter((record) => {
        if (!query.status) {
          return true;
        }

        return record.status === query.status;
      })
      .filter((record) => {
        if (!normalizedQuery) {
          return true;
        }

        const haystack = [
          record.title,
          record.slug,
          record.summary,
          record.content,
          record.category?.name,
          ...record.tags.map((tag) => tag.name),
        ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .sort(
        (left, right) =>
          parseDateToTimestamp(right.updatedAt) -
          parseDateToTimestamp(left.updatedAt),
      );

      const totalItems = filtered.length;
      const totalPages =
      totalItems === 0 ? 0 : Math.ceil(totalItems / query.pageSize);
      const startIndex = (query.page - 1) * query.pageSize;

      return {
        items: filtered.slice(startIndex, startIndex + query.pageSize),
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages,
      };
    },

    async getPublicationById(id, _actor) {
      return records.get(id) ?? null;
    },

    async createDraft(input, _actor) {
      const id = `pub-${Date.now()}`;
      const title = input.title.trim();
      const slugBase = slugify(input.slug ?? title) || DEFAULT_SLUG_BASE;
      const slug = ensureUniqueSlug(slugBase);
      const timestamp = nowIso();
      const content = input.content?.trim() ?? '';

      const record: AdminPublication = {
        id,
        title,
        slug,
        summary: input.summary?.trim() ?? '',
        content,
        status: 'draft',
        categoryId: input.categoryId ?? null,
        tagIds: input.tagIds ?? [],
        category: hydrateCategory(input.categoryId ?? null),
        tags: hydrateTags(input.tagIds ?? []),
        seo: input.seo,
        publishedAt: null,
        updatedAt: timestamp,
        readingTimeMinutes: computeReadingTimeMinutes(content),
      };

      records.set(id, record);
      return record;
    },

    async updatePublication(id, input, _actor) {
      const current = records.get(id);

      if (!current) {
        return null;
      }

      const nextTitle = input.title?.trim() ?? current.title;
      const nextSlugBase =
        input.slug !== undefined
          ? slugify(input.slug) || DEFAULT_SLUG_BASE
          : current.slug;
      const nextSlug = ensureUniqueSlug(nextSlugBase, current.id);
      const nextContent =
      input.content !== undefined ? input.content.trim() : current.content;
      const nextCategoryId =
      input.categoryId !== undefined ? input.categoryId : current.categoryId;
      const nextTagIds = input.tagIds ?? current.tagIds;

      const nextRecord: AdminPublication = {
        ...current,
        title: nextTitle,
        slug: nextSlug,
        summary:
        input.summary !== undefined ? input.summary.trim() : current.summary,
        content: nextContent,
        categoryId: nextCategoryId,
        tagIds: nextTagIds,
        category: hydrateCategory(nextCategoryId),
        tags: hydrateTags(nextTagIds),
        seo: input.seo !== undefined ? input.seo : current.seo,
        updatedAt: nowIso(),
        readingTimeMinutes: computeReadingTimeMinutes(nextContent),
      };

      records.set(id, nextRecord);
      return nextRecord;
    },

    async transitionPublicationStatus(id, nextStatus, _actor) {
      const current = records.get(id);

      if (!current) {
        return null;
      }

      const allowed = ALLOWED_TRANSITIONS[current.status] ?? [];

      if (!allowed.includes(nextStatus)) {
        throw new InvalidEditorialTransitionError(
          `Cannot transition publication from ${current.status} to ${nextStatus}.`,
        );
      }

      const nextRecord: AdminPublication = {
        ...current,
        status: nextStatus,
        publishedAt:
        nextStatus === 'published'
        ? current.publishedAt ?? nowIso()
        : nextStatus === 'archived'
        ? current.publishedAt
        : null,
        updatedAt: nowIso(),
      };

      records.set(id, nextRecord);
      return nextRecord;
    },
  };
}

export const adminPublicationsRoutes: FastifyPluginAsync<
AdminPublicationsRoutesOptions
> = async (app, options = {}) => {
  const adapter = options.adapter ?? createInMemoryAdapter();

  app.get(
    BASE_PATH,
    async (
      request: FastifyRequest<{ Querystring: unknown }>,
      reply,
    ): Promise<FastifyReply> => {
      const actor = await requireEditorialSession(request, reply);

      if (isFastifyReply(actor)) {
        return actor;
      }

      const parsedQuery = listQuerySchema.safeParse(request.query);

      if (!parsedQuery.success) {
        return sendQueryValidationError(
          request,
          reply,
          mapZodIssuesToErrorDetails(parsedQuery.error.issues),
        );
      }

      const query = normalizeListQuery(parsedQuery.data);
      const result = await adapter.listPublications(query, actor);

      request.log.info(
        {
          traceId: request.id,
          userId: actor.id,
          email: actor.email,
          role: actor.role,
          page: result.page,
          pageSize: result.pageSize,
          totalItems: result.totalItems,
        },
        'admin publications list loaded',
      );

      return sendPaginatedSuccess(request, reply, result.items, {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      });
    },
  );

  app.get(
    DETAIL_PATH,
    async (
      request: FastifyRequest<{ Params: unknown }>,
      reply,
    ): Promise<FastifyReply> => {
      const actor = await requireEditorialSession(request, reply);

      if (isFastifyReply(actor)) {
        return actor;
      }

      const parsedParams = idParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        return sendParamsValidationError(
          request,
          reply,
          mapZodIssuesToErrorDetails(parsedParams.error.issues),
        );
      }

      const publication = await adapter.getPublicationById(parsedParams.data.id, actor);

      if (!publication) {
        return sendError(
          request,
          reply,
          404,
          'NOT_FOUND',
          PUBLICATION_NOT_FOUND_MESSAGE,
        );
      }

      request.log.info(
        {
          traceId: request.id,
          userId: actor.id,
          email: actor.email,
          role: actor.role,
          publicationId: publication.id,
        },
        'admin publication detail loaded',
      );

      return sendSuccess(request, reply, publication);
    },
  );

  app.post(
    BASE_PATH,
    async (
      request: FastifyRequest<{ Body: unknown }>,
      reply,
    ): Promise<FastifyReply> => {
      const actor = await requireEditorialSession(request, reply);

      if (isFastifyReply(actor)) {
        return actor;
      }

      const parsedBody = createDraftBodySchema.safeParse(request.body);

      if (!parsedBody.success) {
        return sendValidationError(
          request,
          reply,
          mapZodIssuesToErrorDetails(parsedBody.error.issues),
        );
      }

      const publication = await adapter.createDraft(parsedBody.data, actor);

      request.log.info(
        {
          traceId: request.id,
          userId: actor.id,
          email: actor.email,
          role: actor.role,
          publicationId: publication.id,
            status: publication.status,
        },
        'admin publication draft created',
      );

      return sendCreated(request, reply, publication);
    },
  );

  app.patch(
    DETAIL_PATH,
    async (
      request: FastifyRequest<{ Params: unknown; Body: unknown }>,
      reply,
    ): Promise<FastifyReply> => {
      const actor = await requireEditorialSession(request, reply);

      if (isFastifyReply(actor)) {
        return actor;
      }

      const parsedParams = idParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        return sendParamsValidationError(
          request,
          reply,
          mapZodIssuesToErrorDetails(parsedParams.error.issues),
        );
      }

      const parsedBody = updatePublicationBodySchema.safeParse(request.body);

      if (!parsedBody.success) {
        return sendValidationError(
          request,
          reply,
          mapZodIssuesToErrorDetails(parsedBody.error.issues),
        );
      }

      const publication = await adapter.updatePublication(
        parsedParams.data.id,
        parsedBody.data,
        actor,
      );

      if (!publication) {
        return sendError(
          request,
          reply,
          404,
          'NOT_FOUND',
          PUBLICATION_NOT_FOUND_MESSAGE,
        );
      }

      request.log.info(
        {
          traceId: request.id,
          userId: actor.id,
          email: actor.email,
          role: actor.role,
          publicationId: publication.id,
        },
        'admin publication updated',
      );

      return sendSuccess(request, reply, publication);
    },
  );

  app.patch(
    STATUS_PATH,
    async (
      request: FastifyRequest<{ Params: unknown; Body: unknown }>,
      reply,
    ): Promise<FastifyReply> => {
      const actor = await requireEditorialSession(request, reply);

      if (isFastifyReply(actor)) {
        return actor;
      }

      const parsedParams = idParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        return sendParamsValidationError(
          request,
          reply,
          mapZodIssuesToErrorDetails(parsedParams.error.issues),
        );
      }

      const parsedBody = transitionBodySchema.safeParse(request.body);

      if (!parsedBody.success) {
        return sendValidationError(
          request,
          reply,
          mapZodIssuesToErrorDetails(parsedBody.error.issues),
        );
      }

      try {
        const publication = await adapter.transitionPublicationStatus(
          parsedParams.data.id,
          parsedBody.data.status,
          actor,
        );

        if (!publication) {
          return sendError(
            request,
            reply,
            404,
            'NOT_FOUND',
            PUBLICATION_NOT_FOUND_MESSAGE,
          );
        }

        request.log.info(
          {
            traceId: request.id,
            userId: actor.id,
            email: actor.email,
            role: actor.role,
            publicationId: publication.id,
              nextStatus: publication.status,
          },
          'admin publication status transitioned',
        );

        return sendSuccess(request, reply, publication);
      } catch (error) {
        if (error instanceof InvalidEditorialTransitionError) {
          return sendError(
            request,
            reply,
            409,
            'INVALID_STATE_TRANSITION',
            error.message,
          );
        }

        throw error;
      }
    },
  );
};
