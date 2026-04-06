import { AlertBanner } from '@william-albarello/ui';

export type AdminLoginFeedbackProps = {
  notice?: string | null;
  formError?: string | null;
};

export function AdminLoginFeedback({
  notice,
  formError,
}: AdminLoginFeedbackProps) {
  if (!notice && !formError) {
    return null;
  }

  return (
    <>
      {notice ? (
        <AlertBanner tone="info" title="Validacao de sessao" compact>
          {notice}
        </AlertBanner>
      ) : null}

      {formError ? (
        <AlertBanner tone="warning" title="Falha de autenticacao" compact>
          {formError}
        </AlertBanner>
      ) : null}
    </>
  );
}
