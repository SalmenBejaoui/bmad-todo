import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E configuration.
 *
 * By default, runs against the Docker Compose production stack (http://localhost).
 * Override with PLAYWRIGHT_BASE_URL for development:
 *   PLAYWRIGHT_BASE_URL=http://localhost:5173 npm run test:e2e
 *
 * Required: backend must be running and reachable at PLAYWRIGHT_API_URL.
 */
export default defineConfig({
  testDir: './tests',

  // Run tests sequentially to avoid DB conflicts
  fullyParallel: false,
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  reporter: 'list',

  use: {
    // Frontend URL — Docker Compose serves nginx on port 80
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost',

    // Capture trace on first retry for debugging
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
