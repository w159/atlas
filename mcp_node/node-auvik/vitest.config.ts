import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      threshold: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80
      }
    }
  },
});