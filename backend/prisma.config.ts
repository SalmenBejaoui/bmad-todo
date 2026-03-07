import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'

// Prisma 7 configuration — connection URL is defined here, not in schema.prisma
// DATABASE_URL must be provided via environment variable (set in .env.development or .env.test)
// NOTE: validation is lazy (inside adapter factory) so `prisma generate` works without DATABASE_URL

function createAdapter() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  return new PrismaPg({ connectionString })
}

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  // Static reference required by `prisma migrate deploy`; empty string fallback for `prisma generate` (no DB needed)
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
  migrate: {
    adapter: createAdapter,
  },
})
