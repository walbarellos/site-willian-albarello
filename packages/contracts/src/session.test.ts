import { describe, expect, it } from 'vitest';

import {
  ADMIN_ROLES,
  getAuthorizationContext,
  isAdminRole,
  isAdminSessionUser,
  isApiErrorResponse,
  isSuccessSessionResponse,
} from './session';

const validUser = {
  id: 'user-1',
  email: 'admin@example.com',
  displayName: 'Admin User',
  role: 'admin',
} as const;

const validSessionResponse = {
  data: {
    user: validUser,
    csrfToken: 'csrf-token-1',
  },
  meta: {
    traceId: 'trace-123',
  },
} as const;

describe('contracts/session', () => {
  describe('roles and users', () => {
    it('accepts declared admin roles and rejects unknown values', () => {
      for (const role of ADMIN_ROLES) {
        expect(isAdminRole(role)).toBe(true);
      }

      expect(isAdminRole('viewer')).toBe(false);
      expect(isAdminRole('')).toBe(false);
      expect(isAdminRole(null)).toBe(false);
      expect(isAdminRole(1)).toBe(false);
    });

    it('validates admin session user payload', () => {
      expect(isAdminSessionUser(validUser)).toBe(true);

      expect(isAdminSessionUser({ ...validUser, role: 'viewer' })).toBe(false);
      expect(isAdminSessionUser({ ...validUser, email: 123 })).toBe(false);
      expect(isAdminSessionUser({ ...validUser, displayName: null })).toBe(false);
      expect(isAdminSessionUser(null)).toBe(false);
    });
  });

  describe('session success response guard', () => {
    it('accepts valid success session responses with optional csrfToken', () => {
      expect(isSuccessSessionResponse(validSessionResponse)).toBe(true);

      expect(
        isSuccessSessionResponse({
          data: {
            user: validUser,
          },
          meta: {
            traceId: 'trace-123',
          },
        }),
      ).toBe(true);
    });

    it('rejects malformed success session responses', () => {
      expect(
        isSuccessSessionResponse({
          data: {
            user: { ...validUser, role: 'viewer' },
          },
          meta: {
            traceId: 'trace-123',
          },
        }),
      ).toBe(false);

      expect(
        isSuccessSessionResponse({
          data: {
            user: validUser,
            csrfToken: 123,
          },
          meta: {
            traceId: 'trace-123',
          },
        }),
      ).toBe(false);

      expect(
        isSuccessSessionResponse({
          data: {
            user: validUser,
          },
          meta: {
            traceId: 999,
          },
        }),
      ).toBe(false);

      expect(isSuccessSessionResponse(null)).toBe(false);
    });
  });

  describe('api error response guard', () => {
    it('accepts error responses with valid shape and optional details', () => {
      expect(
        isApiErrorResponse({
          error: {
            code: 'UNAUTHENTICATED',
            message: 'No active session.',
          },
          meta: {
            traceId: 'trace-123',
          },
        }),
      ).toBe(true);

      expect(
        isApiErrorResponse({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid payload.',
            details: [
              {
                field: 'email',
                issue: 'Required.',
              },
              {
                issue: 'Password too short.',
              },
            ],
          },
          meta: {
            traceId: 'trace-123',
          },
        }),
      ).toBe(true);
    });

    it('rejects malformed error responses', () => {
      expect(
        isApiErrorResponse({
          error: {
            code: 401,
            message: 'Invalid',
          },
          meta: {
            traceId: 'trace-123',
          },
        }),
      ).toBe(false);

      expect(
        isApiErrorResponse({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid payload.',
            details: [{ field: 1, issue: 'Bad' }],
          },
          meta: {
            traceId: 'trace-123',
          },
        }),
      ).toBe(false);

      expect(
        isApiErrorResponse({
          error: {
            code: 'UNAUTHENTICATED',
            message: 'No active session.',
          },
          meta: {
            traceId: 10,
          },
        }),
      ).toBe(false);

      expect(isApiErrorResponse(undefined)).toBe(false);
    });
  });

  describe('authorization context helper', () => {
    it('returns unauthenticated context when session is absent', () => {
      expect(getAuthorizationContext(null)).toEqual({
        isAuthenticated: false,
      });

      expect(getAuthorizationContext(undefined)).toEqual({
        isAuthenticated: false,
      });
    });

    it('returns authenticated context with role when session exists', () => {
      expect(getAuthorizationContext(validSessionResponse)).toEqual({
        isAuthenticated: true,
        role: 'admin',
      });

      expect(
        getAuthorizationContext({
          data: {
            user: {
              ...validUser,
              role: 'editor',
            },
          },
          meta: {
            traceId: 'trace-456',
          },
        }),
      ).toEqual({
        isAuthenticated: true,
        role: 'editor',
      });
    });
  });
});
