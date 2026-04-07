// apps/admin/src/features/publicacoes/shared/types.ts

import type {
    AdminPublication,
    EditorialStatus,
} from '@william-albarello/contracts';

export type PublicationListItem = AdminPublication;
export type PublicationRecord = AdminPublication;
export type PublicationStatus = EditorialStatus;

export type AsyncViewState = 'idle' | 'loading' | 'success' | 'error';

export type FeatureErrorState = {
    title?: string;
    message: string;
    retryLabel?: string;
};

export type PublicationOption = {
    value: string;
    label: string;
};

export type PublicationEditFormValues = {
    title: string;
    slug: string;
    summary: string;
    content: string;
    categoryId: string | null;
    tagIds: string[];
};

export type PublicationSeoFormValues = {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImageUrl: string;
};

export function toPublicationEditFormValues(
    publication: AdminPublication,
): PublicationEditFormValues {
    return {
        title: publication.title ?? '',
        slug: publication.slug ?? '',
        summary: publication.summary ?? '',
        content: publication.content ?? '',
        categoryId: publication.categoryId ?? null,
        tagIds: publication.tagIds ?? [],
    };
}

export function toPublicationSeoFormValues(
    publication: AdminPublication,
): PublicationSeoFormValues {
    return {
        metaTitle: publication.seo?.metaTitle ?? '',
        metaDescription: publication.seo?.metaDescription ?? '',
        canonicalUrl: publication.seo?.canonicalUrl ?? '',
        ogTitle: publication.seo?.ogTitle ?? '',
        ogDescription: publication.seo?.ogDescription ?? '',
        ogImageUrl: publication.seo?.ogImageUrl ?? '',
    };
}
