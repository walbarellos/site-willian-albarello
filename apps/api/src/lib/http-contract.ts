// apps/api/src/lib/http-contract.ts

import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ZodIssue } from 'zod';

export type TraceMeta = {
    traceId: string;
};

export type PaginationMeta = TraceMeta & {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
};

export type HttpErrorDetail = {
    field?: string;
    issue: string;
};

export type HttpSuccessPayload<TData> = {
    data: TData;
    meta: TraceMeta;
};

export type HttpPaginatedSuccessPayload<TItem> = {
    data: TItem[];
    meta: PaginationMeta;
};

export type HttpErrorPayload<TCode extends string = string> = {
    error: {
        code: TCode;
        message: string;
        details?: HttpErrorDetail[];
    };
    meta: TraceMeta;
};

export type PaginationInput = {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
};

export const HTTP_ERROR_CODES = [
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

export type ErrorCode = (typeof HTTP_ERROR_CODES)[number] | (string & {});

function normalizePositiveInteger(value: number, fallback: number): number {
    if (!Number.isFinite(value)) {
        return fallback;
    }

    const normalized = Math.trunc(value);
    return normalized <= 0 ? fallback : normalized;
}

function normalizeErrorDetails(
    details?: HttpErrorDetail[],
): HttpErrorDetail[] | undefined {
    if (!Array.isArray(details) || details.length === 0) {
        return undefined;
    }

    const normalized = details
    .map((detail) => {
        const issue = detail.issue?.trim();
        const field = detail.field?.trim();

        if (!issue) {
            return null;
        }

        return {
            ...(field ? { field } : {}),
            issue,
        };
    })
    .filter((detail): detail is HttpErrorDetail => detail !== null);

    return normalized.length > 0 ? normalized : undefined;
}

export function getTraceMeta(request: FastifyRequest): TraceMeta {
    return {
        traceId: request.id,
    };
}

export function getPaginationMeta(
    request: FastifyRequest,
    pagination: PaginationInput,
): PaginationMeta {
    return {
        traceId: request.id,
        page: normalizePositiveInteger(pagination.page, 1),
        pageSize: normalizePositiveInteger(pagination.pageSize, 1),
        totalItems: normalizePositiveInteger(pagination.totalItems, 0),
        totalPages: normalizePositiveInteger(pagination.totalPages, 0),
    };
}

export function buildSuccessPayload<TData>(
    request: FastifyRequest,
    data: TData,
): HttpSuccessPayload<TData> {
    return {
        data,
        meta: getTraceMeta(request),
    };
}

export function buildPaginatedSuccessPayload<TItem>(
    request: FastifyRequest,
    items: TItem[],
    pagination: PaginationInput,
): HttpPaginatedSuccessPayload<TItem> {
    return {
        data: items,
        meta: getPaginationMeta(request, pagination),
    };
}

export function buildErrorPayload<TCode extends string = ErrorCode>(
    request: FastifyRequest,
    code: TCode,
    message: string,
    details?: HttpErrorDetail[],
): HttpErrorPayload<TCode> {
    const normalizedDetails = normalizeErrorDetails(details);

    return {
        error: {
            code,
            message,
            ...(normalizedDetails ? { details: normalizedDetails } : {}),
        },
        meta: getTraceMeta(request),
    };
}

export function sendSuccess<TData>(
    request: FastifyRequest,
    reply: FastifyReply,
    data: TData,
    statusCode = 200,
): FastifyReply {
    return reply.status(statusCode).send(buildSuccessPayload(request, data));
}

export function sendCreated<TData>(
    request: FastifyRequest,
    reply: FastifyReply,
    data: TData,
): FastifyReply {
    return sendSuccess(request, reply, data, 201);
}

export function sendPaginatedSuccess<TItem>(
    request: FastifyRequest,
    reply: FastifyReply,
    items: TItem[],
    pagination: PaginationInput,
    statusCode = 200,
): FastifyReply {
    return reply
    .status(statusCode)
    .send(buildPaginatedSuccessPayload(request, items, pagination));
}

export function sendError<TCode extends string = ErrorCode>(
    request: FastifyRequest,
    reply: FastifyReply,
    statusCode: number,
    code: TCode,
    message: string,
    details?: HttpErrorDetail[],
): FastifyReply {
    return reply
    .status(statusCode)
    .send(buildErrorPayload(request, code, message, details));
}

export function sendValidationError(
    request: FastifyRequest,
    reply: FastifyReply,
    details: HttpErrorDetail[],
    message = 'The request payload is invalid.',
): FastifyReply {
    return sendError(
        request,
        reply,
        422,
        'VALIDATION_ERROR',
        message,
        details,
    );
}

export function sendQueryValidationError(
    request: FastifyRequest,
    reply: FastifyReply,
    details: HttpErrorDetail[],
    message = 'The request query is invalid.',
): FastifyReply {
    return sendError(
        request,
        reply,
        422,
        'VALIDATION_ERROR',
        message,
        details,
    );
}

export function sendParamsValidationError(
    request: FastifyRequest,
    reply: FastifyReply,
    details: HttpErrorDetail[],
    message = 'The route parameters are invalid.',
): FastifyReply {
    return sendError(
        request,
        reply,
        422,
        'VALIDATION_ERROR',
        message,
        details,
    );
}

export function mapZodIssuesToErrorDetails(issues: ZodIssue[]): HttpErrorDetail[] {
    return issues.map((issue) => ({
        field: issue.path.join('.') || undefined,
        issue: issue.message.trim() || 'Invalid value.',
    }));
}

export function isFastifyReply(value: unknown): value is FastifyReply {
    return (
        typeof value === 'object' &&
        value !== null &&
        'statusCode' in value &&
        'send' in value
    );
}
