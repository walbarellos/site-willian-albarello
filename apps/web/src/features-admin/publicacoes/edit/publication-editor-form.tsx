'use client';

import * as React from 'react';
import { uploadAdminMedia } from '../../../lib/admin/api';

import type { PublicationEditorFormProps } from './types';

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

export function PublicationEditorForm({
  values,
  formId = 'publication-main-form',
  showSubmitButton = true,
  submitting,
  error,
  onSubmit,
}: PublicationEditorFormProps) {
  const [formValues, setFormValues] = React.useState(values);
  const [isDraggingMedia, setIsDraggingMedia] = React.useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = React.useState(false);
  const [uploadMessage, setUploadMessage] = React.useState<string | null>(null);
  const [mediaWidthPercent, setMediaWidthPercent] = React.useState(65);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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

  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result ?? '');
        const base64 = result.includes(',') ? result.split(',')[1] : '';
        if (!base64) {
          reject(new Error('Falha ao converter arquivo.'));
          return;
        }
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
      reader.readAsDataURL(file);
    });
  }

  function toContentSnippet(
    fileName: string,
    mimeType: string,
    url: string,
    widthPercent: number,
  ): string {
    const safeWidth = Math.max(15, Math.min(100, Math.round(widthPercent)));

    if (mimeType.startsWith('image/')) {
      return `\n![${fileName}](${url}){w=${safeWidth}}\n`;
    }

    if (mimeType === 'video/mp4') {
      return `\n<video controls preload="metadata" src="${url}"></video>{w=${safeWidth}}\n`;
    }

    return `\n[${fileName}](${url})\n`;
  }

  async function handleFilesUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const files = Array.from(fileList);
    setUploadMessage(null);
    setIsUploadingMedia(true);

    let successCount = 0;

    try {
      for (const file of files) {
        const base64Data = await fileToBase64(file);
        const response = await uploadAdminMedia(
          {
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            base64Data,
          },
          {
            autoCsrf: true,
          },
        );

        const snippet = toContentSnippet(
          file.name,
          file.type,
          response.data.url,
          mediaWidthPercent,
        );
        setFormValues((current) => ({
          ...current,
          content: `${current.content || ''}${snippet}`.trim(),
        }));

        successCount += 1;
      }

      setUploadMessage(`${successCount} mídia(s) enviada(s) e inserida(s) no conteúdo.`);
    } catch (error) {
      setUploadMessage(
        error instanceof Error
          ? `Falha no upload: ${error.message}`
          : 'Falha no upload de mídia.',
      );
    } finally {
      setIsUploadingMedia(false);
    }
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
          Conteúdo principal
        </h2>
        <p
          style={{
            margin: 0,
            color: '#667085',
            lineHeight: 1.65,
          }}
        >
          Edite os campos editoriais centrais da publicação.
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

      <label htmlFor="publication-title" style={{ display: 'grid', gap: '0.45rem' }}>
        <span style={labelStyle}>Título</span>
        <input
          id="publication-title"
          value={formValues.title}
          onChange={(event) => updateField('title', event.target.value)}
          style={inputStyle}
        />
      </label>

      <label htmlFor="publication-slug" style={{ display: 'grid', gap: '0.45rem' }}>
        <span style={labelStyle}>Slug</span>
        <input
          id="publication-slug"
          value={formValues.slug}
          onChange={(event) => updateField('slug', event.target.value)}
          style={inputStyle}
        />
      </label>

      <label htmlFor="publication-summary" style={{ display: 'grid', gap: '0.45rem' }}>
        <span style={labelStyle}>Resumo</span>
        <textarea
          id="publication-summary"
          value={formValues.summary}
          onChange={(event) => updateField('summary', event.target.value)}
          rows={4}
          style={textareaStyle}
        />
      </label>

      <label htmlFor="publication-content" style={{ display: 'grid', gap: '0.45rem' }}>
        <span style={labelStyle}>Conteúdo</span>
        <textarea
          id="publication-content"
          value={formValues.content}
          onChange={(event) => updateField('content', event.target.value)}
          rows={14}
          style={{ ...textareaStyle, minHeight: 260 }}
        />
      </label>

      <section
        style={{
          display: 'grid',
          gap: '0.7rem',
          borderRadius: 12,
          border: `1px dashed ${isDraggingMedia ? '#175cd3' : '#d0d5dd'}`,
          background: isDraggingMedia ? '#eef4ff' : '#f8fafc',
          padding: '0.9rem',
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDraggingMedia(true);
        }}
        onDragLeave={() => setIsDraggingMedia(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDraggingMedia(false);
          void handleFilesUpload(event.dataTransfer.files);
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '0.35rem',
          }}
        >
          <strong
            style={{
              color: '#101828',
              fontSize: '0.92rem',
            }}
          >
            Mídia do post (drag and drop)
          </strong>
          <span
            style={{
              color: '#667085',
              fontSize: '0.85rem',
              lineHeight: 1.55,
            }}
          >
            Solte aqui arquivos `.png`, `.gif`, `.jpg`, `.webp` e `.mp4` ou selecione no botão.
          </span>
        </div>

        <label
          htmlFor="media-width-percent"
          style={{
            display: 'grid',
            gap: '0.35rem',
          }}
        >
          <span
            style={{
              color: '#344054',
              fontSize: '0.84rem',
              fontWeight: 700,
            }}
          >
            Largura inicial da mídia: {mediaWidthPercent}%
          </span>

          <input
            id="media-width-percent"
            type="range"
            min={15}
            max={100}
            step={5}
            value={mediaWidthPercent}
            onChange={(event) => setMediaWidthPercent(Number(event.target.value))}
          />
        </label>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.55rem',
          }}
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingMedia}
            style={{
              minHeight: 36,
              borderRadius: 10,
              border: '1px solid #d0d5dd',
              background: '#ffffff',
              color: '#344054',
              fontWeight: 700,
              fontSize: '0.82rem',
              paddingInline: '0.7rem',
              cursor: isUploadingMedia ? 'not-allowed' : 'pointer',
              opacity: isUploadingMedia ? 0.7 : 1,
            }}
          >
            {isUploadingMedia ? 'Enviando...' : 'Selecionar mídia'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.gif,.webp,.mp4,image/png,image/jpeg,image/gif,image/webp,video/mp4"
          style={{ display: 'none' }}
          onChange={(event) => {
            void handleFilesUpload(event.target.files);
            event.currentTarget.value = '';
          }}
        />

        {uploadMessage ? (
          <div
          style={{
            borderRadius: 10,
            border: '1px solid #d0d5dd',
            background: '#ffffff',
            color: '#475467',
            fontSize: '0.83rem',
            lineHeight: 1.5,
            padding: '0.55rem 0.65rem',
          }}
        >
          {uploadMessage}
        </div>
      ) : null}

      <div
        style={{
          borderRadius: 10,
          border: '1px solid #e4e7ec',
          background: '#ffffff',
          color: '#667085',
          fontSize: '0.8rem',
          lineHeight: 1.55,
          padding: '0.55rem 0.65rem',
        }}
      >
        Dica: você pode ajustar manualmente depois no conteúdo, por exemplo:
        {' '}
        <code>![imagem](url){'{w=40}'}</code>
        {' '}
        ou
        {' '}
        <code>{'<video ...></video>{w=80}'}</code>.
      </div>
      </section>

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
            {submitting ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      ) : null}
    </form>
  );
}
