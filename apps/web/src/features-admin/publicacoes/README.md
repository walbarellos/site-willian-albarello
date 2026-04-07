# Feature `publicacoes`

Este diretorio centraliza a feature editorial do painel administrativo do projeto `personal-site`.

## Finalidade

Reduzir acoplamento das rotas administrativas:

- `app/painel/publicacoes/page.tsx`
- `app/painel/publicacoes/[id]/editar/page.tsx`

sem perder comportamento nem contrato de API.

## Contrato da Feature Layer

As paginas do App Router permanecem como orchestrators de rota.
A feature concentra:

- tipos e contratos de apresentacao
- mapeamentos de status/labels e formatos de data
- componentes de listagem e seus estados
- componentes de edicao (conteudo, SEO, transicao)
- shells de composicao para reduzir paginas gigantes

As paginas continuam responsaveis por:

- leitura de sessao e autorizacao
- parse de `params` e `searchParams`
- chamadas HTTP e tratamento de erro de infraestrutura
- `revalidatePath` e redirects de server actions

## Estrutura Atual

### `shared/`
Responsavel por utilitarios e contratos reaproveitados entre listagem e edicao.

Arquivos:

- `shared/types.ts`
- `shared/status.ts`
- `shared/format.ts`
- `shared/index.ts`

### `list/`
Responsavel pela camada visual e estados da listagem administrativa.

Arquivos:

- `list/types.ts`
- `list/publications-filters.tsx`
- `list/publications-table.tsx`
- `list/publications-list-state.tsx`
- `list/publications-list-shell.tsx`
- `list/index.ts`

### `edit/`
Responsavel pela camada visual e composicao da edicao administrativa.

Arquivos:

- `edit/types.ts`
- `edit/publication-editor-form.tsx`
- `edit/publication-seo-panel.tsx`
- `edit/publication-status-panel.tsx`
- `edit/publication-edit-shell.tsx`
- `edit/index.ts`

### Barrel da feature

- `index.ts` reexporta `shared`, `list` e `edit`.

## Estado do Ciclo (Metodo Caracol)

Estado atual desta feature no ciclo:

1. feature layer criada e ativa
2. paginas administrativas ja consumindo os modulos principais
3. gargalos de import/paths entre pagina e feature resolvidos
4. typecheck do admin estabilizado para os itens desta etapa

## Regra de Evolucao

Toda nova extracao deve respeitar:

1. manter contratos atuais da rota
2. evitar quebra de server actions
3. mover complexidade de UI para `features/publicacoes/*`
4. manter paginas como orchestrators e nao como blobs de interface

## Resultado Esperado

Com a feature layer consolidada, backend, frontend e documentacao conseguem evoluir como lego:

- contratos em `packages/contracts`
- orquestracao em `app/*`
- composicao visual/funcional em `features/publicacoes/*`

Esse alinhamento reduz retrabalho e facilita manutencao incremental do ciclo.
