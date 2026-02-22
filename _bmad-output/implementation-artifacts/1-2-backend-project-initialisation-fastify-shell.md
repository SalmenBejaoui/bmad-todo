# Story 1.2: Backend Project Initialisation & Fastify Shell

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a minimal Fastify V5 backend application that starts and responds to a health check,
So that the backend layer is ready to receive route, service, and repository additions in Epic 2.

## Acceptance Criteria

1. **Given** the backend directory, **When** I run `npm install`, **Then** Fastify V5, `@fastify/cors@^9`, `@fastify/sensible@^6`, `@fastify/type-provider-zod@^4`, `fastify-plugin@^5`, Zod, and Pino are installed with correct version constraints.

2. **Given** the backend is running, **When** I send `GET /health` to port 3000, **Then** I receive HTTP 200 with `{ "status": "ok", "timestamp": "<ISO-8601>" }`.

3. **Given** `src/app.ts` (Fastify instance factory), **When** the backend starts, **Then** `@fastify/cors` (reading `ALLOWED_ORIGIN` env var), `@fastify/sensible`, and the global error handler plugin are all registered.

4. **Given** an unhandled error of any kind reaches the global error handler, **When** Fastify processes it, **Then** the client receives `{ "error": "...", "code": "..." }` — no stack traces, no internal paths, no raw DB error details — and the error is logged before the response is sent.

5. **Given** `src/server.ts`, **When** the backend is started in production, **Then** it calls `app.listen()` with `PORT` from the environment (default 3000) — `server.ts` is never imported in tests, only `app.ts` is.

6. **Given** `backend/tsconfig.json`, **When** I run `npm run build`, **Then** TypeScript compiles the backend without errors.

## Tasks / Subtasks

- [ ] Task 1: Install backend dependencies (AC: 1)
  - [ ] Install production dependencies: `fastify`, `@fastify/cors@^9`, `@fastify/sensible@^6`, `@fastify/type-provider-zod@^4`, `fastify-plugin@^5`, `zod`, `pino`
  - [ ] Install dev dependencies: `typescript`, `vitest`, `@types/node`, `tsx` (for local dev with `--watch`)
  - [ ] Update `backend/package.json` with `name: "backend"`, `scripts` (`dev`, `build`, `test`), and `engines.node >= 24`

- [ ] Task 2: Configure TypeScript (AC: 6)
  - [ ] Create `backend/tsconfig.json` with `target: "ES2022"`, `module: "NodeNext"`, `moduleResolution: "NodeNext"`, `outDir: "dist"`, `rootDir: "src"`, `strict: true`, `esModuleInterop: true`, `skipLibCheck: true`

- [ ] Task 3: Create Fastify application factory `src/app.ts` (AC: 3)
  - [ ] Export an `async function buildApp(opts?)` that creates and configures the Fastify instance
  - [ ] Register `@fastify/cors` plugin reading `ALLOWED_ORIGIN` from `process.env` (fallback: `http://localhost:5173`)
  - [ ] Register `@fastify/sensible` plugin
  - [ ] Register `plugins/error-handler.ts` global error handler
  - [ ] Register `routes/health.routes.ts` for the `/health` endpoint
  - [ ] Do NOT call `app.listen()` inside `app.ts` — keep factory separate from startup

- [ ] Task 4: Create error handler plugin `src/plugins/error-handler.ts` (AC: 4)
  - [ ] Use `fastify-plugin` to register `setErrorHandler` on the Fastify instance
  - [ ] Transform all errors to `{ error: string, code?: string }` shape only
  - [ ] Log error with `request.log.error` before sending response (carry `reqId` automatically)
  - [ ] Never expose stack traces, internal paths, or raw error messages to the client
  - [ ] Handle Zod validation errors separately (return 400 with `VALIDATION_ERROR` code)

- [ ] Task 5: Create health route `src/routes/health.routes.ts` (AC: 2)
  - [ ] Register `GET /health` returning `{ "status": "ok", "timestamp": "<ISO-8601>" }` with HTTP 200
  - [ ] Use `new Date().toISOString()` for the timestamp field

- [ ] Task 6: Create runtime entry point `src/server.ts` (AC: 5)
  - [ ] Import `buildApp` from `./app`
  - [ ] Call `app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' })`
  - [ ] Use `app.log.info` to log server start message
  - [ ] `server.ts` must NEVER be imported in tests — tests import only `app.ts`

- [ ] Task 7: Create directory stubs for future stories
  - [ ] Create `src/routes/` directory (health.routes.ts goes here; todo.routes.ts in Epic 2)
  - [ ] Create `src/services/` directory stub (todo.service.ts in Epic 2)
  - [ ] Create `src/repositories/` directory stub (todo.repository.ts in Epic 2)
  - [ ] Create `src/plugins/` directory (error-handler.ts goes here; cors.ts optional)
  - [ ] Create `src/schemas/` directory stub (error.schema.ts, todo.schema.ts in Epic 2)
  - [ ] Create `src/types/` directory stub (index.ts in Epic 2)
  - [ ] Create `tests/unit/` and `tests/integration/` directory stubs

