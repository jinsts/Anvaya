import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['labs/**/*.attempt.test.ts'] },
});
