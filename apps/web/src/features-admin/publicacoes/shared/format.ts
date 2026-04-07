// apps/admin/src/features/publicacoes/shared/format.ts

const EMPTY_VALUE_LABEL = '—';

const adminDateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function isValidDate(input: string): boolean {
  return !Number.isNaN(new Date(input).getTime());
}

export function formatAdminDate(value?: string | null): string {
  if (!value || !isValidDate(value)) {
    return EMPTY_VALUE_LABEL;
  }

  return adminDateTimeFormatter.format(new Date(value));
}

export function formatReadingTime(value?: number | null): string {
  if (!value || value <= 0) {
    return EMPTY_VALUE_LABEL;
  }

  const minutes = Math.floor(value);

  return `${minutes} min`;
}

export function formatOptionalText(
  value?: string | null,
  fallback: string = EMPTY_VALUE_LABEL,
): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : fallback;
}

export function formatSlugLabel(slug?: string | null): string {
  const normalized = formatOptionalText(slug, '');
  return normalized ? `/${normalized}` : EMPTY_VALUE_LABEL;
}

export function formatUpdatedAtLabel(value?: string | null): string {
  return `Atualizado em ${formatAdminDate(value)}`;
}
