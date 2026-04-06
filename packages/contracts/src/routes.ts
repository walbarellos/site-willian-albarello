// packages/contracts/src/routes.ts

export type EditorialStatusRouteFilter =
| 'draft'
| 'review'
| 'ready_to_publish'
| 'published'
| 'archived';

export type QueryPrimitive = string | number | boolean | null | undefined;
export type QueryValue = QueryPrimitive | QueryPrimitive[];
export type QueryRecord = Record<string, QueryValue>;

function encodePathSegment(value: string): string {
    return encodeURIComponent(value.trim());
}

function normalizeRelativePath(value?: string | null): string | undefined {
    if (!value) {
        return undefined;
    }

    const trimmed = value.trim();

    if (!trimmed.startsWith('/')) {
        return undefined;
    }

    if (trimmed.startsWith('//')) {
        return undefined;
    }

    return trimmed;
}

function buildQueryString(query?: QueryRecord): string {
    if (!query) {
        return '';
    }

    const pairs: string[] = [];

    for (const [key, rawValue] of Object.entries(query)) {
        if (rawValue === undefined || rawValue === null) {
            continue;
        }

        const values = Array.isArray(rawValue) ? rawValue : [rawValue];

        for (const value of values) {
            if (value === undefined || value === null) {
                continue;
            }

            const normalized = String(value).trim();

            if (!normalized) {
                continue;
            }

            pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(normalized)}`);
        }
    }

    const serialized = pairs.join('&');
    return serialized ? `?${serialized}` : '';
}

function withQuery<TPath extends string>(path: TPath, query?: QueryRecord): string {
    return `${path}${buildQueryString(query)}`;
}

export type PublicPublicationsRouteQuery = {
    q?: string;
    page?: number;
    pageSize?: number;
    category?: string;
    tag?: string;
};

export type AdminLoginRouteQuery = {
    next?: string;
};

export type AdminPublicationsRouteQuery = {
    q?: string;
    page?: number;
    pageSize?: number;
    status?: EditorialStatusRouteFilter;
};

export const WEB_PUBLIC_ROUTES = {
    home: '/',
    publications: '/publicacoes',
        publicationDetail: (slug: string) =>
            `/publicacoes/${encodePathSegment(slug)}` as const,
            publicationsWithQuery: (query?: PublicPublicationsRouteQuery) =>
                withQuery('/publicacoes', query),
} as const;

export const ADMIN_APP_ROUTES = {
    entry: '/',
    login: '/painel/login',
    loginWithNext: (next?: string | null) =>
    withQuery('/painel/login', {
        next: normalizeRelativePath(next),
    }),
    dashboard: '/painel',
    publications: '/painel/publicacoes',
        publicationsWithQuery: (query?: AdminPublicationsRouteQuery) =>
            withQuery('/painel/publicacoes', query),
            publicationEdit: (id: string) =>
                `/painel/publicacoes/${encodePathSegment(id)}/editar` as const,
                protectedDefaultRedirect: '/painel/publicacoes',
} as const;

export const API_UTILITY_ROUTES = {
    health: '/health',
    ready: '/ready',
} as const;

export const API_PUBLIC_ROUTES = {
    publications: '/v1/public/publications',
        publicationDetail: (slug: string) =>
            `/v1/public/publications/${encodePathSegment(slug)}` as const,
} as const;

export const API_ADMIN_AUTH_ROUTES = {
    login: '/v1/admin/auth/login',
    session: '/v1/admin/auth/session',
    logout: '/v1/admin/auth/logout',
} as const;

export const API_ADMIN_ROUTES = {
    dashboard: '/v1/admin/dashboard',
    publications: '/v1/admin/publications',
        publicationById: (id: string) =>
            `/v1/admin/publications/${encodePathSegment(id)}` as const,
            publicationStatus: (id: string) =>
                `/v1/admin/publications/${encodePathSegment(id)}/status` as const,
} as const;

export const ROUTES = {
    web: WEB_PUBLIC_ROUTES,
    admin: ADMIN_APP_ROUTES,
    api: {
        utility: API_UTILITY_ROUTES,
        public: API_PUBLIC_ROUTES,
            admin: {
                auth: API_ADMIN_AUTH_ROUTES,
                resources: API_ADMIN_ROUTES,
            },
    },
} as const;

export type PublicPublicationDetailPath = ReturnType<
typeof WEB_PUBLIC_ROUTES.publicationDetail
>;

export type AdminPublicationEditPath = ReturnType<
typeof ADMIN_APP_ROUTES.publicationEdit
>;

export type ApiPublicPublicationDetailPath = ReturnType<
typeof API_PUBLIC_ROUTES.publicationDetail
>;

export type ApiAdminPublicationByIdPath = ReturnType<
typeof API_ADMIN_ROUTES.publicationById
>;

export type ApiAdminPublicationStatusPath = ReturnType<
typeof API_ADMIN_ROUTES.publicationStatus
>;

export type WebPublicStaticPath =
| typeof WEB_PUBLIC_ROUTES.home
| typeof WEB_PUBLIC_ROUTES.publications;

export type AdminStaticPath =
| typeof ADMIN_APP_ROUTES.entry
| typeof ADMIN_APP_ROUTES.login
| typeof ADMIN_APP_ROUTES.dashboard
| typeof ADMIN_APP_ROUTES.publications
| typeof ADMIN_APP_ROUTES.protectedDefaultRedirect;

export type ApiUtilityPath =
| typeof API_UTILITY_ROUTES.health
| typeof API_UTILITY_ROUTES.ready;

export type ApiAdminAuthPath =
| typeof API_ADMIN_AUTH_ROUTES.login
| typeof API_ADMIN_AUTH_ROUTES.session
| typeof API_ADMIN_AUTH_ROUTES.logout;

export type ApiAdminStaticPath =
| typeof API_ADMIN_ROUTES.dashboard
| typeof API_ADMIN_ROUTES.publications;

export type AnyKnownRoutePath =
| WebPublicStaticPath
| PublicPublicationDetailPath
| AdminStaticPath
| AdminPublicationEditPath
| ApiUtilityPath
| typeof API_PUBLIC_ROUTES.publications
| ApiPublicPublicationDetailPath
| ApiAdminAuthPath
| ApiAdminStaticPath
| ApiAdminPublicationByIdPath
| ApiAdminPublicationStatusPath;

export function buildAdminLoginHref(next?: string | null): string {
    return ADMIN_APP_ROUTES.loginWithNext(next);
}

export function buildProtectedRedirectHref(): string {
    return ADMIN_APP_ROUTES.protectedDefaultRedirect;
}
