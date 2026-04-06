import { describe, expect, it } from 'vitest';

import {
  ADMIN_APP_ROUTES,
  API_ADMIN_AUTH_ROUTES,
  API_ADMIN_ROUTES,
  API_PUBLIC_ROUTES,
  API_UTILITY_ROUTES,
  ROUTES,
  WEB_PUBLIC_ROUTES,
  buildAdminLoginHref,
  buildProtectedRedirectHref,
} from './routes';

describe('contracts/routes', () => {
  describe('static route maps', () => {
    it('exposes stable public and admin static routes', () => {
      expect(WEB_PUBLIC_ROUTES.home).toBe('/');
      expect(WEB_PUBLIC_ROUTES.publications).toBe('/publicacoes');

      expect(ADMIN_APP_ROUTES.entry).toBe('/');
      expect(ADMIN_APP_ROUTES.login).toBe('/painel/login');
      expect(ADMIN_APP_ROUTES.dashboard).toBe('/painel');
      expect(ADMIN_APP_ROUTES.publications).toBe('/painel/publicacoes');
      expect(ADMIN_APP_ROUTES.protectedDefaultRedirect).toBe('/painel/publicacoes');
    });

    it('exposes stable API route maps', () => {
      expect(API_UTILITY_ROUTES.health).toBe('/health');
      expect(API_UTILITY_ROUTES.ready).toBe('/ready');

      expect(API_PUBLIC_ROUTES.publications).toBe('/v1/public/publications');

      expect(API_ADMIN_AUTH_ROUTES.login).toBe('/v1/admin/auth/login');
      expect(API_ADMIN_AUTH_ROUTES.session).toBe('/v1/admin/auth/session');
      expect(API_ADMIN_AUTH_ROUTES.logout).toBe('/v1/admin/auth/logout');

      expect(API_ADMIN_ROUTES.dashboard).toBe('/v1/admin/dashboard');
      expect(API_ADMIN_ROUTES.publications).toBe('/v1/admin/publications');
    });

    it('keeps ROUTES aggregate aligned with individual maps', () => {
      expect(ROUTES.web).toBe(WEB_PUBLIC_ROUTES);
      expect(ROUTES.admin).toBe(ADMIN_APP_ROUTES);
      expect(ROUTES.api.utility).toBe(API_UTILITY_ROUTES);
      expect(ROUTES.api.public).toBe(API_PUBLIC_ROUTES);
      expect(ROUTES.api.admin.auth).toBe(API_ADMIN_AUTH_ROUTES);
      expect(ROUTES.api.admin.resources).toBe(API_ADMIN_ROUTES);
    });
  });

  describe('dynamic path builders', () => {
    it('builds encoded publication detail routes for web and api', () => {
      expect(WEB_PUBLIC_ROUTES.publicationDetail('meu-slug')).toBe('/publicacoes/meu-slug');
      expect(WEB_PUBLIC_ROUTES.publicationDetail(' meu slug ')).toBe('/publicacoes/meu%20slug');

      expect(API_PUBLIC_ROUTES.publicationDetail('slug-publico')).toBe(
        '/v1/public/publications/slug-publico',
      );
      expect(API_PUBLIC_ROUTES.publicationDetail(' slug publico ')).toBe(
        '/v1/public/publications/slug%20publico',
      );
    });

    it('builds encoded admin publication routes by id', () => {
      expect(ADMIN_APP_ROUTES.publicationEdit('42')).toBe('/painel/publicacoes/42/editar');
      expect(ADMIN_APP_ROUTES.publicationEdit(' id composto ')).toBe(
        '/painel/publicacoes/id%20composto/editar',
      );

      expect(API_ADMIN_ROUTES.publicationById('42')).toBe('/v1/admin/publications/42');
      expect(API_ADMIN_ROUTES.publicationById(' id composto ')).toBe(
        '/v1/admin/publications/id%20composto',
      );

      expect(API_ADMIN_ROUTES.publicationStatus('42')).toBe('/v1/admin/publications/42/status');
      expect(API_ADMIN_ROUTES.publicationStatus(' id composto ')).toBe(
        '/v1/admin/publications/id%20composto/status',
      );
    });
  });

  describe('query builders', () => {
    it('builds publications query for web, skipping empty values', () => {
      expect(
        WEB_PUBLIC_ROUTES.publicationsWithQuery({
          q: '  termo livre  ',
          page: 2,
          pageSize: 10,
          category: 'tecnologia',
          tag: 'javascript',
        }),
      ).toBe('/publicacoes?q=termo%20livre&page=2&pageSize=10&category=tecnologia&tag=javascript');

      expect(
        WEB_PUBLIC_ROUTES.publicationsWithQuery({
          q: '   ',
          category: undefined,
          tag: null as unknown as string,
        }),
      ).toBe('/publicacoes');
    });

    it('builds publications query for admin with status and pagination', () => {
      expect(
        ADMIN_APP_ROUTES.publicationsWithQuery({
          q: 'editorial',
          status: 'review',
          page: 3,
          pageSize: 25,
        }),
      ).toBe('/painel/publicacoes?q=editorial&status=review&page=3&pageSize=25');

      expect(
        ADMIN_APP_ROUTES.publicationsWithQuery({
          q: '   ',
          status: undefined,
        }),
      ).toBe('/painel/publicacoes');
    });
  });

  describe('admin login helpers', () => {
    it('builds login href without next when input is absent or invalid', () => {
      expect(ADMIN_APP_ROUTES.loginWithNext()).toBe('/painel/login');
      expect(ADMIN_APP_ROUTES.loginWithNext('')).toBe('/painel/login');
      expect(ADMIN_APP_ROUTES.loginWithNext('https://externo.com/painel')).toBe('/painel/login');
      expect(ADMIN_APP_ROUTES.loginWithNext('//malicioso')).toBe('/painel/login');
    });

    it('builds login href with sanitized relative next path', () => {
      expect(ADMIN_APP_ROUTES.loginWithNext('/painel/publicacoes')).toBe(
        '/painel/login?next=%2Fpainel%2Fpublicacoes',
      );
      expect(ADMIN_APP_ROUTES.loginWithNext(' /painel/publicacoes/42/editar ')).toBe(
        '/painel/login?next=%2Fpainel%2Fpublicacoes%2F42%2Feditar',
      );
    });

    it('keeps helper exports consistent with route map', () => {
      expect(buildAdminLoginHref('/painel/publicacoes')).toBe(
        '/painel/login?next=%2Fpainel%2Fpublicacoes',
      );
      expect(buildProtectedRedirectHref()).toBe('/painel/publicacoes');
    });
  });
});
