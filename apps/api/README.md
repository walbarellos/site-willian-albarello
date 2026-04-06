# @william-albarello/api

Backend HTTP do monorepo `personal-site`.

## Responsabilidade

A API é a camada de contrato entre:

- `apps/web` (superfície pública)
- `apps/admin` (superfície administrativa)
- `packages/contracts` (tipagem compartilhada)
- OpenAPI (`APIs/API-06-openapi-public.yaml` e `APIs/API-07-openapi-admin.yaml`)

## Stack e runtime

- Node.js + TypeScript (ESM)
- Fastify
- `@fastify/cors`
- `@fastify/cookie`
- `@fastify/csrf-protection`
- `@fastify/rate-limit`
- Zod

Entrypoints:

- `apps/api/src/index.ts` (processo, sinais e lifecycle)
- `apps/api/src/server.ts` (plugins, hooks, handlers e rotas)

## Scripts

No app:

```bash
pnpm --filter @william-albarello/api dev
pnpm --filter @william-albarello/api build
pnpm --filter @william-albarello/api start
pnpm --filter @william-albarello/api typecheck
pnpm --filter @william-albarello/api clean
```

No root:

```bash
pnpm dev:api
pnpm build:api
pnpm typecheck:api
```

## Configuração de ambiente

Fonte de contrato: `.env.example` (raiz).

Loader e validação: `apps/api/src/lib/env.ts`.

Variáveis usadas diretamente pelo backend:

- `PORT`
- `NODE_ENV`
- `SESSION_SECRET`
- `DATABASE_URL`
- `PUBLIC_SITE_URL`
- `ADMIN_SITE_URL`
- `CORS_ORIGINS`

Comportamento do loader:

- validação com Zod
- fail-fast para configuração inválida
- defaults de conveniência em `development`
- restrições mais rígidas em produção (inclui `SESSION_SECRET` e `CORS_ORIGINS`)

## Rotas registradas (estado atual)

Arquivos de rota:

- `apps/api/src/routes/health.ts`
- `apps/api/src/routes/auth.ts`
- `apps/api/src/routes/dashboard.ts`
- `apps/api/src/routes/publications-public.ts`
- `apps/api/src/routes/publications-admin.ts`

Endpoints:

### Infra

- `GET /health`
- `GET /ready`

### Auth admin

- `POST /v1/admin/auth/login`
- `GET /v1/admin/auth/session`
- `POST /v1/admin/auth/logout`

### Dashboard admin

- `GET /v1/admin/dashboard`

### Publicações públicas

- `GET /v1/public/publications`
- `GET /v1/public/publications/:slug`

### Publicações admin

- `GET /v1/admin/publications`
- `GET /v1/admin/publications/:id`
- `POST /v1/admin/publications`
- `PATCH /v1/admin/publications/:id`
- `PATCH /v1/admin/publications/:id/status`

## Envelope HTTP (soberano)

Arquivo: `apps/api/src/lib/http-contract.ts`.

Padrões:

- sucesso simples: `{ data, meta: { traceId } }`
- sucesso paginado: `{ data: [], meta: { traceId, page, pageSize, totalItems, totalPages } }`
- erro: `{ error: { code, message, details? }, meta: { traceId } }`

Códigos de erro padronizados (subset mais usado):

- `UNAUTHENTICATED`
- `SESSION_EXPIRED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `CSRF_INVALID_TOKEN`
- `INVALID_STATE_TRANSITION`
- `RATE_LIMITED`
- `INTERNAL_SERVER_ERROR`

## Segurança e operação já materializadas

No `server.ts`:

- CORS com allowlist (`CORS_ORIGINS`)
- cookie assinado para sessão
- CSRF plugin para mutações
- rate limit global
- headers de segurança
- `x-trace-id` em request/response
- logging estruturado com redaction de dados sensíveis
- política `no-store` para `/health`, `/ready` e `/v1/admin/*`

## Validação operacional mínima (manual)

Com API rodando em `http://localhost:3002`:

```bash
curl -i http://localhost:3002/health
curl -i http://localhost:3002/ready
```

Verificar:

- status HTTP esperado
- header `x-trace-id`
- corpo JSON com `meta.traceId`

Fluxo admin mínimo:

1. `POST /v1/admin/auth/login`
2. `GET /v1/admin/auth/session`
3. `GET /v1/admin/publications`
4. `PATCH /v1/admin/publications/:id/status` (transição válida)

## Relação contratual obrigatória

Ao alterar rota, payload, status code ou erro:

1. atualizar implementação da rota
2. atualizar `packages/contracts` se necessário
3. atualizar OpenAPI correspondente (`API-06` ou `API-07`)
4. ajustar consumidores (`apps/web` / `apps/admin`)

## Verificação técnica do ciclo

```bash
pnpm build:api
pnpm typecheck:api
pnpm run verify:hardening
```
