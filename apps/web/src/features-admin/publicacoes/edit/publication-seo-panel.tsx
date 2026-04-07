'use client';

import * as React from 'react';

import type { PublicationSeoPanelProps } from './types';

const labelStyle: React.CSSProperties = {
  color: '#344054',
  fontSize: '0.9rem',
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  minHeight: 42,
  width: '100%',
  borderRadius: 12,
  border: '1px solid #d0d5dd',
  background: '#ffffff',
  color: '#101828',
  paddingInline: '0.8rem',
  paddingBlock: '0.55rem',
  fontSize: '0.92rem',
  lineHeight: 1.45,
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: 120,
};

export function PublicationSeoPanel({
  values,
  formId = 'publication-seo-form',
  showSubmitButton = true,
  submitting,
  error,
  onSubmit,
}: PublicationSeoPanelProps) {
  const [formValues, setFormValues] = React.useState(values);
  const [open, setOpen] = React.useState(
    Boolean(
      values.metaTitle ||
        values.metaDescription ||
        values.canonicalUrl ||
        values.ogTitle ||
        values.ogDescription ||
        values.ogImageUrl,
    ),
  );

  React.useEffect(() => {
    setFormValues(values);
  }, [values]);

  function updateField<K extends keyof typeof formValues>(
    field: K,
    value: (typeof formValues)[K],
  ) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(formValues);
      }}
      style={{
        display: 'grid',
        gap: '1rem',
        borderRadius: 16,
        border: '1px solid #d0d5dd',
        background: '#ffffff',
        padding: '1rem',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '0.35rem',
        }}
      >
        <h2
          style={{
            margin: 0,
            color: '#101828',
            fontSize: '1.2rem',
            lineHeight: 1.2,
          }}
        >
          SEO
        </h2>
        <p
          style={{
            margin: 0,
            color: '#667085',
            lineHeight: 1.65,
          }}
        >
          Ajuste os campos de descoberta e apresentação pública.
        </p>
      </div>

      {error ? (
        <div
          style={{
            borderRadius: 12,
            border: '1px solid #fda29b',
            background: '#fef3f2',
            color: '#b42318',
            padding: '0.75rem',
            fontSize: '0.9rem',
            lineHeight: 1.5,
          }}
        >
          {error.message}
        </div>
      ) : null}

      <details
        open={open}
        onToggle={(event) => setOpen((event.currentTarget as HTMLDetailsElement).open)}
        style={{
          border: '1px solid #e4e7ec',
          borderRadius: 12,
          background: '#f8fafc',
          padding: '0.8rem',
        }}
      >
        <summary
          style={{
            cursor: 'pointer',
            color: '#344054',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          Campos avançados de SEO
        </summary>

        <div
          style={{
            display: 'grid',
            gap: '1rem',
            marginTop: '0.8rem',
          }}
        >
          <label htmlFor="seo-meta-title" style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={labelStyle}>Meta title</span>
            <input
              id="seo-meta-title"
              value={formValues.metaTitle}
              onChange={(event) => updateField('metaTitle', event.target.value)}
              style={inputStyle}
            />
          </label>

          <label htmlFor="seo-meta-description" style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={labelStyle}>Meta description</span>
            <textarea
              id="seo-meta-description"
              value={formValues.metaDescription}
              onChange={(event) => updateField('metaDescription', event.target.value)}
              rows={4}
              style={textareaStyle}
            />
          </label>

          <label htmlFor="seo-canonical-url" style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={labelStyle}>Canonical URL</span>
            <input
              id="seo-canonical-url"
              value={formValues.canonicalUrl}
              onChange={(event) => updateField('canonicalUrl', event.target.value)}
              style={inputStyle}
            />
          </label>

          <label htmlFor="seo-og-title" style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={labelStyle}>OG title</span>
            <input
              id="seo-og-title"
              value={formValues.ogTitle}
              onChange={(event) => updateField('ogTitle', event.target.value)}
              style={inputStyle}
            />
          </label>

          <label htmlFor="seo-og-description" style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={labelStyle}>OG description</span>
            <textarea
              id="seo-og-description"
              value={formValues.ogDescription}
              onChange={(event) => updateField('ogDescription', event.target.value)}
              rows={4}
              style={textareaStyle}
            />
          </label>

          <label htmlFor="seo-og-image-url" style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={labelStyle}>OG image URL</span>
            <input
              id="seo-og-image-url"
              value={formValues.ogImageUrl}
              onChange={(event) => updateField('ogImageUrl', event.target.value)}
              style={inputStyle}
            />
          </label>
        </div>
      </details>

      {showSubmitButton ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="submit"
            disabled={submitting}
            style={{
              minHeight: 40,
              borderRadius: 12,
              border: '1px solid #175cd3',
              background: '#175cd3',
              color: '#ffffff',
              paddingInline: '0.95rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Salvando SEO...' : 'Salvar SEO'}
          </button>
        </div>
      ) : null}
    </form>
  );
}