- [ ] Task 8: Create `backend/.env` and `backend/.env.test` files (AC: 2, 3)
  - [ ] Create `backend/.env` with `PORT=3000`, `ALLOWED_ORIGIN=http://localhost:5173`, and `DATABASE_URL` placeholder
  - [ ] Create `backend/.env.test` with separate `DATABASE_URL` pointing to test database

- [ ] Task 9: Verify build and update root dev script (AC: 2, 6)
  - [ ] Confirm `npm run build` in `backend/` compiles TypeScript without errors
  - [ ] Update root `package.json` `dev` script to use `tsx watch src/server.ts` instead of placeholder
  - [ ] Verify `GET /health` returns correct response when server is started

## Dev Notes

### Backend Tech Stack (Story 1.2 Scope)

This story installs and wires up the Fastify V5 shell only. **Prisma and database are Story 1.3.** Do not install `prisma` or `@prisma/client` in this story.

**Required production dependencies:**
```bash
cd backend
npm install fastify @fastify/cors@^9 @fastify/sensible@^6 @fastify/type-provider-zod@^4 fastify-plugin@^5 zod pino
npm install -D typescript vitest @types/node tsx
```

> ⚠️ **CRITICAL — Fastify V5 Plugin Version Floor:** V4-era plugins silently fail to register in Fastify V5. Always use:
> - `@fastify/cors@^9.0.0`
> - `@fastify/sensible@^6.0.0`
> - `@fastify/type-provider-zod@^4.0.0`
> - `fastify-plugin@^5.0.0`
>
> [Source: architecture.md#ARCH5, architecture.md#Fastify-V5-Ecosystem]

### `backend/package.json` Requirements

```json
{
  "name": "backend",
  "version": "0.0.1",
  "private": true,
  "engines": { "node": ">=24" },
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc --project tsconfig.json",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "fastify": "^5.0.0",
    "@fastify/cors": "^9.0.0",
    "@fastify/sensible": "^6.0.0",
    "@fastify/type-provider-zod": "^4.0.0",
    "fastify-plugin": "^5.0.0",
    "zod": "^3.0.0",
    "pino": "^9.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^2.0.0",
    "@types/node": "^22.0.0",
    "tsx": "^4.0.0"
  }
}
```

[Source: architecture.md#ARCH5, architecture.md#First-Implementation-Priority]

### `backend/tsconfig.json` Requirements

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

[Source: architecture.md#Complete-Project-Directory-Structure]

### `src/app.ts` — Fastify Instance Factory Pattern

```typescript
import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import sensible from '@fastify/sensible'
import { errorHandlerPlugin } from './plugins/error-handler.js'
import { healthRoutes } from './routes/health.routes.js'

export async function buildApp(opts: Record<string, unknown> = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,  // Pino is built-in to Fastify
    ...opts
  })

  // Register CORS — reads ALLOWED_ORIGIN from environment
  await app.register(cors, {
    origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173'
  })

  // Register sensible (httpErrors, etc.)
  await app.register(sensible)

  // Register global error handler
  await app.register(errorHandlerPlugin)

  // Register routes
  await app.register(healthRoutes)

  return app
}
```

> **Critical:** `buildApp` must NOT call `app.listen()`. The factory returns the app for testing via `fastify.inject()` without binding a port.
> [Source: architecture.md#Backend-Boundary]

### `src/server.ts` — Runtime Entry (Tests Never Import This)

```typescript
import { buildApp } from './app.js'

const app = await buildApp()

try {
  await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' })
  app.log.info(`Server listening on port ${process.env.PORT ?? 3000}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
```

> **CRITICAL:** Tests MUST only import `buildApp` from `app.ts`. Never import `server.ts` in any test file — it binds a real port.
> [Source: architecture.md#Backend-Boundary, architecture.md#Test-Boundaries]

### `src/plugins/error-handler.ts` — Global Error Handler

```typescript
import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyError } from 'fastify'
import { ZodError } from 'zod'

async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    // Log before responding (request.log carries reqId automatically)
    request.log.error({ err: error, userId: null }, 'Request error')

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'Validation error',
        code: 'VALIDATION_ERROR'
      })
    }

    // Fastify HTTP errors (from @fastify/sensible) have statusCode
    const statusCode = (error as FastifyError).statusCode ?? 500
    const message = statusCode < 500 ? error.message : 'Internal server error'
    const code = statusCode < 500 ? 'CLIENT_ERROR' : 'INTERNAL_ERROR'

    return reply.status(statusCode).send({ error: message, code })
  })
}

export const errorHandlerPlugin = fp(errorHandler)
```

> **Critical:** ALL errors MUST go through this handler. Never let raw Prisma errors, raw Zod errors, or Node.js errors reach the client.
> Never expose stack traces or internal paths. [Source: architecture.md#Decision-2.2, architecture.md#Backend-error-handling]

### `src/routes/health.routes.ts` — Health Check Endpoint

```typescript
import type { FastifyInstance } from 'fastify'

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async (_request, reply) => {
    return reply.status(200).send({
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  })
}
```

[Source: architecture.md#ARCH15, epics.md#Story-1.2-AC2]

### Logging Conventions (MUST Follow From Day One)

- ✅ Use `request.log` for ALL per-request operations — carries auto-generated `reqId`
- ✅ Use `app.log` ONLY for system-level events (server start, shutdown)
- ✅ Every operation log MUST include `userId: null` in v1 (field reserved for auth)
- ❌ NEVER use `console.log` anywhere in backend code
- ❌ NEVER use `app.log` for per-request operations (loses `reqId` traceability)

```typescript
// ✅ Correct — per-request log
request.log.info({ todoId: todo.id, userId: null }, 'Todo created')
request.log.error({ err, todoId: id, userId: null }, 'Todo operation failed')

