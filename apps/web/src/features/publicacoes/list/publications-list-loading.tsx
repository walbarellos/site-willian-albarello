export function PublicationsListLoading() {
  return (
    <section
      aria-labelledby="publicacoes-loading-title"
      style={{ paddingBottom: '2rem' }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1120,
          margin: '0 auto',
          paddingInline: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '1rem',
          }}
        >
          <h2
            id="publicacoes-loading-title"
            style={{
              margin: 0,
              fontSize: '1.1rem',
              color: '#344054',
            }}
          >
            Carregando publicacoes
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                aria-hidden="true"
                style={{
                  minHeight: 240,
                  borderRadius: 20,
                  background:
                    'linear-gradient(90deg, #f2f4f7 0%, #e4e7ec 50%, #f2f4f7 100%)',
                  border: '1px solid #eaecf0',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
