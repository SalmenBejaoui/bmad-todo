# Story 2.3: Create Todo API

Status: done

## Story

As an API consumer,
I want to create a new todo item by posting a title and optional description,
So that users can persist new tasks to the database with a creation timestamp and all required fields initialised.

## Acceptance Criteria

1. **Given** a valid request body `{ "title": "Buy milk" }`, **When** I send `POST /todos`, **Then** I receive HTTP 201 with the created todo object containing: a UUID `id`, `title: "Buy milk"`, `description: null`, `completed: false`, `userId: null`, a valid ISO 8601 `createdAt`, `doneAt: null`, a valid ISO 8601 `updatedAt`, `deletedAt: null`.

2. **Given** a request body `{ "title": "Buy milk", "description": "2% please" }`, **When** I send `POST /todos`, **Then** I receive HTTP 201 with the created todo including `description: "2% please"`.

3. **Given** a request body with an empty or missing `title`, **When** I send `POST /todos`, **Then** I receive HTTP 400 with `{ "error": "Title is required", "code": "VALIDATION_ERROR" }`.

4. **Given** a successful `POST /todos`, **When** the operation completes, **Then** `request.log.info({ todoId: todo.id, userId: null }, 'Todo created')` is emitted — carrying the auto-generated `reqId` from Fastify.

5. **Given** `backend/tests/integration/todos.post.test.ts`, **When** I run `npm test`, **Then** integration tests cover: valid create with title only, valid create with description, missing title 400, empty title 400 — all pass.

## Tasks / Subtasks

- [x] Task 1: Add POST /todos route (AC: #1, #2, #3, #4)
  - [x] 1.1: Add `POST /todos` handler in `todo.routes.ts`
  - [x] 1.2: Use `CreateTodoBodySchema` for body validation (already defined in `todo.schemas.ts`)
  - [x] 1.3: Call `service.createTodo({ title, description })` and return 201 with created todo
  - [x] 1.4: Add structured log: `request.log.info({ todoId: todo.id, userId: null }, 'Todo created')`
- [x] Task 2: Integration tests (AC: #5)
  - [x] 2.1: Create `backend/tests/integration/todos.post.test.ts`
  - [x] 2.2: Test valid create with title only → 201 + full todo object + all fields present
  - [x] 2.3: Test valid create with title + description → 201 + description in response
  - [x] 2.4: Test missing title → 400 `{ error: ..., code: "VALIDATION_ERROR" }`
  - [x] 2.5: Test empty string title → 400 `{ error: ..., code: "VALIDATION_ERROR" }`

## Dev Notes

### Architecture Requirements

- Route is thin — only validates body, calls `service.createTodo()`, logs, returns 201
- The `CreateTodoBodySchema` is already in `backend/src/schemas/todo.schemas.ts` with `z.string().min(1, 'Title is required')`
- Logging MUST use `request.log` (not `app.log`) so Fastify's auto-generated `reqId` is included (ARCH24, ARCH25)
- Log entry: `request.log.info({ todoId: todo.id, userId: null }, 'Todo created')` (ARCH25)
- Validation errors are caught by the global error handler (`errorHandlerPlugin`) which returns `{ error: ..., code: "VALIDATION_ERROR" }` with 400 — no special handling needed

### Zod Validation for POST Body

`CreateTodoBodySchema` validates:
- `title: z.string().min(1, 'Title is required')` — non-empty string required
- `description: z.string().optional().nullable()` — optional

When Zod validation fails, Fastify's error handler (registered in `errorHandlerPlugin`) catches it and returns:
```json
{ "error": "Title is required", "code": "VALIDATION_ERROR" }
```

### References

- Story 2.2 (done): `backend/src/routes/todo.routes.ts` — extend existing plugin
- `CreateTodoBodySchema` already defined in `backend/src/schemas/todo.schemas.ts`
- Architecture: ARCH24, ARCH25 (structured logging via `request.log`), Decision 2.2 (error envelope)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

- Added POST /todos to `todo.routes.ts` with `CreateTodoBodySchema` validation
- Structured log uses `request.log.info({ todoId, userId: null }, 'Todo created')` per ARCH24/ARCH25
- Validation errors handled by global error-handler plugin → `{ error: ..., code: "VALIDATION_ERROR" }`
- 5 integration tests cover all ACs; `service.createTodo` not called on invalid input confirmed
- All 68 backend tests pass with zero regressions

### File List

- backend/src/routes/todo.routes.ts
- backend/tests/integration/todos.post.test.ts
