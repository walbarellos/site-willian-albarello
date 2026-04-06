// packages/contracts/src/session.ts

export const ADMIN_ROLES = ['admin', 'editor'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const API_ERROR_CODES = [
    'BAD_REQUEST',
    'UNAUTHENTICATED',
    'SESSION_EXPIRED',
    'FORBIDDEN',
    'CSRF_INVALID_TOKEN',
    'NOT_FOUND',
    'METHOD_NOT_ALLOWED',
    'CONFLICT',
    'INVALID_STATE_TRANSITION',
    'PAYLOAD_TOO_LARGE',
    'UNSUPPORTED_MEDIA_TYPE',
    'VALIDATION_ERROR',
    'RATE_LIMITED',
    'SERVICE_UNAVAILABLE',
    'INTERNAL_SERVER_ERROR',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export interface ApiMeta {
    traceId: string;
}

export interface ApiErrorDetail {
    field?: string;
    issue: string;
}

export interface ApiError {
    code: ApiErrorCode | (string & {});
    message: string;
    details?: ApiErrorDetail[];
}

export interface ApiErrorResponse {
    error: ApiError;
    meta: ApiMeta;
}

export interface AuthorizationContext {
    isAuthenticated: boolean;
    role?: AdminRole;
}

export interface AdminSessionUser {
    id: string;
    email: string;
    displayName: string;
    role: AdminRole;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AdminSessionPayload {
    user: AdminSessionUser;
    csrfToken?: string;
}

export interface SuccessSessionResponse {
    data: AdminSessionPayload;
    meta: ApiMeta;
}

export type LoginSuccessResponse = SuccessSessionResponse;
export type CurrentSessionResponse = SuccessSessionResponse;

export interface LogoutSuccessResponse {
    data: {
        success: true;
    };
    meta: ApiMeta;
}

export interface UnauthorizedErrorResponse extends ApiErrorResponse {
    error: ApiError & {
        code: 'UNAUTHENTICATED' | 'SESSION_EXPIRED';
    };
}

export interface ForbiddenErrorResponse extends ApiErrorResponse {
    error: ApiError & {
        code: 'FORBIDDEN' | 'CSRF_INVALID_TOKEN';
    };
}

export interface ValidationErrorResponse extends ApiErrorResponse {
    error: ApiError & {
        code: 'VALIDATION_ERROR';
        details: ApiErrorDetail[];
    };
}

export interface RateLimitedErrorResponse extends ApiErrorResponse {
    error: ApiError & {
        code: 'RATE_LIMITED';
    };
}

export interface InternalServerErrorResponse extends ApiErrorResponse {
    error: ApiError & {
        code: 'INTERNAL_SERVER_ERROR';
    };
}

export type AuthFailureResponse =
| UnauthorizedErrorResponse
| ForbiddenErrorResponse
| ValidationErrorResponse
| RateLimitedErrorResponse
| InternalServerErrorResponse;

export type AdminSessionResponse =
| SuccessSessionResponse
| UnauthorizedErrorResponse;

export function isAdminRole(value: unknown): value is AdminRole {
    return typeof value === 'string' && ADMIN_ROLES.includes(value as AdminRole);
}

export function isAdminSessionUser(value: unknown): value is AdminSessionUser {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<AdminSessionUser>;

    return (
        typeof candidate.id === 'string' &&
        typeof candidate.email === 'string' &&
        typeof candidate.displayName === 'string' &&
        isAdminRole(candidate.role)
    );
}

export function isSuccessSessionResponse(
    value: unknown,
): value is SuccessSessionResponse {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<SuccessSessionResponse>;

    if (!candidate.data || typeof candidate.data !== 'object') {
        return false;
    }

    if (!candidate.meta || typeof candidate.meta !== 'object') {
        return false;
    }

    const data = candidate.data as Partial<AdminSessionPayload>;
    const meta = candidate.meta as Partial<ApiMeta>;

    if (!isAdminSessionUser(data.user)) {
        return false;
    }

    if (data.csrfToken !== undefined && typeof data.csrfToken !== 'string') {
        return false;
    }

    return typeof meta.traceId === 'string';
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<ApiErrorResponse>;

    if (!candidate.error || typeof candidate.error !== 'object') {
        return false;
    }

    if (!candidate.meta || typeof candidate.meta !== 'object') {
        return false;
    }

    const error = candidate.error as Partial<ApiError>;
    const meta = candidate.meta as Partial<ApiMeta>;

    const detailsAreValid =
    error.details === undefined ||
    (Array.isArray(error.details) &&
    error.details.every((detail) =>
        Boolean(
            detail &&
            typeof detail === 'object' &&
            'issue' in detail &&
            typeof (detail as Partial<ApiErrorDetail>).issue === 'string' &&
            (
                !('field' in detail) ||
                (detail as Partial<ApiErrorDetail>).field === undefined ||
                typeof (detail as Partial<ApiErrorDetail>).field === 'string'
            ),
        ),
    ));

    return (
        typeof error.code === 'string' &&
        typeof error.message === 'string' &&
        detailsAreValid &&
        typeof meta.traceId === 'string'
    );
}

export function getAuthorizationContext(
    response: SuccessSessionResponse | null | undefined,
): AuthorizationContext {
    if (!response) {
        return {
            isAuthenticated: false,
        };
    }

    return {
        isAuthenticated: true,
        role: response.data.user.role,
    };
}
