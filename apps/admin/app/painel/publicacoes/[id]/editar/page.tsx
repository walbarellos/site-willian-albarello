// apps/admin/app/painel/publicacoes/[id]/editar/page.tsx

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import type { EditorialStatus } from '@william-albarello/contracts';
import {
  AdminPageShell,
} from '@william-albarello/ui';

import {
  getAdminPublicationById,
  isAdminApiError,
  transitionAdminPublicationStatus,
  updateAdminPublication,
} from '../../../../../src/lib/api/admin';
import {
  buildAdminPublicationEditHref,
  buildAdminPublicationsHref,
} from '../../../../../src/lib/routes';
import { requireAdminSessionServer } from '../../../../../src/lib/session';
import {
  PublicationEditShell,
} from '../../../../../src/features/publicacoes/edit';
import { PublicationEditSidebars } from '../../../../../src/features/publicacoes/edit/publication-edit-sidebars';
import {
  PUBLICATION_ALLOWED_TRANSITIONS,
  toPublicationEditFormValues,
  toPublicationSeoFormValues,
  type PublicationEditFormValues,
  type PublicationSeoFormValues,
} from '../../../../../src/features/publicacoes/shared';

export const metadata: Metadata = {
  title: 'Editar publicação',
  description:
  'Edição administrativa de publicação com leitura explícita do status editorial e persistência controlada.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageParams = {
  id: string;
};

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  params: Promise<PageParams>;
  searchParams?: Promise<SearchParams>;
};

type FeedbackCode =
| 'saved'
| 'status-updated'
| 'validation'
| 'save-failed'
| 'transition-failed'
| 'session-failed';

function isNextRedirectError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  if (!('digest' in error)) {
    return false;
  }

  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT');
}

function getSingleSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function buildEditHref(id: string, code?: FeedbackCode): string {
  const base = buildAdminPublicationEditHref(id);

  if (!code) {
    return base;
  }

  const params = new URLSearchParams();
  params.set('feedback', code);

  return `${base}?${params.toString()}`;
}

function normalizeSeoPayload(values: PublicationSeoFormValues) {
  const metaTitle = values.metaTitle.trim();
  const metaDescription = values.metaDescription.trim();
  const canonicalUrl = values.canonicalUrl.trim();
  const ogTitle = values.ogTitle.trim();
  const ogDescription = values.ogDescription.trim();
  const ogImageUrl = values.ogImageUrl.trim();

  const hasSeo =
  metaTitle ||
  metaDescription ||
  canonicalUrl ||
  ogTitle ||
  ogDescription ||
  ogImageUrl;

  if (!hasSeo) {
    return undefined;
  }

  return {
    ...(metaTitle ? { metaTitle } : {}),
    ...(metaDescription ? { metaDescription } : {}),
    ...(canonicalUrl ? { canonicalUrl } : {}),
    ...(ogTitle ? { ogTitle } : {}),
    ...(ogDescription ? { ogDescription } : {}),
    ...(ogImageUrl ? { ogImageUrl } : {}),
  };
}

async function readPublicationOr404(id: string) {
  try {
    const response = await getAdminPublicationById(id, {
      includeServerCookies: true,
      autoCsrf: false,
    });

    return response.data;
  } catch (error) {
    if (isAdminApiError(error) && error.status === 404) {
      notFound();
    }

    if (
      isAdminApiError(error) &&
      (error.status === 401 || error.status === 403)
    ) {
      redirect(buildEditHref(id, 'session-failed'));
    }

    throw error;
  }
}

function Shell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
    style={{
      width: '100%',
      maxWidth: 1280,
      margin: '0 auto',
    }}
    >
    {children}
    </div>
  );
}

