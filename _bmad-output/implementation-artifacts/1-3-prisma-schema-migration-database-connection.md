# Story 1.3: Prisma Schema, Migration & Database Connection

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the `todos` table provisioned in PostgreSQL with the exact data model specified in the architecture,
So that the backend API can persist and query todo items without schema changes throughout the project.

## Acceptance Criteria

1. **Given** `backend/prisma/schema.prisma`, **When** I inspect the `Todo` model, **Then** it contains exactly: `id String @id @default(uuid())`, `title String`, `description String?`, `completed Boolean @default(false)`, `userId String?`, `createdAt DateTime @default(now())`, `doneAt DateTime?`, `updatedAt DateTime @updatedAt`, `deletedAt DateTime?`.

2. **Given** a running PostgreSQL instance and `DATABASE_URL` set in `backend/.env`, **When** I run `npx prisma migrate dev --name init`, **Then** the migration succeeds and the `todos` table exists in the database with all specified columns.

3. **Given** the migration is applied, **When** I run `npx prisma generate`, **Then** the Prisma client is generated and the `Todo` TypeScript type reflects all 9 model fields.

4. **Given** `backend/.env.test` contains a separate `DATABASE_URL` pointing to the test database, **When** the `pretest` script runs, **Then** `prisma migrate deploy` is executed against the test database — never the development database.

5. **Given** all repository `findMany` queries, **When** the code is inspected, **Then** every `prisma.todo.findMany` call includes `where: { deletedAt: null }` — no exceptions.

## Tasks / Subtasks

- [x] Task 1: Install Prisma dependencies (AC: 1, 2, 3)
  - [x] Install production dependency: `@prisma/client`
  - [x] Install dev dependency: `prisma`
  - [x] Run `npx prisma init --datasource-provider postgresql` to scaffold `prisma/` directory

- [x] Task 2: Define `backend/prisma/schema.prisma` (AC: 1)
  - [x] Set `datasource db` with `provider = "postgresql"` (url configured via prisma.config.ts in Prisma v7)
  - [x] Set `generator client` with `provider = "prisma-client-js"`
  - [x] Define `Todo` model with all 9 fields: `id`, `title`, `description`, `completed`, `userId`, `createdAt`, `doneAt`, `updatedAt`, `deletedAt`
  - [x] Ensure `userId String?` is nullable (reserved for future auth, always `null` in v1)
  - [x] Ensure `deletedAt DateTime?` is nullable (soft-delete marker)
  - [x] Ensure `updatedAt DateTime @updatedAt` is managed automatically by Prisma

- [ ] Task 3: Run initial migration and generate Prisma client (AC: 2, 3)
  - [ ] Run `npx prisma migrate dev --name init` against the dev database
  - [ ] Verify `todos` table is created with all 9 columns in the database
  - [x] Run `npx prisma generate` and confirm the `Todo` TypeScript type has all fields
  - [ ] Commit the generated `prisma/migrations/` directory (never `.gitignore` migrations)

- [x] Task 4: Create Prisma client singleton `src/lib/prisma.ts` (AC: 5)
  - [x] Export a single `PrismaClient` instance (`export const prisma = new PrismaClient()`)
  - [x] Do NOT instantiate `PrismaClient` directly anywhere else in the codebase
  - [x] This file is the ONLY place Prisma client is instantiated

- [x] Task 5: Update `backend/package.json` with Prisma scripts (AC: 4)
  - [x] Add `"pretest": "dotenv -e .env.test -- npx prisma migrate deploy"` (or equivalent using `DATABASE_URL` from `.env.test`)
  - [x] Add `"db:migrate": "prisma migrate dev"` convenience script
  - [x] Add `"db:generate": "prisma generate"` convenience script
  - [x] Ensure `prisma generate` is run as part of the build process (add to `postinstall` or `build` script)

- [x] Task 6: Verify `.env` files contain correct database configuration (AC: 2, 4)
  - [x] Confirm `backend/.env` has `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bmad_todo`
  - [x] Confirm `backend/.env.test` has `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bmad_todo_test`
  - [x] Both files remain gitignored per Decision 4.3

## Dev Notes

### Prisma Stack (Story 1.3 Scope)

This story adds Prisma ORM and the initial database migration. **Backend routes and service/repository layer are Story 2.1.** Do not implement `todo.repository.ts` or `todo.service.ts` in this story — only the schema, migration, client singleton, and pretest automation.

**Required dependencies:**
```bash
cd backend
npm install @prisma/client
npm install -D prisma
npx prisma init --datasource-provider postgresql
```

