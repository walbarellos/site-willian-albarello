// apps/api/src/lib/env.ts

import { z } from 'zod';

const NODE_ENVS = ['development', 'test', 'production'] as const;

const nodeEnvSchema = z.enum(NODE_ENVS);
const portSchema = z.coerce.number().int().min(1).max(65535);
const absoluteUrlSchema = z
  .string()
  .trim()
  .url('must be a valid absolute URL, including protocol')
  .refine(
    (value) => value.startsWith('http://') || value.startsWith('https://'),
    'must start with http:// or https://',
  );

const rawEnvSchema = z.object({
  PORT: z.union([z.string(), z.number()]).optional(),
  NODE_ENV: nodeEnvSchema.optional(),
  SESSION_SECRET: z.string().trim().optional(),
  DATABASE_URL: z.string().trim().optional(),
  PUBLIC_SITE_URL: z.string().trim().optional(),
  ADMIN_SITE_URL: z.string().trim().optional(),
  CORS_ORIGINS: z.string().trim().optional(),
});

type RawEnv = z.infer<typeof rawEnvSchema>;
export type NodeEnv = z.infer<typeof nodeEnvSchema>;

export interface AppEnv {
  PORT: number;
  NODE_ENV: NodeEnv;
  IS_DEV: boolean;
  IS_TEST: boolean;
  IS_PROD: boolean;
  SESSION_SECRET: string;
  DATABASE_URL: string;
  PUBLIC_SITE_URL: string;
  ADMIN_SITE_URL: string;
  CORS_ORIGINS: string[];
}

const DEV_DEFAULTS = {
  PORT: 3002,
  SESSION_SECRET: 'dev-only-change-me-session-secret-32',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/william_albarello',
  PUBLIC_SITE_URL: 'http://localhost:3000',
  ADMIN_SITE_URL: 'http://localhost:3001',
} as const;

function formatZodIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'env';
      return `- ${path}: ${issue.message}`;
    })
    .join('\n');
}

function failConfig(message: string): never {
  throw new Error(`Invalid environment configuration:\n${message}`);
}

function parseRequiredString(
  key: keyof Pick<
    AppEnv,
    'SESSION_SECRET' | 'DATABASE_URL' | 'PUBLIC_SITE_URL' | 'ADMIN_SITE_URL'
  >,
  value: string | undefined,
  schema: z.ZodType<string>,
): string {
  const result = schema.safeParse(value);
  if (!result.success) {
    failConfig(`${key}\n${formatZodIssues(result.error)}`);
  }
  return result.data;
}

function parseCorsOrigins(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  const rawOrigins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const uniqueOrigins = Array.from(new Set(rawOrigins));

  if (uniqueOrigins.length === 0) {
    return [];
  }

  const invalidOrigins = uniqueOrigins.filter(
    (origin) => !absoluteUrlSchema.safeParse(origin).success,
  );

  if (invalidOrigins.length > 0) {
    failConfig(
      `CORS_ORIGINS contains invalid origin(s): ${invalidOrigins.join(', ')}`,
    );
  }

  return uniqueOrigins;
}

function resolveRawEnv(source: NodeJS.ProcessEnv = process.env): RawEnv {
  const parsed = rawEnvSchema.safeParse(source);

  if (!parsed.success) {
    failConfig(formatZodIssues(parsed.error));
  }

  return parsed.data;
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const raw = resolveRawEnv(source);

  const NODE_ENV = raw.NODE_ENV ?? 'development';
  const IS_DEV = NODE_ENV === 'development';
  const IS_TEST = NODE_ENV === 'test';
  const IS_PROD = NODE_ENV === 'production';

  const PORT = (() => {
    const result = portSchema.safeParse(raw.PORT ?? (IS_DEV ? DEV_DEFAULTS.PORT : undefined));

    if (!result.success) {
      failConfig(`PORT\n${formatZodIssues(result.error)}`);
    }

    return result.data;
  })();

  const SESSION_SECRET = parseRequiredString(
    'SESSION_SECRET',
    raw.SESSION_SECRET ?? (IS_DEV ? DEV_DEFAULTS.SESSION_SECRET : undefined),
    z
      .string()
      .trim()
      .min(
        IS_PROD ? 32 : 16,
        IS_PROD
          ? 'must have at least 32 characters in production'
          : 'must have at least 16 characters',
      )
      .refine(
        (value) => !(IS_PROD && value === DEV_DEFAULTS.SESSION_SECRET),
        'cannot use the development default in production',
      ),
  );

  const DATABASE_URL = parseRequiredString(
    'DATABASE_URL',
    raw.DATABASE_URL ?? (IS_DEV ? DEV_DEFAULTS.DATABASE_URL : undefined),
    z.string().trim().min(1, 'is required'),
  );

  const PUBLIC_SITE_URL = parseRequiredString(
    'PUBLIC_SITE_URL',
    raw.PUBLIC_SITE_URL ?? (IS_DEV ? DEV_DEFAULTS.PUBLIC_SITE_URL : undefined),
    absoluteUrlSchema,
  );

  const ADMIN_SITE_URL = parseRequiredString(
    'ADMIN_SITE_URL',
    raw.ADMIN_SITE_URL ?? (IS_DEV ? DEV_DEFAULTS.ADMIN_SITE_URL : undefined),
    absoluteUrlSchema,
  );

  const derivedCorsOrigins = [PUBLIC_SITE_URL, ADMIN_SITE_URL].join(',');
  const rawCorsOrigins = raw.CORS_ORIGINS ?? (IS_DEV ? derivedCorsOrigins : undefined);
  const CORS_ORIGINS = parseCorsOrigins(rawCorsOrigins);

  if (!IS_DEV && CORS_ORIGINS.length === 0) {
    failConfig('CORS_ORIGINS must be explicitly configured outside development');
  }

  return {
    PORT,
    NODE_ENV,
    IS_DEV,
    IS_TEST,
    IS_PROD,
    SESSION_SECRET,
    DATABASE_URL,
    PUBLIC_SITE_URL,
    ADMIN_SITE_URL,
    CORS_ORIGINS,
  };
}

export const env = loadEnv();
