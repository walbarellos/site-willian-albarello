// apps/admin/app/painel/login/page.tsx

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import {
  getCurrentAdminSession,
  isAdminApiError,
  loginAdmin,
} from '../../../src/lib/admin/api';
import {
  resolveAdminPostLoginHref,
} from '../../../src/lib/admin/routes';
import { AdminLoginShell } from '../../../src/features-admin/auth/admin-login-shell';

type FieldErrors = Partial<Record<'email' | 'password', string>>;

function validateLoginInput(input: {
  email: string;
  password: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const normalizedEmail = input.email.trim();

  if (!normalizedEmail) {
    errors.email = 'Informe o e-mail administrativo.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = 'Informe um e-mail valido.';
  }

  if (!input.password) {
    errors.password = 'Informe a senha.';
  } else if (input.password.length < 8) {
    errors.password = 'A senha deve ter pelo menos 8 caracteres.';
  }

  return errors;
}

function extractFieldErrorsFromApiError(error: unknown): FieldErrors {
  const nextFieldErrors: FieldErrors = {};

  if (!isAdminApiError(error) || !error.details?.length) {
    return nextFieldErrors;
  }

  for (const detail of error.details) {
    const normalizedField = detail.field?.trim().toLowerCase();

    if (
      normalizedField === 'email' ||
      normalizedField?.endsWith('.email')
    ) {
      nextFieldErrors.email = detail.issue;
    }

    if (
      normalizedField === 'password' ||
      normalizedField?.endsWith('.password')
    ) {
      nextFieldErrors.password = detail.issue;
    }
  }

  return nextFieldErrors;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState(() =>
    resolveAdminPostLoginHref(undefined),
  );
  const [forceMode, setForceMode] = useState(false);
  const [searchReady, setSearchReady] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>('Verificando sessao atual...');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(resolveAdminPostLoginHref(params.get('next')));
    const force = params.get('force');
    setForceMode(force === '1' || force === 'true');
    setSearchReady(true);
  }, []);

  useEffect(() => {
    if (!searchReady) {
      return;
    }

    let active = true;

    async function probeSession() {
      if (forceMode) {
        setNotice('Modo forçado ativo: entre com as credenciais para trocar de sessão.');
        return;
      }

      try {
        const session = await getCurrentAdminSession({
          autoCsrf: false,
        });

        if (!active) {
          return;
        }

        const user = session.data.user;

        if (user.role === 'admin' || user.role === 'editor') {
          router.replace(nextPath);
          router.refresh();
          return;
        }

        setNotice(null);
      } catch (error: unknown) {
        if (!active) {
          return;
        }

        if (
          isAdminApiError(error) &&
          (error.status === 401 || error.status === 403)
        ) {
          setNotice(null);
          return;
        }

        setNotice(
          'Nao foi possivel validar a sessao automaticamente. Voce ainda pode entrar manualmente com seguranca.',
        );
      }
    }

    void probeSession();

    return () => {
      active = false;
    };
  }, [forceMode, nextPath, router, searchReady]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationErrors = validateLoginInput({ email, password });

    setFieldErrors(validationErrors);
    setFormError(null);
    setNotice(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await loginAdmin({
        email: email.trim(),
        password,
      });

      router.replace(nextPath);
      router.refresh();
    } catch (error: unknown) {
      const nextFieldErrors = extractFieldErrorsFromApiError(error);

      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors);
      }

      if (isAdminApiError(error)) {
        if (error.status === 401) {
          setFormError('E-mail ou senha invalidos.');
          setPassword('');
        } else if (error.status === 403) {
          setFormError(
            'Nao foi possivel concluir a autenticacao com seguranca. Tente novamente.',
          );
        } else if (error.status === 422) {
          if (Object.keys(nextFieldErrors).length === 0) {
            setFormError(
              'Os dados informados sao invalidos. Revise os campos e tente novamente.',
            );
          }
        } else {
          setFormError(error.message);
        }

        return;
      }

      setFormError(
        'Ocorreu uma falha inesperada ao tentar autenticar. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminLoginShell
      notice={notice}
      formError={formError}
      nextPath={nextPath}
      backHref="/"
    >
          <form
            onSubmit={handleSubmit}
            noValidate
            style={{
              display: 'grid',
              gap: '1rem',
            }}
          >
            <label
              htmlFor="admin-email"
              style={{
                display: 'grid',
                gap: '0.45rem',
              }}
            >
              <span
                style={{
                  color: '#344054',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                }}
              >
                E-mail
              </span>

              <input
                id="admin-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="voce@empresa.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFieldErrors((current) => ({
                    ...current,
                    email: undefined,
                  }));
                  setFormError(null);
                }}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'admin-email-error' : undefined}
                disabled={isSubmitting}
                style={{
                  minHeight: 48,
                  width: '100%',
                  borderRadius: 14,
                  border: fieldErrors.email
                    ? '1px solid #f04438'
                    : '1px solid #d0d5dd',
                  paddingInline: '0.95rem',
                  background: '#ffffff',
                  color: '#101828',
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />

              {fieldErrors.email ? (
                <span
                  id="admin-email-error"
                  role="alert"
                  style={{
                    color: '#b42318',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                  }}
                >
                  {fieldErrors.email}
                </span>
              ) : null}
            </label>

            <label
              htmlFor="admin-password"
              style={{
                display: 'grid',
                gap: '0.45rem',
              }}
            >
              <span
                style={{
                  color: '#344054',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                }}
              >
                Senha
              </span>

              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setFieldErrors((current) => ({
                    ...current,
                    password: undefined,
                  }));
                  setFormError(null);
                }}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={
                  fieldErrors.password ? 'admin-password-error' : undefined
                }
                disabled={isSubmitting}
                style={{
                  minHeight: 48,
                  width: '100%',
                  borderRadius: 14,
                  border: fieldErrors.password
                    ? '1px solid #f04438'
                    : '1px solid #d0d5dd',
                  paddingInline: '0.95rem',
                  background: '#ffffff',
                  color: '#101828',
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />

              {fieldErrors.password ? (
                <span
                  id="admin-password-error"
                  role="alert"
                  style={{
                    color: '#b42318',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                  }}
                >
                  {fieldErrors.password}
                </span>
              ) : null}
            </label>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.85rem',
                paddingTop: '0.25rem',
              }}
            >
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  minHeight: 48,
                  paddingInline: '1.2rem',
                  borderRadius: 14,
                  border: '1px solid #175cd3',
                  background: isSubmitting ? '#98a2b3' : '#175cd3',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'progress' : 'pointer',
                }}
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
    </AdminLoginShell>
  );
}
