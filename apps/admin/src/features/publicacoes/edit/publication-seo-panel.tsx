'use client';

import * as React from 'react';

import type { PublicationSeoPanelProps } from './types';

export function PublicationSeoPanel({
    values,
    submitting,
    error,
    onSubmit,
}: PublicationSeoPanelProps) {
    const [formValues, setFormValues] = React.useState(values);

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
        className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5"
        onSubmit={(event) => {
            event.preventDefault();
            onSubmit?.(formValues);
        }}
        >
        <div>
        <h2 className="text-base font-semibold">SEO</h2>
        <p className="text-sm text-neutral-600">
        Ajuste os campos de descoberta e apresentação pública.
        </p>
        </div>

        {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error.message}
            </div>
        ) : null}

        <div className="grid gap-1">
        <label htmlFor="seo-meta-title" className="text-sm font-medium">
        Meta title
        </label>
        <input
        id="seo-meta-title"
        value={formValues.metaTitle}
        onChange={(event) => updateField('metaTitle', event.target.value)}
        className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        />
        </div>

        <div className="grid gap-1">
        <label htmlFor="seo-meta-description" className="text-sm font-medium">
        Meta description
        </label>
        <textarea
        id="seo-meta-description"
        value={formValues.metaDescription}
        onChange={(event) =>
            updateField('metaDescription', event.target.value)
        }
        rows={4}
        className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        />
        </div>

        <div className="grid gap-1">
        <label htmlFor="seo-canonical-url" className="text-sm font-medium">
        Canonical URL
        </label>
        <input
        id="seo-canonical-url"
        value={formValues.canonicalUrl}
        onChange={(event) => updateField('canonicalUrl', event.target.value)}
        className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        />
        </div>

        <div className="grid gap-1">
        <label htmlFor="seo-og-title" className="text-sm font-medium">
        OG title
        </label>
        <input
        id="seo-og-title"
        value={formValues.ogTitle}
        onChange={(event) => updateField('ogTitle', event.target.value)}
        className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        />
        </div>

        <div className="grid gap-1">
        <label htmlFor="seo-og-description" className="text-sm font-medium">
        OG description
        </label>
        <textarea
        id="seo-og-description"
        value={formValues.ogDescription}
        onChange={(event) =>
            updateField('ogDescription', event.target.value)
        }
        rows={4}
        className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        />
        </div>

        <div className="grid gap-1">
        <label htmlFor="seo-og-image-url" className="text-sm font-medium">
        OG image URL
        </label>
        <input
        id="seo-og-image-url"
        value={formValues.ogImageUrl}
        onChange={(event) => updateField('ogImageUrl', event.target.value)}
        className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        />
        </div>

        <div className="flex justify-end">
        <button
        type="submit"
        disabled={submitting}
        className="rounded-xl border border-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
        {submitting ? 'Salvando SEO…' : 'Salvar SEO'}
        </button>
        </div>
        </form>
    );
}
