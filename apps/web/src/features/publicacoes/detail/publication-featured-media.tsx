import type { CSSProperties } from 'react';

export type PublicationFeaturedMediaProps = {
  src: string;
  alt?: string;
  widthPercent?: number;
};

function normalizeWidthPercent(value?: number): number {
  if (!value || !Number.isFinite(value)) {
    return 46;
  }

  return Math.min(72, Math.max(22, Math.round(value)));
}

export function PublicationFeaturedMedia({
  src,
  alt,
  widthPercent,
}: PublicationFeaturedMediaProps) {
  const safeWidth = normalizeWidthPercent(widthPercent);

  return (
    <figure
      style={{
        margin: 0,
        display: 'grid',
        gap: '0.7rem',
        justifyItems: 'center',
        padding: '0.4rem 0 0.2rem',
      }}
    >
      <img
        src={src}
        alt={alt || 'Imagem da publicação'}
        loading="lazy"
        style={{
          width: `min(100%, min(${safeWidth}vw, 620px))`,
          maxWidth: '100%',
          height: 'auto',
          borderRadius: 14,
          border: '1px solid #cfd4dc',
          boxShadow: '0 12px 34px rgba(16, 24, 40, 0.14)',
          background: '#f5f7fb',
          objectFit: 'cover',
        }}
      />

      {alt ? <figcaption style={captionStyle}>{alt}</figcaption> : null}
    </figure>
  );
}

const captionStyle: CSSProperties = {
  margin: 0,
  color: '#667085',
  fontSize: '0.86rem',
  lineHeight: 1.5,
  textAlign: 'center',
  maxWidth: 760,
};