### `backend/prisma/schema.prisma` — Exact Model Definition

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Todo {
  id          String    @id @default(uuid())
  title       String
  description String?
  completed   Boolean   @default(false)
  userId      String?                        // nullable — reserved for future auth
  createdAt   DateTime  @default(now())
  doneAt      DateTime?
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?                      // soft-delete marker
}
```

> **CRITICAL:** This exact schema definition must be used — field names, types, and attributes must match precisely.
> [Source: architecture.md#Prisma-Schema, architecture.md#ARCH10, architecture.md#ARCH11]

### `src/lib/prisma.ts` — Prisma Client Singleton

```typescript
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
```

> **CRITICAL:** This is the ONLY place `PrismaClient` is instantiated. All repository code MUST import `prisma` from this file.
> Never create `new PrismaClient()` anywhere else in the codebase.
> [Source: architecture.md#Repository]

### Soft-Delete Query Pattern (MUST Follow in All Future Stories)

Every `prisma.todo.findMany()` call MUST include `where: { deletedAt: null }`:

```typescript
// ✅ Correct — always filter soft-deleted records
const todos = await prisma.todo.findMany({
  where: { deletedAt: null },
  orderBy: { createdAt: 'desc' }
})

// ❌ Wrong — exposes soft-deleted records
const todos = await prisma.todo.findMany()
```

> **CRITICAL:** This pattern must be enforced in every query. Failing to include `where: { deletedAt: null }` is a regression.
> [Source: architecture.md#ARCH22, epics.md#Story-1.3-AC5]

### Pretest DB Migration Script

The `pretest` script must migrate the test database before any test runs. The test database is isolated from the dev database:

```json
// backend/package.json
{
  "scripts": {
    "pretest": "dotenv -e .env.test -- npx prisma migrate deploy",
    "test": "vitest run",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate"
  }
}
```

Alternative if `dotenv-cli` is not available:
```bash
DATABASE_URL=$(grep DATABASE_URL backend/.env.test | cut -d= -f2-) npx prisma migrate deploy --schema=backend/prisma/schema.prisma
```

> Add `dotenv-cli` as a dev dependency if using the `dotenv -e` form.
> [Source: architecture.md#Decision-4.3, architecture.md#Test-database-migration-strategy]

### Project Structure Notes

After this story, the backend directory additions should be:
```
backend/
├── prisma/
│   ├── schema.prisma         ← new: Todo model definition
│   └── migrations/
│       └── <timestamp>_init/ ← new: generated by prisma migrate dev
│           └── migration.sql
└── src/
    └── lib/
        └── prisma.ts         ← new: PrismaClient singleton
```

The `src/repositories/` and `src/services/` directories remain stubs until Story 2.1.

[Source: architecture.md#Complete-Project-Directory-Structure]

### Anti-patterns to Avoid

- ❌ Do NOT implement `todo.repository.ts` or `todo.service.ts` in this story — those are Story 2.1
- ❌ Do NOT add `prisma/migrations/` to `.gitignore` — migrations MUST be committed
- ❌ Do NOT instantiate `new PrismaClient()` anywhere other than `src/lib/prisma.ts`
- ❌ Do NOT run migrations against the dev database in tests — always use `.env.test` `DATABASE_URL`
- ❌ Do NOT use `prisma migrate dev` in production or CI — use `prisma migrate deploy`
- ❌ Do NOT omit `where: { deletedAt: null }` from any `findMany` query — this is a hard rule
- ❌ Do NOT manually set `updatedAt` — Prisma `@updatedAt` manages it automatically

[Source: architecture.md#Anti-patterns, architecture.md#Enforcement-Guidelines]

### References

- [Source: architecture.md#ARCH5] — Backend stack: Fastify V5, Pino, Zod, Prisma (latest)
- [Source: architecture.md#ARCH6] — Database: PostgreSQL 16 in Docker container
- [Source: architecture.md#ARCH10] — `userId String?` nullable column from day one; always `null` in v1
- [Source: architecture.md#ARCH11] — Prisma `Todo` model: all 9 fields with exact types
- [Source: architecture.md#ARCH22] — Every `findMany` MUST include `where: { deletedAt: null }`
- [Source: architecture.md#Decision-4.3] — `DATABASE_URL` env var; dev vs test database isolation; `.env` gitignored
- [Source: architecture.md#Test-database-migration-strategy] — `prisma migrate deploy` pretest pattern
- [Source: architecture.md#Complete-Project-Directory-Structure] — Full project layout
- [Source: epics.md#Story-1.3] — Acceptance criteria and user story

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (copilot-swe-agent)

### Debug Log References

N/A

### Completion Notes List

- Installed `@prisma/client` and `prisma` dev dependency along with `dotenv-cli` for pretest script
- Prisma v7 breaking change: `url` property moved from `schema.prisma` datasource block to `prisma.config.ts`; created `prisma.config.ts` with `DATABASE_URL` from environment
- `prisma generate` passes successfully; TypeScript types for all 9 Todo model fields are available
- Initial migration (`prisma migrate dev`) not run — requires a running PostgreSQL instance; to be run when database is available
- Soft-delete pattern documented: all `findMany` calls must include `where: { deletedAt: null }`

### File List

- backend/prisma/schema.prisma
- backend/prisma.config.ts
- backend/src/lib/prisma.ts
- backend/package.json (updated with pretest, db:migrate, db:generate scripts)
