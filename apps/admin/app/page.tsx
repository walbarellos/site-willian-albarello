import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { readCurrentAdminUserServer } from '../src/lib/session';
import { buildAdminLoginHref, buildProtectedRedirectHref } from '../src/lib/routes';

export const metadata: Metadata = {
  title: 'Entrada',
  description: 'Entrypoint do painel administrativo.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminEntryPage() {
  const protectedHref = buildProtectedRedirectHref();
  const loginHref = buildAdminLoginHref(protectedHref);

  try {
    const user = await readCurrentAdminUserServer({
      allowUnauthenticated: true,
      returnTo: protectedHref,
    });

    if (user) {
      redirect(protectedHref);
    }
  } catch {
    // Se a leitura de sessão falhar por erro inesperado, mantemos rota segura para login.
  }

  redirect(loginHref);
}
