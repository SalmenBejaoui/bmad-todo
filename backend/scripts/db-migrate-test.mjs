/**
 * db-migrate-test.mjs
 *
 * Loads environment variables from backend/.env.test and runs
 * `prisma migrate deploy` against the test database.
 *
 * Used by the `pretest` hook in package.json.
 * Works with npm workspace hoisting (no reliance on backend/node_modules/.bin/prisma).
 */
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Parse .env.test from the backend root
const envFilePath = resolve(__dirname, '../.env.test')
const envVars = Object.fromEntries(
  readFileSync(envFilePath, 'utf-8')
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=')
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()]
    })
)

console.log(
  `Running prisma migrate deploy against test DB: ${envVars.DATABASE_URL ?? '(not set)'}`
)

execSync('npx prisma migrate deploy', {
  env: { ...process.env, ...envVars },
  stdio: 'inherit',
  cwd: resolve(__dirname, '..'),
})
