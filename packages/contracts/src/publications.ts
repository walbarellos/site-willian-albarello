// packages/contracts/src/publications.ts

import type { ApiMeta } from './session';

export const EDITORIAL_STATUSES = [
    'draft',
'review',
'ready_to_publish',
'published',
'archived',
] as const;

export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number];

export type PublicationId = string;
export type PublicationSlug = string;
export type CategoryId = string;
export type CategorySlug = string;
export type TagId = string;
export type TagSlug = string;

export interface PaginationMeta extends ApiMeta {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface CategoryRef {
    id: CategoryId;
    name: string;
    slug: CategorySlug;
}

export interface TagRef {
    id: TagId;
    name: string;
    slug: TagSlug;
}

export interface SeoFields {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImageUrl?: string;
}

export interface PublicPublicationSummary {
    id: PublicationId;
    title: string;
    slug: PublicationSlug;
    summary: string;
    publishedAt: string;
    readingTimeMinutes?: number;
    category?: CategoryRef | null;
    tags: TagRef[];
}

export interface PublicPublicationDetail extends PublicPublicationSummary {
    content: string;
    updatedAt?: string;
    seo?: SeoFields;
}

export interface PublicPublicationListFilters {
    q?: string;
    page?: number;
    pageSize?: number;
    category?: CategorySlug;
    tag?: TagSlug;
}

export interface AdminPublicationListFilters {
    q?: string;
    page?: number;
    pageSize?: number;
    status?: EditorialStatus;
}

export type PublicPublicationListQuery = PublicPublicationListFilters;
export type AdminPublicationListQuery = AdminPublicationListFilters;

export interface AdminPublication {
    id: PublicationId;
    title: string;
    slug: PublicationSlug;
    summary: string;
    content: string;
    status: EditorialStatus;
    categoryId?: CategoryId | null;
    tagIds: TagId[];
    category?: CategoryRef | null;
    tags: TagRef[];
    seo?: SeoFields;
    publishedAt?: string | null;
    updatedAt: string;
    readingTimeMinutes?: number | null;
}

export interface SuccessListResponse<TItem> {
    data: TItem[];
    meta: PaginationMeta;
}

export interface SuccessDetailResponse<TData> {
    data: TData;
    meta: ApiMeta;
}

export type PublicPublicationListResponse =
SuccessListResponse<PublicPublicationSummary>;

export type PublicPublicationDetailResponse =
SuccessDetailResponse<PublicPublicationDetail>;

export type AdminPublicationListResponse = SuccessListResponse<AdminPublication>;

export type AdminPublicationDetailResponse =
SuccessDetailResponse<AdminPublication>;

export interface CreateAdminPublicationDraftRequest {
    title: string;
    slug?: PublicationSlug;
    summary?: string;
    content?: string;
    categoryId?: CategoryId | null;
    tagIds?: TagId[];
    seo?: SeoFields;
    status?: 'draft';
}

export interface AdminPublicationEditableFields {
    title: string;
    slug: PublicationSlug;
    summary: string;
    content: string;
    categoryId: CategoryId | null;
    tagIds: TagId[];
    seo: SeoFields;
}

type AtLeastOne<T extends Record<string, unknown>> = {
    [K in keyof T]-?: Pick<T, K> & Partial<Omit<T, K>>;
}[keyof T];

export type UpdateAdminPublicationRequest = AtLeastOne<
Partial<AdminPublicationEditableFields>
>;

export interface AdminPublicationStatusTransitionRequest {
    status: EditorialStatus;
}

export function isEditorialStatus(value: unknown): value is EditorialStatus {
    return (
        typeof value === 'string' &&
        EDITORIAL_STATUSES.includes(value as EditorialStatus)
    );
}

export function isCategoryRef(value: unknown): value is CategoryRef {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<CategoryRef>;

    return (
        typeof candidate.id === 'string' &&
        typeof candidate.name === 'string' &&
        typeof candidate.slug === 'string'
    );
}

export function isTagRef(value: unknown): value is TagRef {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<TagRef>;

    return (
        typeof candidate.id === 'string' &&
        typeof candidate.name === 'string' &&
        typeof candidate.slug === 'string'
    );
}

export function isSeoFields(value: unknown): value is SeoFields {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<SeoFields>;

    return (
        (candidate.metaTitle === undefined ||
        typeof candidate.metaTitle === 'string') &&
        (candidate.metaDescription === undefined ||
        typeof candidate.metaDescription === 'string') &&
        (candidate.canonicalUrl === undefined ||
        typeof candidate.canonicalUrl === 'string') &&
        (candidate.ogTitle === undefined ||
        typeof candidate.ogTitle === 'string') &&
        (candidate.ogDescription === undefined ||
        typeof candidate.ogDescription === 'string') &&
        (candidate.ogImageUrl === undefined ||
        typeof candidate.ogImageUrl === 'string')
    );
}

export function isPaginationMeta(value: unknown): value is PaginationMeta {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<PaginationMeta>;

    return (
        typeof candidate.traceId === 'string' &&
        typeof candidate.page === 'number' &&
        Number.isFinite(candidate.page) &&
        typeof candidate.pageSize === 'number' &&
        Number.isFinite(candidate.pageSize) &&
        typeof candidate.totalItems === 'number' &&
        Number.isFinite(candidate.totalItems) &&
        typeof candidate.totalPages === 'number' &&
        Number.isFinite(candidate.totalPages)
    );
}

export function isPublicPublicationSummary(
    value: unknown,
): value is PublicPublicationSummary {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<PublicPublicationSummary>;

    const hasValidCategory =
    candidate.category === undefined ||
    candidate.category === null ||
    isCategoryRef(candidate.category);

    const hasValidTags =
    Array.isArray(candidate.tags) &&
    candidate.tags.every(isTagRef);

    const hasValidReadingTime =
    candidate.readingTimeMinutes === undefined ||
    typeof candidate.readingTimeMinutes === 'number';

    return (
        typeof candidate.id === 'string' &&
        typeof candidate.title === 'string' &&
        typeof candidate.slug === 'string' &&
        typeof candidate.summary === 'string' &&
        typeof candidate.publishedAt === 'string' &&
        hasValidCategory &&
        hasValidTags &&
        hasValidReadingTime
    );
}

export function isPublicPublicationDetail(
    value: unknown,
): value is PublicPublicationDetail {
    if (!isPublicPublicationSummary(value)) {
        return false;
    }

    const candidate = value as Partial<PublicPublicationDetail>;

    return (
        typeof candidate.content === 'string' &&
        (candidate.updatedAt === undefined || typeof candidate.updatedAt === 'string') &&
        (candidate.seo === undefined || isSeoFields(candidate.seo))
    );
}

export function isAdminPublication(value: unknown): value is AdminPublication {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<AdminPublication>;

    const hasValidCategoryId =
    candidate.categoryId === undefined ||
    candidate.categoryId === null ||
    typeof candidate.categoryId === 'string';

    const hasValidCategory =
    candidate.category === undefined ||
    candidate.category === null ||
    isCategoryRef(candidate.category);

    const hasValidTagIds =
    Array.isArray(candidate.tagIds) &&
    candidate.tagIds.every((tagId) => typeof tagId === 'string');

    const hasValidTags =
    Array.isArray(candidate.tags) &&
    candidate.tags.every(isTagRef);

    const hasValidPublishedAt =
    candidate.publishedAt === undefined ||
    candidate.publishedAt === null ||
    typeof candidate.publishedAt === 'string';

    const hasValidReadingTime =
    candidate.readingTimeMinutes === undefined ||
    candidate.readingTimeMinutes === null ||
    typeof candidate.readingTimeMinutes === 'number';

    return (
        typeof candidate.id === 'string' &&
        typeof candidate.title === 'string' &&
        typeof candidate.slug === 'string' &&
        typeof candidate.summary === 'string' &&
        typeof candidate.content === 'string' &&
        isEditorialStatus(candidate.status) &&
        hasValidCategoryId &&
        hasValidTagIds &&
        hasValidCategory &&
        hasValidTags &&
        (candidate.seo === undefined || isSeoFields(candidate.seo)) &&
        hasValidPublishedAt &&
        typeof candidate.updatedAt === 'string'
        && hasValidReadingTime
    );
}

export function isPublicPublicationListResponse(
    value: unknown,
): value is PublicPublicationListResponse {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<PublicPublicationListResponse>;

    return (
        Array.isArray(candidate.data) &&
        candidate.data.every(isPublicPublicationSummary) &&
        isPaginationMeta(candidate.meta)
    );
}

export function isPublicPublicationDetailResponse(
    value: unknown,
): value is PublicPublicationDetailResponse {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<PublicPublicationDetailResponse>;

    return (
        isPublicPublicationDetail(candidate.data) &&
        Boolean(
            candidate.meta &&
            typeof candidate.meta === 'object' &&
            typeof (candidate.meta as Partial<ApiMeta>).traceId === 'string',
        )
    );
}

export function isAdminPublicationListResponse(
    value: unknown,
): value is AdminPublicationListResponse {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<AdminPublicationListResponse>;

    return (
        Array.isArray(candidate.data) &&
        candidate.data.every(isAdminPublication) &&
        isPaginationMeta(candidate.meta)
    );
}

export function isAdminPublicationDetailResponse(
    value: unknown,
): value is AdminPublicationDetailResponse {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<AdminPublicationDetailResponse>;

    return (
        isAdminPublication(candidate.data) &&
        Boolean(
            candidate.meta &&
            typeof candidate.meta === 'object' &&
            typeof (candidate.meta as Partial<ApiMeta>).traceId === 'string',
        )
    );
}
