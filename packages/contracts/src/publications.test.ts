import { describe, expect, it } from 'vitest';

import {
  EDITORIAL_STATUSES,
  isAdminPublication,
  isAdminPublicationDetailResponse,
  isAdminPublicationListResponse,
  isCategoryRef,
  isEditorialStatus,
  isPaginationMeta,
  isPublicPublicationDetail,
  isPublicPublicationDetailResponse,
  isPublicPublicationListResponse,
  isPublicPublicationSummary,
  isSeoFields,
  isTagRef,
} from './publications';

const category = {
  id: 'cat-1',
  name: 'Tecnologia',
  slug: 'tecnologia',
};

const tag = {
  id: 'tag-1',
  name: 'JavaScript',
  slug: 'javascript',
};

const seo = {
  metaTitle: 'Meta title',
  metaDescription: 'Meta description',
  canonicalUrl: 'https://example.com/publicacoes/exemplo',
  ogTitle: 'OG title',
  ogDescription: 'OG description',
  ogImageUrl: 'https://example.com/og.png',
};

const paginationMeta = {
  traceId: 'trace-123',
  page: 1,
  pageSize: 10,
  totalItems: 1,
  totalPages: 1,
};

const publicSummary = {
  id: 'pub-1',
  title: 'Publicacao Exemplo',
  slug: 'publicacao-exemplo',
  summary: 'Resumo',
  publishedAt: '2026-01-15T12:00:00.000Z',
  readingTimeMinutes: 8,
  category,
  tags: [tag],
};

const publicDetail = {
  ...publicSummary,
  content: '# Conteudo completo',
  updatedAt: '2026-01-16T12:00:00.000Z',
  seo,
};

const adminPublication = {
  id: 'pub-1',
  title: 'Publicacao Exemplo',
  slug: 'publicacao-exemplo',
  summary: 'Resumo',
  content: '# Conteudo completo',
  status: 'review',
  categoryId: 'cat-1',
  tagIds: ['tag-1'],
  category,
  tags: [tag],
  seo,
  publishedAt: null,
  updatedAt: '2026-01-16T12:00:00.000Z',
  readingTimeMinutes: 8,
} as const;

describe('contracts/publications', () => {
  describe('editorial statuses', () => {
    it('accepts every status declared in EDITORIAL_STATUSES', () => {
      for (const status of EDITORIAL_STATUSES) {
        expect(isEditorialStatus(status)).toBe(true);
      }
    });

    it('rejects unknown editorial statuses', () => {
      expect(isEditorialStatus('pending_publish')).toBe(false);
      expect(isEditorialStatus('')).toBe(false);
      expect(isEditorialStatus(null)).toBe(false);
      expect(isEditorialStatus(123)).toBe(false);
    });
  });

  describe('primitive refs and metadata', () => {
    it('validates category and tag refs', () => {
      expect(isCategoryRef(category)).toBe(true);
      expect(isTagRef(tag)).toBe(true);

      expect(isCategoryRef({ ...category, id: 1 })).toBe(false);
      expect(isTagRef({ ...tag, slug: 99 })).toBe(false);
      expect(isCategoryRef(null)).toBe(false);
      expect(isTagRef(undefined)).toBe(false);
    });

    it('validates seo fields', () => {
      expect(isSeoFields(seo)).toBe(true);
      expect(isSeoFields({})).toBe(true);

      expect(isSeoFields({ ...seo, ogImageUrl: 10 })).toBe(false);
      expect(isSeoFields('seo')).toBe(false);
      expect(isSeoFields(null)).toBe(false);
    });

    it('validates pagination metadata', () => {
      expect(isPaginationMeta(paginationMeta)).toBe(true);
      expect(isPaginationMeta({ ...paginationMeta, page: 1.5 })).toBe(true);

      expect(isPaginationMeta({ ...paginationMeta, traceId: 1 })).toBe(false);
      expect(isPaginationMeta({ ...paginationMeta, totalItems: '1' })).toBe(false);
      expect(isPaginationMeta(null)).toBe(false);
    });
  });

  describe('public contracts', () => {
    it('validates public publication summary and detail', () => {
      expect(isPublicPublicationSummary(publicSummary)).toBe(true);
      expect(isPublicPublicationDetail(publicDetail)).toBe(true);

      expect(isPublicPublicationSummary({ ...publicSummary, tags: [{ id: 1 }] })).toBe(false);
      expect(isPublicPublicationDetail({ ...publicDetail, content: 42 })).toBe(false);
    });

    it('validates public list and detail envelopes', () => {
      const listResponse = {
        data: [publicSummary],
        meta: paginationMeta,
      };

      const detailResponse = {
        data: publicDetail,
        meta: { traceId: 'trace-123' },
      };

      expect(isPublicPublicationListResponse(listResponse)).toBe(true);
      expect(isPublicPublicationDetailResponse(detailResponse)).toBe(true);

      expect(
        isPublicPublicationListResponse({
          data: [publicSummary],
          meta: { ...paginationMeta, page: '1' },
        }),
      ).toBe(false);

      expect(
        isPublicPublicationDetailResponse({
          data: { ...publicDetail, seo: { ...seo, ogTitle: 9 } },
          meta: { traceId: 'trace-123' },
        }),
      ).toBe(false);
    });
  });

  describe('admin contracts', () => {
    it('validates admin publication entity', () => {
      expect(isAdminPublication(adminPublication)).toBe(true);

      expect(isAdminPublication({ ...adminPublication, status: 'unknown' })).toBe(false);
      expect(isAdminPublication({ ...adminPublication, tagIds: ['tag-1', 2] })).toBe(false);
      expect(isAdminPublication({ ...adminPublication, updatedAt: 123 })).toBe(false);
    });

    it('validates admin list and detail envelopes', () => {
      const listResponse = {
        data: [adminPublication],
        meta: paginationMeta,
      };

      const detailResponse = {
        data: adminPublication,
        meta: { traceId: 'trace-123' },
      };

      expect(isAdminPublicationListResponse(listResponse)).toBe(true);
      expect(isAdminPublicationDetailResponse(detailResponse)).toBe(true);

      expect(
        isAdminPublicationListResponse({
          data: [adminPublication],
          meta: { ...paginationMeta, pageSize: '10' },
        }),
      ).toBe(false);

      expect(
        isAdminPublicationDetailResponse({
          data: { ...adminPublication, seo: { ...seo, canonicalUrl: 7 } },
          meta: { traceId: 'trace-123' },
        }),
      ).toBe(false);
    });
  });
});
