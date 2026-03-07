# Story 2.1: Todo Repository & Service Layer

Status: done

## Story

As a developer,
I want a typed repository and service layer that encapsulates all todo data access and business logic,
So that all API route handlers can delegate to a testable, dependency-injected implementation without touching Prisma directly.

## Acceptance Criteria

1. **Given** `backend/src/repositories/todo.repository.ts`, **When** inspected, **Then** it exposes methods: `findAll()`, `findById(id)`, `create(data)`, `update(id, data)`, `softDelete(id)` — all using Prisma client, all `findMany`/`findFirst` calls include `where: { deletedAt: null }`.

2. **Given** `backend/src/services/todo.service.ts`, **When** inspected, **Then** it depends on `TodoRepository` via constructor injection (not importing Prisma directly) and exposes: `getAllTodos()`, `getTodoById(id)`, `createTodo(data)`, `toggleCompletion(id, completed)`, `deleteTodo(id)`.

3. **Given** `toggleCompletion(id, true)` is called on a currently active todo, **When** the service executes, **Then** it sets `doneAt` to the current timestamp and `completed` to `true` — via the repository `update` method only.

4. **Given** `toggleCompletion(id, false)` is called on a currently completed todo, **When** the service executes, **Then** it sets `doneAt` to `null` and `completed` to `false` — `updatedAt` is updated automatically by Prisma `@updatedAt` (not set manually).

5. **Given** `deleteTodo(id)` is called, **When** the service executes, **Then** it calls `repository.softDelete(id)` which sets `deletedAt` to the current timestamp — the record is never physically removed from the database.

6. **Given** `backend/tests/unit/todo.service.test.ts` and `todo.repository.test.ts`, **When** I run `npm test`, **Then** all unit tests pass with the Prisma client mocked — testing logic in isolation.

## Tasks / Subtasks

- [x] Task 1: Create TodoRepository class (AC: #1, #5)
  - [x] 1.1: Create `backend/src/repositories/todo.repository.ts` with typed Prisma-based methods
  - [x] 1.2: Implement `findAll()` — `prisma.todo.findMany({ where: { deletedAt: null } })`
  - [x] 1.3: Implement `findById(id)` — `prisma.todo.findFirst({ where: { id, deletedAt: null } })`
  - [x] 1.4: Implement `create(data)` — `prisma.todo.create({ data })`
  - [x] 1.5: Implement `update(id, data)` — `prisma.todo.update({ where: { id }, data })`
  - [x] 1.6: Implement `softDelete(id)` — `prisma.todo.update({ where: { id }, data: { deletedAt: new Date() } })`
- [x] Task 2: Create TodoService class (AC: #2, #3, #4, #5)
  - [x] 2.1: Create `backend/src/services/todo.service.ts` with constructor-injected TodoRepository
  - [x] 2.2: Implement `getAllTodos()` delegating to `repository.findAll()`
  - [x] 2.3: Implement `getTodoById(id)` delegating to `repository.findById(id)`, throwing NotFoundError if null
  - [x] 2.4: Implement `createTodo(data)` delegating to `repository.create(data)`
  - [x] 2.5: Implement `toggleCompletion(id, completed)` — set doneAt=now() if true, null if false; delegate to `repository.update`
  - [x] 2.6: Implement `deleteTodo(id)` — verify todo exists first, then delegate to `repository.softDelete(id)`
- [x] Task 3: Unit tests for repository (AC: #6)
  - [x] 3.1: Create `backend/tests/unit/todo.repository.test.ts` with mocked Prisma client
  - [x] 3.2: Test `findAll()` returns all non-deleted todos
  - [x] 3.3: Test `findById()` returns null for nonexistent/deleted
  - [x] 3.4: Test `softDelete()` calls Prisma update with deletedAt timestamp
- [x] Task 4: Unit tests for service (AC: #6)
  - [x] 4.1: Create `backend/tests/unit/todo.service.test.ts` with mocked repository
  - [x] 4.2: Test `toggleCompletion(id, true)` sets doneAt to a Date
  - [x] 4.3: Test `toggleCompletion(id, false)` sets doneAt to null
  - [x] 4.4: Test `getTodoById()` throws when not found
  - [x] 4.5: Test `deleteTodo()` throws when not found

## Dev Notes

### Architecture Requirements

- **3-layer architecture**: route handlers → service → repository (ARCH pattern from architecture.md)
- **Repository** only uses Prisma client — exposes typed data-access methods. Never contains business logic.
- **Service** only uses the repository (constructor-injected) — contains all business logic. Never imports Prisma directly.
- **Soft-delete**: `deletedAt: null` filter in EVERY `findMany`/`findFirst` call (ARCH9)
- **`doneAt` transitions**: managed ONLY in `todo.service.ts` (ARCH23). Set to `new Date()` on `false→true`, set to `null` on `true→false`. `updatedAt` is handled automatically by Prisma `@updatedAt`.
- **`userId: null`** always in v1 (ARCH10) — never read or written in service layer.

### Project Structure

```
backend/
  src/
    repositories/
      todo.repository.ts    ← CREATE THIS
    services/
      todo.service.ts       ← CREATE THIS
    lib/
      prisma.ts             ← EXISTS (singleton PrismaClient, use this)
    generated/
      prisma/               ← EXISTS (generated Prisma types)
  tests/
    unit/
      todo.repository.test.ts   ← CREATE THIS
      todo.service.test.ts      ← CREATE THIS
```

### Prisma Client

The singleton is exported from `backend/src/lib/prisma.ts`:
```ts
import { prisma } from '../lib/prisma.js'
```

The `Todo` type is from `../generated/prisma/index.js`. All 9 fields:
`id, title, description, completed, userId, createdAt, doneAt, updatedAt, deletedAt`

### Testing Pattern

Use Vitest `vi.mock` / `vi.spyOn` to mock Prisma calls in repository tests. In service tests, mock the repository entirely. Tests run with `npm test` in `backend/`.

**Repository test pattern**: Mock `prisma` module, assert Prisma client methods were called with correct args.

**Service test pattern**: Create a mock `TodoRepository` object, pass to service constructor, verify delegation + business logic.

### Error Handling Pattern

When `getTodoById` or `deleteTodo` can't find the todo, throw a Fastify-compatible HTTP error. Use `@fastify/sensible` HTTP errors:
```ts
import createError from '@fastify/sensible'
// or throw httpErrors.notFound('Todo not found')
```

Since the service doesn't have access to Fastify directly, use a plain `Error` with a special code that the route handler recognizes, OR use `import { createError } from '@fastify/sensible'`. 

**Recommended**: Create a simple custom error class:
```ts
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}
```

Route handlers will check for `NotFoundError` and return 404.

### References

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Decisions 1.1, 1.2, 1.3, 2.1, 2.2
- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 2.1 acceptance criteria
- Prisma schema: `backend/prisma/schema.prisma`
- Existing lib: `backend/src/lib/prisma.ts`

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

- Implemented TodoRepository with all 5 methods; all findMany/findFirst include `where: { deletedAt: null }` (ARCH9 compliant)
- Implemented TodoService with constructor injection; doneAt transitions managed exclusively in service (ARCH23 compliant)
- Created NotFoundError custom error class for clean error propagation to route handlers
- 18 unit tests pass (8 repository + 10 service); Prisma fully mocked in all unit tests
- All 57 backend tests pass with zero regressions

### File List

- backend/src/repositories/todo.repository.ts
- backend/src/services/todo.service.ts
- backend/src/lib/errors.ts
- backend/tests/unit/todo.repository.test.ts
- backend/tests/unit/todo.service.test.ts
