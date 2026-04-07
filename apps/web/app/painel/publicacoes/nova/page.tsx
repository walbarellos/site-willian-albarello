import { redirect } from 'next/navigation';

import { createAdminPublicationDraft, isAdminApiError } from '../../../../src/lib/admin/api';
import {
  buildAdminPublicationEditHref,
  buildAdminPublicationsHref,
} from '../../../../src/lib/admin/routes';
import { requireAdminSessionServer } from '../../../../src/lib/admin/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPublicationCreatePage() {
  await requireAdminSessionServer({
    allowedRoles: ['admin', 'editor'],
    returnTo: '/painel/publicacoes/nova',
  });

  try {
    const created = await createAdminPublicationDraft(
      {
        title: 'Nova publicação',
      },
      {
        includeServerCookies: true,
      },
    );

    redirect(buildAdminPublicationEditHref(created.data.id));
  } catch (error) {
    if (isAdminApiError(error) && (error.status === 401 || error.status === 403)) {
      redirect('/painel/login?next=%2Fpainel%2Fpublicacoes%2Fnova');
    }

    redirect(`${buildAdminPublicationsHref()}?error=create-failed`);
  }
}

