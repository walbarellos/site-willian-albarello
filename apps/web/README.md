# @william-albarello/web

Frontend público do monorepo `personal-site`.

## Responsabilidade

Camada pública de leitura e descoberta de conteúdo editorial.

Escopo atual:

- home pública (`/`)
- listagem pública (`/publicacoes`)
- detalhe público por slug (`/publicacoes/[slug]`)

## Stack e runtime

- Next.js (App Router)
- React
- TypeScript
- `@william-albarello/contracts`
- `@william-albarello/ui`

## Scripts

No app:

```bash
pnpm --filter @william-albarello/web dev
pnpm --filter @william-albarello/web build
pnpm --filter @william-albarello/web start
pnpm --filter @william-albarello/web typecheck
pnpm --filter @william-albarello/web clean
```

No root:

```bash
pnpm dev:web
pnpm build:web
pnpm typecheck:web
```

## Configuração de ambiente

Fonte de contrato: `.env.example` (raiz).

Variáveis usadas pela camada pública:

- `NEXT_PUBLIC_SITE_URL` (metadataBase/canonical)
- `NEXT_PUBLIC_API_URL` (prioridade 1 para API)
- `PUBLIC_API_URL` (prioridade 2)
- `API_URL` (prioridade 3)

Resolução da base da API pública está em:

- `apps/web/src/lib/api/public.ts` (`resolvePublicApiBaseUrl`)

Fallback local atual: `http://localhost:3002`.

## Rotas e helpers públicos

Arquivo soberano: `apps/web/src/lib/routes.ts`.

Rotas:

- `WEB_PUBLIC_ROUTES.home` → `/`
- `WEB_PUBLIC_ROUTES.publications` → `/publicacoes`
- `WEB_PUBLIC_ROUTES.publicationDetail(slug)` → `/publicacoes/:slug`

Helpers:

- `buildPublicationsHref(query)`
- `buildPublicationDetailHref(slug)`

Comportamento relevante:

- sanitização de slug (`trim` + erro para slug vazio)
- normalização de paginação (`page`, `pageSize`)
- limite de `pageSize` em 50 nos helpers de query

## Client público de API

Arquivo: `apps/web/src/lib/api/public.ts`.

Métodos expostos:

- `listPublications(query)`
- `getPublicationBySlug(slug)`

Controles implementados:

- validação de payload de sucesso (lista e detalhe)
- validação de payload de erro (`ApiErrorResponse`)
- erro tipado (`PublicApiError`) com `status`, `code`, `traceId`, `details`
- proteção para resposta não JSON (`INVALID_CONTENT_TYPE`)
- proteção para JSON inválido (`INVALID_JSON`)
- proteção para falha de rede (`NETWORK_ERROR`)

## Páginas implementadas

### `apps/web/app/page.tsx`

- `metadata` estático com canonical `/`
- resolve `metadataBase` por `NEXT_PUBLIC_SITE_URL`
- carrega publicações em destaque via `listPublications({ page: 1, pageSize: 3 })`

### `apps/web/app/publicacoes/page.tsx`

- `generateMetadata` com canonical `/publicacoes`
- busca por `q` e paginação por query string
- normalização de query para evitar estado inválido de página

### `apps/web/app/publicacoes/[slug]/page.tsx`

- `generateMetadata` dinâmico por publicação
- usa SEO editorial quando disponível (`metaTitle`, `metaDescription`, `canonicalUrl`, OG)
- fallback para `notFound` em erro 404/422 da API
- canonical derivado da rota quando `canonicalUrl` não é informado

## Dependência contratual obrigatória

Mudanças no web público devem permanecer coerentes com:

- `apps/api/src/routes/publications-public.ts`
- `APIs/API-06-openapi-public.yaml`
- `packages/contracts/src/publications.ts`
- `packages/contracts/src/routes.ts`

## Validação operacional mínima (manual)

Com API em execução (`http://localhost:3002`):

1. abrir `/` e verificar render da home sem erro fatal
2. abrir `/publicacoes` e validar busca (`q`) e navegação de página
3. abrir `/publicacoes/<slug-existente>` e validar conteúdo + metadata
4. abrir `/publicacoes/<slug-invalido>` e validar `notFound`

## Verificação técnica do ciclo

```bash
pnpm build:web
pnpm typecheck:web
pnpm run verify:hardening
```