export default async function AdminPublicationEditPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const publicationId = resolvedParams?.id?.trim();

  if (!publicationId) {
    redirect(buildAdminPublicationsHref());
  }

  const safePublicationId = publicationId;

  await requireAdminSessionServer({
    allowedRoles: ['admin', 'editor'],
    returnTo: buildEditHref(safePublicationId),
  });

  const publication = await readPublicationOr404(safePublicationId);
  const feedbackCode = getSingleSearchParam(resolvedSearchParams.feedback);
  const availableTransitions =
  PUBLICATION_ALLOWED_TRANSITIONS[publication.status] ?? [];

  async function saveMainContentAction(values: PublicationEditFormValues) {
    'use server';

    await requireAdminSessionServer({
      allowedRoles: ['admin', 'editor'],
      returnTo: buildEditHref(safePublicationId),
    });

    try {
      const response = await updateAdminPublication(
        safePublicationId,
        {
          title: values.title.trim(),
                                                    slug: values.slug.trim(),
                                                    summary: values.summary.trim(),
                                                    content: values.content.trim(),
                                                    categoryId: values.categoryId,
                                                    tagIds: values.tagIds,
        },
        {
          includeServerCookies: true,
        },
      );

      revalidatePath(buildAdminPublicationsHref());
      revalidatePath(buildEditHref(safePublicationId));
      revalidatePath('/publicacoes');

      const slugsToRevalidate = new Set<string>();

      if (publication.slug) {
        slugsToRevalidate.add(publication.slug);
      }

      if (response.data.slug) {
        slugsToRevalidate.add(response.data.slug);
      }

      for (const slug of slugsToRevalidate) {
        revalidatePath(`/publicacoes/${slug}`);
      }

      redirect(buildEditHref(safePublicationId, 'saved'));
    } catch (error: unknown) {
      if (isNextRedirectError(error)) {
        throw error;
      }

      if (isAdminApiError(error)) {
        if (error.status === 401 || error.status === 403) {
          redirect(buildEditHref(safePublicationId, 'session-failed'));
        }

        if (error.status === 422) {
          redirect(buildEditHref(safePublicationId, 'validation'));
        }
      }

      redirect(buildEditHref(safePublicationId, 'save-failed'));
    }
  }

  async function saveSeoAction(values: PublicationSeoFormValues) {
    'use server';

    await requireAdminSessionServer({
      allowedRoles: ['admin', 'editor'],
      returnTo: buildEditHref(safePublicationId),
    });

    try {
      const response = await updateAdminPublication(
        safePublicationId,
        {
          seo: normalizeSeoPayload(values),
        },
        {
          includeServerCookies: true,
        },
      );

      revalidatePath(buildAdminPublicationsHref());
      revalidatePath(buildEditHref(safePublicationId));
      revalidatePath('/publicacoes');

      const slugsToRevalidate = new Set<string>();

      if (publication.slug) {
        slugsToRevalidate.add(publication.slug);
      }

      if (response.data.slug) {
        slugsToRevalidate.add(response.data.slug);
      }

      for (const slug of slugsToRevalidate) {
        revalidatePath(`/publicacoes/${slug}`);
      }

      redirect(buildEditHref(safePublicationId, 'saved'));
    } catch (error: unknown) {
      if (isNextRedirectError(error)) {
        throw error;
      }

      if (isAdminApiError(error)) {
        if (error.status === 401 || error.status === 403) {
          redirect(buildEditHref(safePublicationId, 'session-failed'));
        }

        if (error.status === 422) {
          redirect(buildEditHref(safePublicationId, 'validation'));
        }
      }

      redirect(buildEditHref(safePublicationId, 'save-failed'));
    }
  }

  async function transitionStatusAction(nextStatus: EditorialStatus) {
    'use server';

    await requireAdminSessionServer({
      allowedRoles: ['admin', 'editor'],
      returnTo: buildEditHref(safePublicationId),
    });

    try {
      const response = await transitionAdminPublicationStatus(
        safePublicationId,
        { status: nextStatus },
        {
          includeServerCookies: true,
        },
      );

      revalidatePath(buildAdminPublicationsHref());
      revalidatePath(buildEditHref(safePublicationId));
      revalidatePath('/publicacoes');

      const slugsToRevalidate = new Set<string>();

      if (publication.slug) {
        slugsToRevalidate.add(publication.slug);
      }

      if (response.data.slug) {
        slugsToRevalidate.add(response.data.slug);
      }

      for (const slug of slugsToRevalidate) {
        revalidatePath(`/publicacoes/${slug}`);
      }

      redirect(buildEditHref(safePublicationId, 'status-updated'));
    } catch (error: unknown) {
      if (isNextRedirectError(error)) {
        throw error;
      }

      if (isAdminApiError(error)) {
        if (error.status === 401 || error.status === 403) {
          redirect(buildEditHref(safePublicationId, 'session-failed'));
        }
      }

      redirect(buildEditHref(safePublicationId, 'transition-failed'));
    }
  }

  return (
    <main>
    <AdminPageShell
      maxWidth={1280}
      padding="1.5rem 1.25rem 2rem"
      contentGap="1rem"
    >
    <section
    aria-labelledby="admin-publication-edit-content"
    style={{
      paddingBottom: '1.5rem',
    }}
    >
    <Shell>
    <div
    style={{
      display: 'grid',
      gap: '1rem',
    }}
    >
    <div
    style={{
      display: 'grid',
      gap: '1rem',
      gridTemplateColumns: 'minmax(0, 1fr)',
      alignItems: 'start',
    }}
    >
    <div id="admin-publication-edit-content">
    <PublicationEditShell
    publication={publication}
    feedbackCode={feedbackCode}
    backHref={buildAdminPublicationsHref()}
    form={{
      values: toPublicationEditFormValues(publication),
          onSubmit: saveMainContentAction,
    }}
    seo={{
      values: toPublicationSeoFormValues(publication),
          onSubmit: saveSeoAction,
    }}
    status={{
      currentStatus: publication.status,
      allowedNextStatuses: availableTransitions,
      onTransition: transitionStatusAction,
    }}
    />
    </div>

    <PublicationEditSidebars
    status={publication.status}
    updatedAt={publication.updatedAt}
    publishedAt={publication.publishedAt}
    slug={publication.slug}
    />
    </div>
    </div>
    </Shell>
    </section>
    </AdminPageShell>
    </main>
  );
}
