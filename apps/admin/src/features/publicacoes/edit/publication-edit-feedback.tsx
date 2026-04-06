import { AlertBanner } from '@william-albarello/ui';

export type PublicationEditFeedbackCode =
  | 'saved'
  | 'status-updated'
  | 'validation'
  | 'save-failed'
  | 'transition-failed'
  | 'session-failed';

export type PublicationEditFeedbackProps = {
  code?: string;
};

function mapFeedback(code?: string): {
  tone: 'success' | 'error';
  message: string;
} | null {
  switch (code) {
    case 'saved':
      return {
        tone: 'success',
        message: 'As alteracoes da publicacao foram salvas com sucesso.',
      };
    case 'status-updated':
      return {
        tone: 'success',
        message: 'O status editorial foi atualizado com sucesso.',
      };
    case 'validation':
      return {
        tone: 'error',
        message:
          'Nao foi possivel salvar porque alguns campos nao passaram na validacao da API.',
      };
    case 'save-failed':
      return {
        tone: 'error',
        message:
          'Ocorreu uma falha ao salvar a publicacao. Revise os dados e tente novamente.',
      };
    case 'transition-failed':
      return {
        tone: 'error',
        message:
          'A transicao editorial solicitada nao pode ser concluida neste momento.',
      };
    case 'session-failed':
      return {
        tone: 'error',
        message:
          'A sessao administrativa nao pode ser validada. Entre novamente para continuar.',
      };
    default:
      return null;
  }
}

export function PublicationEditFeedback({ code }: PublicationEditFeedbackProps) {
  const feedback = mapFeedback(code);

  if (!feedback) {
    return null;
  }

  const isSuccess = feedback.tone === 'success';

  return (
    <AlertBanner
      tone={isSuccess ? 'success' : 'warning'}
      title={isSuccess ? 'Operacao concluida' : 'Atencao na operacao'}
      compact
    >
      {feedback.message}
    </AlertBanner>
  );
}
