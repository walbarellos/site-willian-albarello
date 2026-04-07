import Link from 'next/link';
import type { ReactNode } from 'react';
import { AdminPageShell, AdminSupportBlock } from '@william-albarello/ui';

import { AdminLoginFeedback } from './admin-login-feedback';

export type AdminLoginShellProps = {
  notice?: string | null;
  formError?: string | null;
  nextPath: string;
  backHref: string;
  children: ReactNode;
};

export function AdminLoginShell({
  notice,
  formError,
  nextPath,
  backHref,
  children,
}: AdminLoginShellProps) {
  return (
    <main>
      <AdminPageShell maxWidth={860} padding="1.5rem 1rem 2rem" align="center">
        <section
          aria-labelledby="admin-login-title"
          style={{
            width: '100%',
            maxWidth: 560,
          }}
        >
          <div
            style={{
              display: 'grid',
              gap: '1.25rem',
              padding: '1.5rem',
              borderRadius: 24,
              background: '#ffffff',
              border: '1px solid #e4e7ec',
              boxShadow: '0 12px 32px rgba(16, 24, 40, 0.06)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gap: '0.85rem',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  width: 'fit-content',
                  minHeight: 30,
                  alignItems: 'center',
                  paddingInline: '0.8rem',
                  borderRadius: 999,
                  background: '#eef4ff',
                  color: '#175cd3',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
              >
                Acesso administrativo
              </span>

              <div
                style={{
                  display: 'grid',
                  gap: '0.5rem',
                }}
              >
                <h1
                  id="admin-login-title"
                  style={{
                    margin: 0,
                    color: '#101828',
                    fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                    lineHeight: 1.08,
                    letterSpacing: '-0.03em',
                  }}
                >
                  Entrar no painel
                </h1>

                <p
                  style={{
                    margin: 0,
                    color: '#475467',
                    lineHeight: 1.75,
                    maxWidth: 460,
                  }}
                >
                  Use suas credenciais administrativas para acessar o fluxo
                  editorial interno com seguranca e clareza operacional.
                </p>
              </div>
            </div>

            <AdminLoginFeedback notice={notice} formError={formError} />

            {children}

            <div
              style={{
                paddingTop: '0.25rem',
                borderTop: '1px solid #eaecf0',
                display: 'grid',
                gap: '0.65rem',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#667085',
                  fontSize: '0.88rem',
                  lineHeight: 1.65,
                }}
              >
                Apos a autenticacao, o fluxo segue para{' '}
                <strong style={{ color: '#344054' }}>{nextPath}</strong>.
              </p>

              <Link href={backHref} style={backLinkStyle}>
                Voltar ao inicio
              </Link>
            </div>
          </div>
        </section>

        <section
          aria-label="Apoio de seguranca do login administrativo"
          style={{
            width: '100%',
            maxWidth: 560,
          }}
        >
          <AdminSupportBlock
            title="Acesso operacional seguro"
            subtitle="Metodo Caracol"
            tone="info"
            compact
          >
            Use apenas credenciais administrativas autorizadas. Se houver falha
            repetida, nao force tentativas: valide sessao e contexto antes de
            prosseguir para o painel editorial.
          </AdminSupportBlock>
        </section>
      </AdminPageShell>
    </main>
  );
}

const backLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  width: 'fit-content',
  paddingInline: '0.95rem',
  borderRadius: 12,
  background: '#ffffff',
  color: '#344054',
  textDecoration: 'none',
  fontWeight: 700,
  border: '1px solid #d0d5dd',
};
