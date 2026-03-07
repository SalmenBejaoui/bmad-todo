# Story 2.5: Delete Todo API

Status: done

## Story

As an API consumer,
I want to soft-delete a todo via a DELETE request,
So that users can remove tasks while the server preserves the deletion record for audit and observability purposes.

## Acceptance Criteria

1. **Given** an existing todo, **When** I send `DELETE /todos/:id`, **Then** I receive HTTP 204 with no response body.

2. **Given** a successful DELETE, **When** I subsequently send `GET /todos`, **Then** the deleted todo does not appear in the list (`deletedAt: null` filter applied).

3. **Given** a successful DELETE, **When** I subsequently send `GET /todos/:id`, **Then** I receive HTTP 404 — the record is excluded by the `deletedAt: null` filter.

4. **Given** a DELETE request for a non-existent or already-deleted todo, **When** I send the request, **Then** I receive HTTP 404 with `{ "error": "Todo not found", "code": "TODO_NOT_FOUND" }`.

5. **Given** a successful `DELETE /todos/:id`, **When** the operation completes, **Then** `request.log.info({ todoId: id, userId: null }, 'Todo soft-deleted')` is emitted.

6. **Given** a server-side error occurs during the DELETE operation, **When** the global error handler catches it, **Then** `request.log.error({ err, todoId: id, userId: null }, 'Todo operation failed')` is emitted and the client receives `{ "error": "Internal server error", "code": "INTERNAL_ERROR" }`.

7. **Given** `backend/tests/integration/todos.delete.test.ts`, **When** I run `npm test`, **Then** integration tests cover: 204 success, deleted todo absent from list (mocked), deleted todo 404 on GET /:id (mocked), double-delete 404 — all pass.

8. **Given** `npm test` is run across all backend test files, **When** the coverage report is generated, **Then** meaningful code coverage across `routes/`, `services/`, and `repositories/` is ≥70%.

## Tasks / Subtasks

- [x] Task 1: Add DELETE /todos/:id route (AC: #1, #2, #3, #4, #5, #6)
  - [x] 1.1: Add `DELETE /todos/:id` handler in `todo.routes.ts`
  - [x] 1.2: Use `TodoParamsSchema` for params validation (already defined in `todo.schemas.ts`)
  - [x] 1.3: Call `service.deleteTodo(id)` — returns 204 no body
  - [x] 1.4: Catch `NotFoundError` → 404 with `{ error: "Todo not found", code: "TODO_NOT_FOUND" }`
  - [x] 1.5: Catch unknown errors → `request.log.error({ err, todoId: id, userId: null }, 'Todo operation failed')` then re-throw
  - [x] 1.6: Add structured log: `request.log.info({ todoId: id, userId: null }, 'Todo soft-deleted')`
  - [x] 1.7: Return 204 with no body — use `reply.status(204).send()`
- [x] Task 2: Integration tests (AC: #7)
  - [x] 2.1: Create `backend/tests/integration/todos.delete.test.ts`
  - [x] 2.2: Test successful soft-delete → 204, no body
  - [x] 2.3: Test deleted todo not in list — mock `getAllTodos` returning `[]`
  - [x] 2.4: Test deleted todo 404 on GET /:id — mock `getTodoById` throwing `NotFoundError`
  - [x] 2.5: Test double-delete (already deleted) → 404 `{ code: "TODO_NOT_FOUND" }`

## Dev Notes

### Architecture Requirements

- DELETE returns **204 with no response body** — `reply.status(204).send()` only
- Soft-delete logic lives in `todo.service.ts::deleteTodo()` which calls `repository.softDelete(id)` (sets `deletedAt = new Date()`)
- After soft-delete, `findAll()` and `findById()` both filter `deletedAt: null` — so deleted todos are automatically excluded (ARCH9)
- Use `TodoParamsSchema` for `params` schema (already defined)
- `request.log` (not `app.log`) for ARCH24 compliance
- `userId: null` on all log entries — populated when auth is implemented

### Response Schema Note

- 204 has NO response body — do NOT define a 204 response schema in Fastify (Fastify will skip serialization automatically with `.send()`)
- Only define 404 schema in the route options

### References

- `service.deleteTodo(id: string): Promise<void>` — throws `NotFoundError` if todo not found
- `TodoParamsSchema` and `TodoParams` type already in `backend/src/schemas/todo.schemas.ts`
- `NotFoundError` in `backend/src/lib/errors.js`
- Architecture: ARCH9 (soft-delete filter), ARCH24/ARCH25 (request.log + userId: null)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

- All 5 integration tests pass (78 total)
- DELETE /todos/:id fully implemented: 204 no-body, soft-delete via service, NotFoundError → 404, operation-level error log, then re-throw for global handler

### File List

- `backend/src/routes/todo.routes.ts` (modified — added DELETE handler)
- `backend/tests/integration/todos.delete.test.ts` (created)
