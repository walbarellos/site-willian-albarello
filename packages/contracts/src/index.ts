// packages/contracts/src/index.ts

export * from './session';
export * from './publications';
export * from './routes';

import type { ApiMeta } from './session';
import type {
  AdminPublication,
  AdminPublicationDetailResponse,
  AdminPublicationListQuery as CanonicalAdminPublicationListQuery,
  AdminPublicationListResponse,
  CategoryRef,
  EditorialStatus,
  PaginationMeta,
  PublicPublicationDetail,
  PublicPublicationDetailResponse,
  PublicPublicationListQuery as CanonicalPublicPublicationListQuery,
  PublicPublicationListResponse,
  PublicPublicationSummary,
  SeoFields,
  TagRef,
} from './publications';

/**
 * ---------------------------------------------------------------------------
 * Compat layer soberana
 * ---------------------------------------------------------------------------
 *
 * Este barrel file passa a reexportar os módulos especializados (`session`,
 * `publications`, `routes`) e, ao mesmo tempo, preserva os nomes que o monorepo
 * atual já consome. O objetivo é reduzir acoplamento sem quebrar o estado atual
 * de apps/api, apps/admin e apps/web.
 */

/**
 * Health / Ready
 *
 * Mantidos aqui por compatibilidade com o estado atual do monorepo.
 * Ainda não foram extraídos para um módulo próprio porque o código atual
 * depende principalmente do barrel e estes contratos são pequenos.
 */

export type HealthResponse = {
  data: {
    status: 'ok';
    service: string;
    env?: string;
    environment?: string;
    version?: string | null;
    timestamp: string;
  };
  meta: ApiMeta;
};

export type ReadyCheck =
| {
  name: string;
  status: string;
  latencyMs?: number;
}
| {
  db?: 'up' | 'down';
};

export type ReadyResponse = {
  data: {
    status: 'ok' | 'ready';
    service: string;
    env?: string;
    environment?: string;
    version?: string | null;
    timestamp?: string;
    ready?: boolean;
    checks?: ReadyCheck[] | { db?: 'up' | 'down' };
  };
  meta: ApiMeta;
};

/**
 * Dashboard
 *
 * Mantidos aqui por compatibilidade com o client admin atual.
 */

export type DashboardSummary = {
  drafts: number;
  published: number;
  archived: number;
  seoPending: number;
  review: number;
  readyToPublish: number;
};

export type SuccessDashboardResponse = {
  data: DashboardSummary;
  meta: ApiMeta;
};

/**
 * ---------------------------------------------------------------------------
 * Aliases de compatibilidade com o estado atual do monorepo
 * ---------------------------------------------------------------------------
 *
 * O código atual ainda usa nomes antigos no import do barrel.
 * Estes aliases permitem evoluir a organização interna sem quebrar imports.
 */

export type PublicPublicationListItem = PublicPublicationSummary;
export type PublicPublicationListQuery = CanonicalPublicPublicationListQuery;
export type SuccessPublicPublicationListResponse = PublicPublicationListResponse;
export type SuccessPublicPublicationDetailResponse =
PublicPublicationDetailResponse;

export type AdminPublicationListQuery = CanonicalAdminPublicationListQuery;
export type SuccessAdminPublicationListResponse = AdminPublicationListResponse;
export type SuccessAdminPublicationDetailResponse =
AdminPublicationDetailResponse;

/**
 * ---------------------------------------------------------------------------
 * Reexports nominais explícitos para clareza de leitura do barrel
 * ---------------------------------------------------------------------------
 *
 * Embora `export *` já publique estes contratos, a reexposição explícita abaixo
 * ajuda a tornar o barrel autodescritivo e estável para manutenção futura.
 */

export type {
  AdminPublication,
  CategoryRef,
  EditorialStatus,
  PaginationMeta,
  PublicPublicationDetail,
  PublicPublicationSummary,
  SeoFields,
  TagRef,
};
