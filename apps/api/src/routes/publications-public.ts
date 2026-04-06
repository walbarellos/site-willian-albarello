// apps/api/src/routes/publications-public.ts

import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import {
  mapZodIssuesToErrorDetails,
  sendError,
  sendPaginatedSuccess,
  sendParamsValidationError,
  sendQueryValidationError,
  sendSuccess,
} from '../lib/http-contract.js';

const LIST_PATH = '/v1/public/publications';
const DETAIL_PATH = '/v1/public/publications/:slug';
const PUBLICATION_NOT_FOUND_MESSAGE = 'Published publication not found.';

const editorialStatusSchema = z.enum([
  'draft',
  'review',
  'ready_to_publish',
  'published',
  'archived',
]);

const listQuerySchema = z
.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
  category: z.string().trim().min(1).optional(),
  tag: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})
.strict();

const detailParamsSchema = z
.object({
  slug: z
  .string()
  .trim()
  .min(1, 'Slug is required.')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe.'),
})
.strict();

type EditorialStatus = z.infer<typeof editorialStatusSchema>;
type PublicPublicationsListQuery = z.infer<typeof listQuerySchema>;
type PublicPublicationDetailParams = z.infer<typeof detailParamsSchema>;

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

type SeoFields = {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
};

type PublicPublicationSummary = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  publishedAt: string;
  readingTimeMinutes?: number;
  category?: CategoryRef | null;
  tags: TagRef[];
};

type PublicPublicationDetail = PublicPublicationSummary & {
  content: string;
  updatedAt?: string;
  seo?: SeoFields;
};

type PublicPublicationRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: EditorialStatus;
  publishedAt?: string;
  updatedAt?: string;
  readingTimeMinutes?: number;
  category?: CategoryRef | null;
  tags: TagRef[];
  seo?: SeoFields;
};

