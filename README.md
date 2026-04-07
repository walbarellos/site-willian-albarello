# personal-site

<img width="1210" height="909" alt="image" src="https://github.com/user-attachments/assets/ad999313-8332-41d8-9561-7844200ab55a" />
<img width="1210" height="833" alt="image" src="https://github.com/user-attachments/assets/cb0ab06e-7b4b-4bfb-b6d8-dc70347afcc3" />


Monorepo do projeto `personal-site` com três aplicações e dois pacotes compartilhados.

## Mapa do repositório

- `apps/api` — API Fastify (health/ready, auth admin, dashboard, publicações públicas e admin)
- `apps/web` — frontend público Next.js
- `apps/admin` — painel administrativo Next.js
- `packages/contracts` — contratos e tipos compartilhados
- `packages/ui` — componentes compartilhados de UI
- `APIs` — OpenAPI público/admin + componentes comuns
- `Waterfall`, `UI_UX`, `Scaffold`, `Implementacao`, `Diagrama` — documentação técnica por ciclo

## Workspace

`pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## Pré-requisitos

- Node `>= 20.11.0`
- PNPM `10.x`

## Instalação

```bash
pnpm install
```

## Variáveis de ambiente

1. Copiar `.env.example` para `.env`.
2. Ajustar valores mínimos para ambiente local.

```bash
cp .env.example .env
```

Campos críticos para a API:

- `PORT`
- `NODE_ENV`
- `SESSION_SECRET`
- `DATABASE_URL`
- `PUBLIC_SITE_URL`
- `ADMIN_SITE_URL`
- `CORS_ORIGINS`

Campos usados por web/admin para resolver API:

- `NEXT_PUBLIC_API_URL`
- `PUBLIC_API_URL`
- `ADMIN_API_URL`
- `API_URL`

## Execução local

Executar todos os apps em paralelo:

```bash
pnpm dev
```

Executar por app:

```bash
pnpm dev:api
pnpm dev:web
pnpm dev:admin
```

Portas padrão:

- API: `3002`
- Web: `3000`
- Admin: `3001`

## Scripts principais (raiz)

```bash
pnpm clean
pnpm build
pnpm typecheck
```

Build por escopo:

```bash
pnpm build:shared
pnpm build:api
pnpm build:web
pnpm build:admin
```

Typecheck por escopo:

```bash
pnpm typecheck:shared
pnpm typecheck:api
pnpm typecheck:web
pnpm typecheck:admin
pnpm typecheck:apps
```

Validação integrada de hardening:

```bash
pnpm verify:hardening
```

## Sequência oficial de validação


Resumo da ordem:

1. `pnpm run clean`
2. build/typecheck de `packages/contracts`
3. build/typecheck de `packages/ui`
4. build/typecheck de `apps/api`
5. build/typecheck de `apps/web`
6. build/typecheck de `apps/admin`
7. `pnpm run verify:hardening`

## CI

Workflow: `.github/workflows/scaffold-bootstrap.yml`

Executa:

1. checkout
2. setup pnpm/node
3. `pnpm install --frozen-lockfile`
4. `pnpm run verify:hardening`

## Contratos de API

OpenAPI principais:

- `APIs/API-06-openapi-public.yaml`
- `APIs/API-07-openapi-admin.yaml`

Componentes comuns:

- `APIs/openapi/components/schemas.common.yaml`
- `APIs/openapi/components/responses.common.yaml`

## Contratos de código compartilhados

- `packages/contracts/src/routes.ts`
- `packages/contracts/src/session.ts`
- `packages/contracts/src/publications.ts`
- `packages/contracts/src/index.ts`

## Entradas úteis por domínio

## Governança Caracol com OpenClaw

OpenClaw no projeto:

- Runtime: `openclaw gateway start`
- Saúde: `openclaw health`
- Checkpoint de memória local: `~/.openclaw/workspace/memory/personal-site/`

Regra de auditoria:
