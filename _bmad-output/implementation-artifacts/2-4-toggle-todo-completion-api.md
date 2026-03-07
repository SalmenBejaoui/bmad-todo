# Story 2.4: Toggle Todo Completion API

Status: done

## Story

As an API consumer,
I want to toggle a todo's completion status via a PATCH request,
So that users can mark tasks as done or active, with the server managing all timestamp transitions correctly.

## Acceptance Criteria

1. **Given** an active todo (`completed: false`), **When** I send `PATCH /todos/:id` with `{ "completed": true }`, **Then** I receive HTTP 200 with the updated todo: `completed: true`, `doneAt` set to the current ISO 8601 timestamp, `updatedAt` updated — `doneAt` is set by the service layer, never the route handler.

2. **Given** a completed todo (`completed: true`), **When** I send `PATCH /todos/:id` with `{ "completed": false }`, **Then** I receive HTTP 200 with the updated todo: `completed: false`, `doneAt: null`, `updatedAt` updated.

3. **Given** a PATCH request for a non-existent or soft-deleted todo, **When** I send the request, **Then** I receive HTTP 404 with `{ "error": "Todo not found", "code": "TODO_NOT_FOUND" }`.

4. **Given** a PATCH request with a missing or invalid `completed` field, **When** I send the request, **Then** I receive HTTP 400 with `{ "error": "...", "code": "VALIDATION_ERROR" }`.

5. **Given** a successful `PATCH /todos/:id`, **When** the operation completes, **Then** `request.log.info({ todoId: id, userId: null, completed }, 'Todo completion updated')` is emitted with the new completion state.

6. **Given** `backend/tests/integration/todos.patch.test.ts`, **When** I run `npm test`, **Then** integration tests cover: toggle to complete (doneAt set), toggle to active (doneAt null), not-found 404, invalid body 400 — all pass.

## Tasks / Subtasks

- [x] Task 1: Add PATCH /todos/:id route (AC: #1, #2, #3, #4, #5)
  - [x] 1.1: Add `PATCH /todos/:id` handler in `todo.routes.ts`
  - [x] 1.2: Use `ToggleTodoBodySchema` for body validation (already defined in `todo.schemas.ts`)
  - [x] 1.3: Call `service.toggleCompletion(id, completed)` — service handles doneAt logic (ARCH23)
  - [x] 1.4: Catch `NotFoundError` → 404 with `{ error: "Todo not found", code: "TODO_NOT_FOUND" }`
  - [x] 1.5: Add structured log: `request.log.info({ todoId: id, userId: null, completed }, 'Todo completion updated')`
- [x] Task 2: Integration tests (AC: #6)
  - [x] 2.1: Create `backend/tests/integration/todos.patch.test.ts`
  - [x] 2.2: Test toggle to complete → 200, completed:true, doneAt is ISO string
  - [x] 2.3: Test toggle to active → 200, completed:false, doneAt:null
  - [x] 2.4: Test non-existent todo → 404 `{ code: "TODO_NOT_FOUND" }`
  - [x] 2.5: Test invalid/missing `completed` field → 400 `{ code: "VALIDATION_ERROR" }`

## Dev Notes

### Architecture Requirements

- `doneAt` transitions are managed EXCLUSIVELY in `todo.service.ts::toggleCompletion()` (ARCH23)
- The route handler MUST NOT set `doneAt` — it only passes `completed` (boolean) to the service
- Use `ToggleTodoBodySchema` from `todo.schemas.ts`: `z.object({ completed: z.boolean({ required_error: 'completed is required' }) })`
- `request.log` (not `app.log`) for ARCH24 compliance

### References

- Story 2.3 (done): `todo.routes.ts` already has GET and POST handlers — extend it
- `ToggleTodoBodySchema` and `ToggleTodoBody` type already in `backend/src/schemas/todo.schemas.ts`
- Service method: `service.toggleCompletion(id: string, completed: boolean): Promise<Todo>`
- Architecture: ARCH23 (doneAt in service), ARCH24/ARCH25 (request.log + userId: null)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

- All 5 integration tests pass (73 total)
- PATCH /todos/:id fully implemented with typed generics, doneAt managed in service (ARCH23), structured logging (ARCH24/25)

### File List

- `backend/src/routes/todo.routes.ts` (modified — added PATCH handler)
- `backend/tests/integration/todos.patch.test.ts` (created)
