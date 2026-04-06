// apps/admin/app/painel/publicacoes/page.tsx

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import type {
  AdminPublicationListQuery,
  AdminPublicationListResponse,
  EditorialStatus,
} from '@william-albarello/contracts';

import {
  deleteAdminPublicationDraft,
  isAdminApiError,
  listAdminPublications,
} from '../../../src/lib/api/admin';
import {
  buildAdminPublicationCreateHref,
  buildAdminPublicationEditHref,
  buildAdminPublicationsHref,
  resolveProtectedAdminLoginHref,
} from '../../../src/lib/routes';
import { requireAdminSessionServer } from '../../../src/lib/session';
import { PublicationsListShell } from '../../../src/features/publicacoes/list';
import { PUBLICATION_STATUS_OPTIONS } from '../../../src/features/publicacoes/shared/status';

export const metadata: Metadata = {
  title: 'Publicações',
  description:
    'Listagem administrativa de publicações para operação editorial interna.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

type PublicationsQueryState = Required<
  Pick<AdminPublicationListQuery, 'page' | 'pageSize'>
> &
  Omit<AdminPublicationListQuery, 'page' | 'pageSize'>;

type PublicationsState = {
  items: AdminPublicationListResponse['data'];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
  error?: {
    title: string;
    message: string;
    retryLabel?: string;
  };
};

const PAGE_SIZE = 12;
const STATUS_VALUES = new Set<EditorialStatus>(
  PUBLICATION_STATUS_OPTIONS.map((option) => option.value),
);

function getSingleSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeQuery(raw: SearchParams): PublicationsQueryState {
  const rawQ = getSingleSearchParam(raw.q)?.trim();
  const rawPage = getSingleSearchParam(raw.page);
  const rawStatus = getSingleSearchParam(raw.status)?.trim();

  const parsedPage = Number(rawPage);
  const page =
    Number.isFinite(parsedPage) && parsedPage >= 1
      ? Math.floor(parsedPage)
      : 1;

  const status =
    rawStatus && STATUS_VALUES.has(rawStatus as EditorialStatus)
      ? (rawStatus as EditorialStatus)
      : undefined;

  return {
    q: rawQ && rawQ.length > 0 ? rawQ : undefined,
    page,
    pageSize: PAGE_SIZE,
    status,
  };
}

async function readPublicationsState(
  query: PublicationsQueryState,
  currentHref: string,
): Promise<PublicationsState> {
  try {
    const response = await listAdminPublications(
      {
        page: query.page,
        pageSize: query.pageSize,
        q: query.q,
        status: query.status,
      },
      {
        includeServerCookies: true,
        autoCsrf: false,
      },
    );

    return {
      items: response.data,
      pagination: {
        page: response.meta.page,
        totalPages: response.meta.totalPages,
        totalItems: response.meta.totalItems,
      },
    };
  } catch (error: unknown) {
    if (
      isAdminApiError(error) &&
      (error.status === 401 || error.status === 403)
    ) {
      redirect(resolveProtectedAdminLoginHref(currentHref));
    }

    const message = isAdminApiError(error)
      ? error.message
      : 'Ocorreu uma falha inesperada ao consultar a API administrativa.';

    return {
      items: [],
      pagination: {
        page: query.page,
        totalPages: 1,
        totalItems: 0,
      },
      error: {
        title: 'Não foi possível carregar a lista agora',
        message,
        retryLabel: 'Tentar novamente',
      },
    };
  }
}

export default async function AdminPublicationsPage({ searchParams }: PageProps) {
  const query = normalizeQuery((await searchParams) ?? {});
  const currentHref = buildAdminPublicationsHref(query);

  await requireAdminSessionServer({
    allowedRoles: ['admin', 'editor'],
    returnTo: currentHref,
  });

  const state = await readPublicationsState(query, currentHref);

  async function deleteDraftAction(publicationId: string) {
    'use server';

    await requireAdminSessionServer({
      allowedRoles: ['admin', 'editor'],
      returnTo: currentHref,
    });

    if (!publicationId || !publicationId.trim()) {
      redirect(currentHref);
    }

    try {
      await deleteAdminPublicationDraft(publicationId.trim(), {
        includeServerCookies: true,
      });
      redirect(currentHref);
    } catch (error: unknown) {
      if (isAdminApiError(error) && (error.status === 401 || error.status === 403)) {
        redirect(resolveProtectedAdminLoginHref(currentHref));
      }

      redirect(currentHref);
    }
  }

  return (
    <PublicationsListShell
      items={state.items}
      query={query}
      buildEditHref={buildAdminPublicationEditHref}
      createPublicationHref={buildAdminPublicationCreateHref()}
      deleteDraftAction={deleteDraftAction}
      onRetryHref={currentHref}
      error={state.error}
      pagination={{
        page: state.pagination.page,
        totalPages: state.pagination.totalPages,
      }}
    />
  );
}
