'use client';

import * as React from 'react';

import type { PublicationEditorFormProps } from './types';

export function PublicationEditorForm({
    values,
    submitting,
    error,
    onSubmit,
}: PublicationEditorFormProps) {
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
        <h2 className="text-base font-semibold">Conteúdo principal</h2>
        <p className="text-sm text-neutral-600">
        Edite os campos editoriais centrais da publicação.
        </p>
        </div>

        {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error.message}
            </div>
        ) : null}

        <div className="grid gap-1">
        <label htmlFor="publication-title" className="text-sm font-medium">
        Título
        </label>
        <input
        id="publication-title"
        value={formValues.title}
        onChange={(event) => updateField('title', event.target.value)}
        className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        />
        </div>

        <div className="grid gap-1">
        <label htmlFor="publication-slug" className="text-sm font-medium">
        Slug
        </label>
        <input
        id="publication-slug"
        value={formValues.slug}
        onChange={(event) => updateField('slug', event.target.value)}
        className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        />
        </div>

        <div className="grid gap-1">
        <label htmlFor="publication-summary" className="text-sm font-medium">
        Resumo
        </label>
        <textarea
        id="publication-summary"
        value={formValues.summary}
        onChange={(event) => updateField('summary', event.target.value)}
        rows={4}
        className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        />
        </div>

        <div className="grid gap-1">
        <label htmlFor="publication-content" className="text-sm font-medium">
        Conteúdo
        </label>
        <textarea
        id="publication-content"
        value={formValues.content}
        onChange={(event) => updateField('content', event.target.value)}
        rows={14}
        className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        />
        </div>

        <div className="flex justify-end">
        <button
        type="submit"
        disabled={submitting}
        className="rounded-xl border border-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
        {submitting ? 'Salvando…' : 'Salvar alterações'}
        </button>
        </div>
        </form>
    );
}