type PublicationListResult = {
  items: PublicPublicationRecord[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type NormalizedListQuery = Required<
Pick<PublicPublicationsListQuery, 'page' | 'pageSize'>
> &
Omit<PublicPublicationsListQuery, 'page' | 'pageSize'>;

export interface PublicPublicationsAdapter {
  listPublishedPublications(
    query: NormalizedListQuery,
  ): Promise<PublicationListResult>;

  getPublishedPublicationBySlug(
    slug: string,
  ): Promise<PublicPublicationRecord | null>;
}

export interface PublicPublicationsRoutesOptions {
  adapter?: PublicPublicationsAdapter;
}

function normalizeListQuery(
  query: PublicPublicationsListQuery,
): NormalizedListQuery {
  const normalizeOptionalText = (value?: string): string | undefined => {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
  };

  return {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 12,
    category: normalizeOptionalText(query.category),
    tag: normalizeOptionalText(query.tag),
    q: normalizeOptionalText(query.q),
  };
}

function parseDateToTimestamp(value?: string): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeRecordDate(record: PublicPublicationRecord): string {
  return record.publishedAt ?? record.updatedAt ?? new Date(0).toISOString();
}

function toSummary(record: PublicPublicationRecord): PublicPublicationSummary {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    summary: record.summary,
    publishedAt: normalizeRecordDate(record),
    readingTimeMinutes: record.readingTimeMinutes,
    category: record.category ?? null,
    tags: record.tags ?? [],
  };
}

function toDetail(record: PublicPublicationRecord): PublicPublicationDetail {
  return {
    ...toSummary(record),
    content: record.content,
    updatedAt: record.updatedAt,
    seo: record.seo,
  };
}

function createInMemoryAdapter(): PublicPublicationsAdapter {
  const records: PublicPublicationRecord[] = [
    {
      id: 'pub-001',
      title: 'A inteligência relacional como eixo de presença institucional',
      slug: 'inteligencia-relacional-eixo-presenca-institucional',
      summary:
      'Uma introdução pública ao posicionamento institucional e à forma de produção de presença digital disciplinada.',
      content:
      'Conteúdo demonstrativo inicial para scaffold P0. Substituir por persistência real e conteúdo editorial real nas próximas ondas.',
      status: 'published',
      publishedAt: '2026-04-01T12:00:00.000Z',
      updatedAt: '2026-04-01T12:00:00.000Z',
      readingTimeMinutes: 4,
      category: {
        id: 'cat-001',
        name: 'Artigos',
        slug: 'artigos',
      },
      tags: [
        {
          id: 'tag-001',
          name: 'Institucional',
          slug: 'institucional',
        },
        {
          id: 'tag-002',
          name: 'Estratégia',
          slug: 'estrategia',
        },
      ],
      seo: {
        metaTitle:
        'A inteligência relacional como eixo de presença institucional',
        metaDescription:
        'Introdução pública ao posicionamento institucional do projeto.',
      },
    },
    {
      id: 'pub-002',
      title: 'Fluxo editorial, clareza pública e consistência de publicação',
      slug: 'fluxo-editorial-clareza-publica-consistencia-publicacao',
      summary:
      'Como a governança editorial protege a qualidade pública sem sacrificar agilidade operacional.',
      content:
      'Conteúdo demonstrativo inicial para scaffold P0. Este registro existe para permitir paginação e detalhe no bootstrap.',
      status: 'published',
      publishedAt: '2026-04-02T09:30:00.000Z',
      updatedAt: '2026-04-02T09:30:00.000Z',
      readingTimeMinutes: 6,
      category: {
        id: 'cat-002',
        name: 'Governança',
        slug: 'governanca',
      },
      tags: [
        {
          id: 'tag-003',
          name: 'Editorial',
          slug: 'editorial',
        },
      ],
      seo: {
        metaTitle:
        'Fluxo editorial, clareza pública e consistência de publicação',
        metaDescription:
        'Como a governança editorial sustenta qualidade e consistência.',
      },
    },
    {
      id: 'pub-003',
      title: 'Rascunho interno não público',
      slug: 'rascunho-interno-nao-publico',
      summary: 'Este conteúdo não deve ser exposto publicamente.',
      content: 'Conteúdo de rascunho.',
      status: 'draft',
      readingTimeMinutes: 2,
      category: null,
      tags: [],
    },
  ];

  return {
    async listPublishedPublications(query) {
      const normalizedQuery = query.q?.toLowerCase();
      const normalizedCategory = query.category?.toLowerCase();
      const normalizedTag = query.tag?.toLowerCase();

      const filtered = records
      .filter((record) => record.status === 'published')
      .filter((record) => {
        if (!normalizedCategory) {
          return true;
        }

        return record.category?.slug.toLowerCase() === normalizedCategory;
      })
      .filter((record) => {
        if (!normalizedTag) {
          return true;
        }

        return record.tags.some(
          (tag) => tag.slug.toLowerCase() === normalizedTag,
        );
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
      .sort((left, right) => {
        const leftTimestamp = parseDateToTimestamp(left.publishedAt);
        const rightTimestamp = parseDateToTimestamp(right.publishedAt);

        return rightTimestamp - leftTimestamp;
      });

      const totalItems = filtered.length;
      const totalPages =
      totalItems === 0 ? 0 : Math.ceil(totalItems / query.pageSize);
      const startIndex = (query.page - 1) * query.pageSize;
      const items = filtered.slice(startIndex, startIndex + query.pageSize);

      return {
        items,
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages,
      };
    },

    async getPublishedPublicationBySlug(slug) {
      const normalizedSlug = slug.trim().toLowerCase();

      return (
        records.find(
          (record) =>
          record.status === 'published' &&
          record.slug.trim().toLowerCase() === normalizedSlug,
        ) ?? null
      );
    },
  };
}

export const publicPublicationsRoutes: FastifyPluginAsync<
PublicPublicationsRoutesOptions
> = async (app, options = {}) => {
  const adapter = options.adapter ?? createInMemoryAdapter();

  app.get(
    LIST_PATH,
    async (
      request: FastifyRequest<{ Querystring: unknown }>,
      reply: FastifyReply,
    ): Promise<FastifyReply> => {
      const parsedQuery = listQuerySchema.safeParse(request.query);

      if (!parsedQuery.success) {
        return sendQueryValidationError(
          request,
          reply,
          mapZodIssuesToErrorDetails(parsedQuery.error.issues),
        );
      }

      const query = normalizeListQuery(parsedQuery.data);
      const result = await adapter.listPublishedPublications(query);

      return sendPaginatedSuccess(
        request,
        reply,
        result.items.map(toSummary),
                                  {
                                    page: result.page,
                                    pageSize: result.pageSize,
                                    totalItems: result.totalItems,
                                    totalPages: result.totalPages,
                                  },
      );
    },
  );

  app.get(
    DETAIL_PATH,
    async (
      request: FastifyRequest<{ Params: unknown }>,
      reply: FastifyReply,
    ): Promise<FastifyReply> => {
      const parsedParams = detailParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        return sendParamsValidationError(
          request,
          reply,
          mapZodIssuesToErrorDetails(parsedParams.error.issues),
        );
      }

      const publication = await adapter.getPublishedPublicationBySlug(
        parsedParams.data.slug,
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

      return sendSuccess(request, reply, toDetail(publication));
    },
  );
};
