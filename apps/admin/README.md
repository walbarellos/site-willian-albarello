# @william-albarello/admin

Painel administrativo do monorepo `personal-site`.

## Responsabilidade

Camada interna de operação editorial com autenticação e sessão administrativa.

Escopo atual:

- entrada admin (`/`)
- login (`/painel/login`)
- listagem de publicações (`/painel/publicacoes`)
- edição/transição (`/painel/publicacoes/[id]/editar`)

## Stack e runtime

- Next.js (App Router)
- React
- TypeScript
- `@william-albarello/contracts`
- `@william-albarello/ui`

## Scripts

No app:

```bash
pnpm --filter @william-albarello/admin dev
pnpm --filter @william-albarello/admin build
pnpm --filter @william-albarello/admin start
pnpm --filter @william-albarello/admin typecheck
pnpm --filter @william-albarello/admin clean
```

No root:

```bash
pnpm dev:admin
pnpm build:admin
pnpm typecheck:admin
```

Build atual do admin: `next build --webpack`.

## Configuração de ambiente

Fonte de contrato: `.env.example` (raiz).

Variáveis usadas no client admin (`apps/admin/src/lib/api/admin.ts`):

- `NEXT_PUBLIC_API_URL`
- `ADMIN_API_URL`
- `API_URL`

Ordem de resolução da base URL:

1. `NEXT_PUBLIC_API_URL`
2. `ADMIN_API_URL`
3. `API_URL`
4. fallback local `http://localhost:3002`

## Rotas e helpers do admin

Arquivo soberano: `apps/admin/src/lib/routes.ts`.

Rotas principais:

- `ADMIN_ROUTES.entry` → `/`
- `ADMIN_ROUTES.login` → `/painel/login`
- `ADMIN_ROUTES.publications` → `/painel/publicacoes`
- `ADMIN_ROUTES.publicationEdit(id)` → `/painel/publicacoes/:id/editar`

Comportamento relevante:

- sanitização de `next` para impedir redirect inseguro
- whitelist de paths permitidos no pós-login
- helper de redirect protegido padrão para `/painel/publicacoes`

## Camada de sessão server-side

Arquivo: `apps/admin/src/lib/session.ts`.

Responsabilidades:

- leitura de sessão atual (`readAdminSession*`)
- exigência de sessão/papel (`requireAdminSession*`)
- leitura de usuário atual (`readCurrentAdminUserServer`)
- redirect para login quando não autenticado

Detalhes técnicos:

- encaminha cookie e `x-trace-id` para API
- usa cache server-side para leitura de sessão
- trata 401/403 como ausência de sessão

## Client HTTP administrativo

Arquivo: `apps/admin/src/lib/api/admin.ts`.

Superfícies consumidas:

- auth: `loginAdmin`, `getCurrentAdminSession`, `logoutAdmin`
- dashboard: `getAdminDashboard`
- publicações: `listAdminPublications`, `getAdminPublicationById`, `createAdminPublicationDraft`, `updateAdminPublication`, `transitionAdminPublicationStatus`

Controles implementados:

- validação runtime de payload de sucesso
- parser de erro para `AdminApiError` (`status`, `code`, `traceId`, `details`)
- suporte a execução server/runtime com headers encaminhados
- suporte a CSRF para mutações (quando aplicável)

## Páginas implementadas

### `apps/admin/app/page.tsx`

- entrypoint administrativo
- tenta sessão server-side em modo tolerante
- redireciona para área protegida se autenticado
- redireciona para login se não autenticado

### `apps/admin/app/painel/login/page.tsx`

- validação local de email/senha
- probe de sessão prévia
- login com tratamento de erro 401/403/422
- redirect pós-login via `next` sanitizado

### `apps/admin/app/painel/publicacoes/page.tsx`

- listagem com busca, filtro de status e paginação
- tratamento de estados de erro e sessão

### `apps/admin/app/painel/publicacoes/[id]/editar/page.tsx`

- edição de conteúdo + SEO
- transição de estado editorial
- feedback de persistência e falha

## Dependência contratual obrigatória

Mudanças no admin devem permanecer coerentes com:

- `apps/api/src/routes/auth.ts`
- `apps/api/src/routes/dashboard.ts`
- `apps/api/src/routes/publications-admin.ts`
- `APIs/API-07-openapi-admin.yaml`
- `packages/contracts/src/session.ts`
- `packages/contracts/src/publications.ts`
- `packages/contracts/src/routes.ts`

## Validação operacional mínima (manual)

Com API rodando (`http://localhost:3002`):

1. abrir `/` e validar redirect para login quando não autenticado
2. executar login válido em `/painel/login`
3. validar redirect para `/painel/publicacoes`
4. abrir edição de publicação e salvar atualização
5. executar transição de status válida e confirmar feedback

## Verificação técnica do ciclo

```bash
pnpm build:admin
pnpm typecheck:admin
pnpm run verify:hardening
```