// ✅ Correct — system-level log
app.log.info('Server listening on port 3000')

// ❌ Wrong — never do this
console.log('Something happened')
app.log.info({ todoId: id }, 'Todo created')  // Missing userId
```

[Source: architecture.md#ARCH24, architecture.md#ARCH25, architecture.md#Structured-logging]

### Error Response Shape (MUST Follow)

All API errors use `{ error: string, code?: string }` exclusively:
```json
{ "error": "Todo not found", "code": "TODO_NOT_FOUND" }
{ "error": "Title is required", "code": "VALIDATION_ERROR" }
{ "error": "Internal server error", "code": "INTERNAL_ERROR" }
```

- `error`: human-readable message (safe to display to users)
- `code`: machine-readable string for frontend programmatic handling
- ❌ NEVER expose stack traces, raw Prisma errors, internal paths
- ❌ NEVER use any other shape than `{ error, code }`

[Source: architecture.md#Decision-2.2, architecture.md#ARCH13]

### Environment Variables

**`backend/.env`** (gitignored, not committed):
```dotenv
PORT=3000
ALLOWED_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bmad_todo
```

**`backend/.env.test`** (gitignored, not committed):
```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bmad_todo_test
```

> Both `.env` files are gitignored. [Source: architecture.md#Decision-4.3]

### Project Structure Notes

After this story, the backend directory should look like:
```
backend/
├── package.json          ← updated with all dependencies and scripts
├── tsconfig.json         ← new: TypeScript compiler config
├── .env                  ← new: dev env vars (gitignored)
├── .env.test             ← new: test env vars (gitignored)
├── src/
│   ├── app.ts            ← new: Fastify instance factory
│   ├── server.ts         ← new: runtime entry point (never imported in tests)
│   ├── routes/
│   │   └── health.routes.ts  ← new: GET /health endpoint
│   ├── plugins/
│   │   └── error-handler.ts  ← new: global error handler plugin
│   ├── services/         ← stub dir (todo.service.ts in Epic 2)
│   ├── repositories/     ← stub dir (todo.repository.ts in Epic 2)
│   ├── schemas/          ← stub dir (todo.schema.ts, error.schema.ts in Epic 2)
│   └── types/            ← stub dir (index.ts in Epic 2)
└── tests/
    ├── unit/             ← stub dir (tests in Epic 2)
    └── integration/      ← stub dir (tests in Epic 2)
```

Prisma (`prisma/` directory, `schema.prisma`) is created in **Story 1.3**, not here.

[Source: architecture.md#Complete-Project-Directory-Structure]

### Anti-patterns to Avoid

- ❌ Do NOT install `prisma` or `@prisma/client` in this story — that is Story 1.3
- ❌ Do NOT call `app.listen()` in `app.ts` — factory pattern only; listen in `server.ts`
- ❌ Do NOT import `server.ts` in any test — only `app.ts`
- ❌ Do NOT use `console.log` — always `request.log` or `app.log`
- ❌ Do NOT expose raw error details to the client — use `{ error, code }` shape only
- ❌ Do NOT create a `tailwind.config.js` — not relevant to backend, but for completeness
- ❌ Do NOT use `app.log` for per-request operations — use `request.log`

[Source: architecture.md#Anti-patterns, architecture.md#Enforcement-Guidelines]

### References

- [Source: architecture.md#ARCH5] — Backend stack: Fastify V5, Pino, Zod, Prisma; V5-compatible plugin versions
- [Source: architecture.md#ARCH14] — CORS strategy: `@fastify/cors` reads `ALLOWED_ORIGIN` env var
- [Source: architecture.md#ARCH15] — Health check endpoint: `GET /health` → `{ status: "ok", timestamp: "<ISO-8601>" }`
- [Source: architecture.md#ARCH24] — Use `request.log` for per-request operations (carries `reqId`)
- [Source: architecture.md#ARCH25] — Every operation log must include `reqId` (auto), `userId: null`, `todoId`, and `msg`
- [Source: architecture.md#Decision-2.2] — Error envelope: `{ error, code }` exclusively
- [Source: architecture.md#Decision-4.3] — `.env` gitignored; `.env.example` committed
- [Source: architecture.md#Backend-Boundary] — `app.ts` factory; `server.ts` runtime entry (tests never import it)
- [Source: architecture.md#Fastify-V5-Ecosystem] — Plugin version floor table
- [Source: architecture.md#Complete-Project-Directory-Structure] — Full project layout
- [Source: epics.md#Story-1.2] — Acceptance criteria and user story

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
