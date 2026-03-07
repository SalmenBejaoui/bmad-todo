import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Inject env directly — Vitest does not auto-load .env.test
    env: {
      LOG_LEVEL: 'silent', // suppress Fastify/Pino output during tests
    },
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/server.ts'], // entry point excluded from coverage
    },
  },
})
