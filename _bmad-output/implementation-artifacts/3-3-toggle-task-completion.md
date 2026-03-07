# Story 3-3: Toggle Task Completion

## Status: in-progress

## Story

As a user,
I want to click a checkbox to mark a task as done or active with immediate visual feedback,
So that I can track my progress through my task list without waiting for server confirmation.

## Acceptance Criteria

**Given** an active task row in the list,
**When** I click or tap the checkbox,
**Then** the title gets `line-through` decoration and `text-muted` colour, the checkbox fills with the `accent` colour, and the task moves to the "Done · n" section — all within ~150ms using `motion-safe:transition-all motion-safe:duration-150 motion-safe:ease-in-out`.

**Given** a completed task row in the Done section,
**When** I click or tap the checkbox,
**Then** the strikethrough and muted colour are removed, the checkbox empties, and the task moves back to the "Active · n" section.

**Given** `PATCH /todos/:id` fails,
**When** `onError` fires,
**Then** the task reverts to its previous section and state, and a Sonner error toast appears: "Couldn't update. Try again."

**Given** the Active and Done section label counts,
**When** a task is toggled in either direction,
**Then** the counts update immediately as part of the optimistic update.

**Given** `TaskRow` and `useToggleTodo` hook,
**When** Vitest tests run,
**Then** tests cover: optimistic complete, optimistic revert to active, rollback on error — all pass.

## Tasks

### Task 1: Create `useToggleTodo` hook
- File: `frontend/src/hooks/useToggleTodo.ts`
- `useMutation` calling `apiClient.patch<Todo>('/todos/:id', { completed })`
- Optimistic update: snapshot cache, toggle the target todo in cache
- `onError`: restore snapshot, call `options?.onError?.()`
- `onSettled`: invalidate `['todos']`

### Task 2: Wire `TaskRow` checkbox to `useToggleTodo`
- `TaskRow` already has `onToggle?: () => void` prop
- `TaskList` passes `onToggle` to each `TaskRow`
- Wire in `TaskList`: call `useToggleTodo` per todo, pass `() => toggleMutate(...)` to `onToggle`
- Actually: hoist `useToggleTodo` to a wrapper or use a single `useToggleTodo` in `TaskList` that accepts the todo id

### Task 3: Add 150ms transition classes
- `TaskRow` already applies `.line-through .text-text-muted` for completed tasks
- Add `motion-safe:transition-all motion-safe:duration-150 motion-safe:ease-in-out` to title span

### Task 4: Write tests
- `useToggleTodo.test.ts`: optimistic complete, optimistic revert, rollback on error, onError callback
- Update `TaskRow.test.tsx`: test onToggle fires when checkbox clicked
- Update `TaskList.test.tsx` or add integration: checkbox triggers mutation

### Task 5: Run tests + build

## Dev Notes

- `apiClient.patch<Todo>('/todos/${id}', { completed: !todo.completed })` — toggle the opposite
- Optimistic: find todo by id in cache, set `completed: !old.completed`, also set `doneAt`
- `TaskList` should call `useToggleTodo({ onError: () => toast.error("Couldn't update. Try again.") })`
- Each `TaskRow` receives `onToggle={() => toggleTodo({ id: todo.id, completed: !todo.completed })}`
