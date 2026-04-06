import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'api',
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/test-utils/setup-env.ts'],
    reporters: ['default'],
    passWithNoTests: false,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
});
