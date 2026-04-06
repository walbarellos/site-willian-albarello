// apps/admin/src/features/publicacoes/list/types.ts

import type {
    AdminPublicationListQuery,
    EditorialStatus,
} from '@william-albarello/contracts';

import type {
    FeatureErrorState,
    PublicationListItem,
} from '../shared/types';

export type PublicationsListFilterValues = {
    q: string;
    status: EditorialStatus | '';
};

export type PublicationsListShellProps = {
    items: PublicationListItem[];
    query: AdminPublicationListQuery;
    loading?: boolean;
    error?: FeatureErrorState | null;
    onRetryHref?: string;
    buildEditHref: (id: string) => string;
    createPublicationHref?: string;
    deleteDraftAction?: (publicationId: string) => Promise<void>;
};

export type PublicationsFiltersProps = {
    values: PublicationsListFilterValues;
    onSubmit?: (values: PublicationsListFilterValues) => void;
    onClear?: () => void;
};

export type PublicationsTableProps = {
    items: PublicationListItem[];
    buildEditHref: (id: string) => string;
    deleteDraftAction?: (publicationId: string) => Promise<void>;
};

export type PublicationsListStateProps = {
    loading?: boolean;
    error?: FeatureErrorState | null;
    isEmpty: boolean;
    emptyTitle?: string;
    emptyMessage?: string;
    retryHref?: string;
};
