// apps/web/app/publicacoes/page.tsx

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import {
  isPublicApiError,
  listPublications,
} from '../../src/lib/api/public';
import {
  PublicationsListShell,
  PublicationsListShellLoading,
} from '../../src/features/publicacoes/list/publications-list-shell';
import {
  normalizePublicationsListQuery,
  serializePublicationsListHref,
  type PublicationsListQueryState,
  type PublicationsListRawSearchParams,
} from '../../src/features/publicacoes/list/publications-list-query';
import { WEB_PUBLIC_ROUTES } from '../../src/lib/routes';

export const revalidate = 300;

type PageProps = {
  searchParams?: Promise<PublicationsListRawSearchParams> | PublicationsListRawSearchParams;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Publicacoes',
    description:
      'Listagem publica de publicacoes com descoberta organizada, leitura clara e continuidade editorial.',
    alternates: {
      canonical: WEB_PUBLIC_ROUTES.publications,
    },
  };
}

async function PublicationsResults({
  query,
}: Readonly<{
  query: PublicationsListQueryState;
}>) {
  try {
    const response = await listPublications(
      {
        page: query.page,
        pageSize: query.pageSize,
        q: query.q,
        category: query.category,
        tag: query.tag,
      },
      {
        next: { revalidate },
      },
    );

    if (
      query.page > 1 &&
      response.meta.totalItems > 0 &&
      response.meta.totalPages > 0 &&
      query.page > response.meta.totalPages
    ) {
      redirect(
        serializePublicationsListHref({
          ...query,
          page: response.meta.totalPages,
        }),
      );
    }

    return (
      <PublicationsListShell
        showHero
        query={query}
        totalItems={response.meta.totalItems}
        items={response.data}
        pagination={{
          page: response.meta.page,
          totalPages: response.meta.totalPages,
        }}
      />
    );
  } catch (error) {
    if (isPublicApiError(error) && error.status === 422) {
      redirect(
        serializePublicationsListHref({
          ...query,
          page: 1,
        }),
      );
    }

    const message = isPublicApiError(error)
      ? error.message
      : 'Ocorreu uma falha inesperada ao consultar a API publica.';

    return (
      <PublicationsListShell
        showHero
        query={query}
        totalItems={0}
        items={[]}
        errorMessage={message}
      />
    );
  }
}

export default async function PublicacoesPage({ searchParams }: PageProps) {
  const rawParams = await Promise.resolve(searchParams ?? {});
  const query = normalizePublicationsListQuery(rawParams);

  return (
    <Suspense key={JSON.stringify(query)} fallback={<PublicationsListShellLoading />}>
      <PublicationsResults query={query} />
    </Suspense>
  );
}
