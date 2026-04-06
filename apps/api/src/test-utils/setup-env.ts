function setEnvIfMissing(key: string, value: string): void {
  const current = process.env[key];

  if (typeof current === 'string' && current.trim().length > 0) {
    return;
  }

  process.env[key] = value;
}

setEnvIfMissing('NODE_ENV', 'test');
setEnvIfMissing('PORT', '3002');
setEnvIfMissing('SESSION_SECRET', 'test-only-session-secret-with-32-chars');
setEnvIfMissing(
  'DATABASE_URL',
  'postgresql://postgres:postgres@localhost:5432/william_albarello_test',
);
setEnvIfMissing('PUBLIC_SITE_URL', 'http://localhost:3000');
setEnvIfMissing('ADMIN_SITE_URL', 'http://localhost:3001');
setEnvIfMissing('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001');
