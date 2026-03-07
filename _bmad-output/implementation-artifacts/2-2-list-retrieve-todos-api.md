# Story 2.2: List & Retrieve Todos API

Status: done

## Story

As an API consumer,
I want to retrieve all active todos and fetch a single todo by ID,
So that I can build a UI that displays the complete task list and individual task details.

## Acceptance Criteria

1. **Given** the backend is running, **When** I send `GET /todos`, **Then** I receive HTTP 200 with an array of all non-deleted todo objects; if no todos exist, the response is an empty array `[]`.

2. **Given** a todo exists with id `abc-123`, **When** I send `GET /todos/abc-123`, **Then** I receive HTTP 200 with the full todo object including all 9 fields.

3. **Given** no todo exists with a given ID, **When** I send `GET /todos/nonexistent-id`, **Then** I receive HTTP 404 with `{ "error": "Todo not found", "code": "TODO_NOT_FOUND" }`.

4. **Given** any successful `GET /todos` or `GET /todos/:id` request, **When** inspecting response field types, **Then** all timestamps are ISO 8601 strings — never Unix timestamps — and `id` is a UUID string.

5. **Given** `backend/tests/integration/todos.get.test.ts`, **When** I run `npm test`, **Then** integration tests using `fastify.inject()` cover: empty list, populated list, get by valid ID, get by invalid ID — all pass without starting an HTTP server.

## Tasks / Subtasks

- [x] Task 1: Create Zod schemas for Todo responses (AC: #4)
  - [x] 1.1: Create `backend/src/schemas/todo.schemas.ts` with `TodoSchema` (all 9 fields, datetime serialised as string)
  - [x] 1.2: Add `TodoListResponseSchema` = `z.array(TodoSchema)`
  - [x] 1.3: Add error schema `ErrorResponseSchema = z.object({ error: z.string(), code: z.string().optional() })`
- [x] Task 2: Create todos routes plugin (AC: #1, #2, #3)
  - [x] 2.1: Create `backend/src/routes/todo.routes.ts` as a Fastify plugin
  - [x] 2.2: Implement `GET /todos` — calls `service.getAllTodos()`, returns 200 with array
  - [x] 2.3: Implement `GET /todos/:id` — calls `service.getTodoById(id)`, catches `NotFoundError` → 404
  - [x] 2.4: Register `todo.routes.ts` in `app.ts`
- [x] Task 3: Integration tests (AC: #5)
  - [x] 3.1: Create `backend/tests/integration/todos.get.test.ts`
  - [x] 3.2: Test `GET /todos` returns 200 with empty array
  - [x] 3.3: Test `GET /todos` returns 200 with seeded todos
  - [x] 3.4: Test `GET /todos/:id` returns 200 with full todo object
  - [x] 3.5: Test `GET /todos/:id` returns 404 `{ error: "Todo not found", code: "TODO_NOT_FOUND" }` for nonexistent ID

## Dev Notes

### Architecture Requirements

- Route handlers are **thin** — no business logic, no Prisma, only call service methods (ARCH pattern)
- `TodoRepository` and `TodoService` are constructed once and shared via Fastify plugin context (DI pattern)
- `GET /todos` always filters `deletedAt: null` (handled by service → repository)
- All timestamps serialised as ISO 8601 strings (ARCH data model)
- Error envelope: `{ error: string, code?: string }` for ALL error responses (Decision 2.2)
- For `NotFoundError` from service → route catches it → returns 404 with `code: "TODO_NOT_FOUND"`

### Dependency Injection Pattern

The `TodoRepository` and `TodoService` should be instantiated once and passed into the route plugin. In Fastify, use plugin decorators or pass them as plugin options:

```ts
// In app.ts:
import { TodoRepository } from './repositories/todo.repository.js'
import { TodoService } from './services/todo.service.js'
import { prisma } from './lib/prisma.js'
import todoRoutes from './routes/todo.routes.js'

const repository = new TodoRepository(prisma)
const service = new TodoService(repository)
await app.register(todoRoutes, { service })
```

Route plugin receives `service` as an option:
```ts
export default async function todoRoutes(app: FastifyInstance, options: { service: TodoService }) {
  // ...
}
```

### Zod Schema for Response

Prisma returns `Date` objects for timestamps. Fastify/Zod serialize them as ISO strings when using `fastify-type-provider-zod` serializer compilers. Use `z.coerce.date()` or keep as `z.date()` — Zod serializes dates as ISO strings through the `serializerCompiler`.

**Important**: The Zod schema is the response shape contract. Using `z.date()` for timestamp fields works with the type provider to produce ISO 8601 strings in the JSON response.

### Integration Test Pattern

Use `fastify.inject()` (no real HTTP server):
```ts
import { buildApp } from '../../src/app.js'
const app = await buildApp()
const res = await app.inject({ method: 'GET', url: '/todos' })
expect(res.statusCode).toBe(200)
```

For tests that need seed data, mock the service or use the test database. Prefer **mocking the service** at the app level or using a real test DB with seeded data. Given that integration tests in this project use `fastify.inject()`, mock the service layer for isolation.

### References

- Story 2.1 (done): `backend/src/repositories/todo.repository.ts`, `backend/src/services/todo.service.ts`, `backend/src/lib/errors.ts`
- Existing app: `backend/src/app.ts` (registers plugins — add `todoRoutes` here)
- Error handler: `backend/src/plugins/error-handler.ts` (handles validation errors and 5xx globally)
- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Decision 2.1, 2.2, Sec "API Endpoints"

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

- Created `todo.schemas.ts` with `TodoSchema`, `TodoListResponseSchema`, plus request schemas for future stories
- Created `todo.routes.ts` Fastify plugin with GET /todos and GET /todos/:id; NotFoundError maps to 404 with TODO_NOT_FOUND
- Updated `app.ts` to accept `BuildAppOptions.todoService` override for test isolation (clean DI pattern)
- 6 integration tests pass using `fastify.inject()` with mocked service; timestamps verified as ISO 8601
- All 63 backend tests pass with zero regressions

### File List

- backend/src/schemas/todo.schemas.ts
- backend/src/routes/todo.routes.ts
- backend/src/app.ts
- backend/tests/integration/todos.get.test.ts
