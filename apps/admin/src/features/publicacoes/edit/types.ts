// apps/admin/src/features/publicacoes/edit/types.ts

import type { AdminPublication, EditorialStatus } from '@william-albarello/contracts';

import type {
    FeatureErrorState,
    PublicationEditFormValues,
    PublicationSeoFormValues,
} from '../shared/types';

export type PublicationEditorFormProps = {
    values: PublicationEditFormValues;
    formId?: string;
    showSubmitButton?: boolean;
    submitting?: boolean;
    error?: FeatureErrorState | null;
    onSubmit?: (values: PublicationEditFormValues) => void;
};

export type PublicationSeoPanelProps = {
    values: PublicationSeoFormValues;
    formId?: string;
    showSubmitButton?: boolean;
    submitting?: boolean;
    error?: FeatureErrorState | null;
    onSubmit?: (values: PublicationSeoFormValues) => void;
};

export type PublicationStatusPanelProps = {
    currentStatus: EditorialStatus;
    allowedNextStatuses: EditorialStatus[];
    submitting?: boolean;
    error?: FeatureErrorState | null;
    onTransition?: (nextStatus: EditorialStatus) => void;
};

export type PublicationEditShellProps = {
    publication: AdminPublication;
    form: PublicationEditorFormProps;
    seo: PublicationSeoPanelProps;
    status: PublicationStatusPanelProps;
    backHref: string;
};
