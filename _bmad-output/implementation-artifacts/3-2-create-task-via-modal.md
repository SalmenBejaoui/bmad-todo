# Story 3.2: Create Task via Modal

Status: done

## Story

As a user,
I want to open a creation panel, enter a required title and optional description, and submit to see the task appear instantly in the Active section,
so that I can capture tasks with zero friction and immediate feedback.

## Acceptance Criteria

1. **Given** the app is loaded, **When** I click or tap "+ Add task" in `AppHeader`, **Then** a `Dialog` (desktop ≥ md) or `Sheet` (mobile < md) opens with the title `Input` field auto-focused — no click required to begin typing.

2. **Given** the creation modal is open with the title field empty, **When** I inspect the "Add task" button, **Then** it is disabled.

3. **Given** the creation modal is open with at least one character in the title field, **When** I press Enter in the title field or click "Add task", **Then** the modal closes immediately and the new task appears at the top of the Active section before the API call returns (optimistic update via `useCreateTodo` `onMutate`).

4. **Given** an optimistic task has been added to the list, **When** `POST /todos` succeeds, **Then** the task is confirmed in place — no visible change to the user.

5. **Given** `POST /todos` fails, **When** `onError` fires, **Then** the optimistic task is removed from the list, the modal reopens with the entered title and description preserved, and a Sonner error toast appears: "Couldn't save your task. Try again."

6. **Given** I press Escape or click the backdrop, **When** the modal is open, **Then** it closes without submitting and no task is added.

7. **Given** `AddTaskModal` and `useCreateTodo` hook, **When** Vitest tests run, **Then** tests cover: submit with title only, submit with title + description, disabled state when empty, error rollback with input preservation — all pass.

## Tasks / Subtasks

- [x] Task 1: Create `useCreateTodo` mutation hook (AC: #3, #4, #5)
  - [x] 1.1: Create `frontend/src/hooks/useCreateTodo.ts`
  - [x] 1.2: `useMutation` with `mutationFn: (data: { title: string; description?: string }) => apiClient.post<Todo>('/todos', data)`
  - [x] 1.3: `onMutate`: snapshot `queryClient.getQueryData(['todos'])`, optimistically prepend new todo to cache using `queryClient.setQueryData`, return `{ previousTodos, pendingTodo }`
  - [x] 1.4: Optimistic todo has temporary `id: 'pending-' + Date.now()`, `completed: false`, `createdAt: new Date().toISOString()`, all other fields null/default
  - [x] 1.5: `onError`: restore snapshot via `queryClient.setQueryData(['todos'], context.previousTodos)`, call `options.onError?.(err, vars, context)` to allow modal to reopen with preserved input
  - [x] 1.6: `onSettled`: `queryClient.invalidateQueries({ queryKey: ['todos'] })` to sync server state
  - [x] 1.7: Export `useCreateTodo(options?: { onError?: (err, vars, context) => void })` — accept callbacks so AddTaskModal can reopen on error

- [x] Task 2: Create `AddTaskModal` component (AC: #1, #2, #3, #5, #6)
  - [x] 2.1: Create `frontend/src/components/AddTaskModal.tsx`
  - [x] 2.2: Use `@radix-ui/react-dialog` for Dialog (desktop) — already installed
  - [x] 2.3: Detect viewport: use `window.matchMedia('(min-width: 768px)')` or a `useMediaQuery` hook to choose Dialog vs Sheet. For simplicity in MVP, use `@radix-ui/react-dialog` for both breakpoints (Sheet pattern deferred to Story 3.6 polish if needed)
  - [x] 2.4: Props: `open: boolean`, `onOpenChange: (open: boolean) => void`
  - [x] 2.5: Title `input` field: `autoFocus`, `required`, controlled with local `title` state
  - [x] 2.6: Description `textarea` field: optional, controlled with local `description` state
  - [x] 2.7: "Add task" button: disabled when `title.trim() === ''`
  - [x] 2.8: Submit on Enter key in title field when title non-empty (use `onKeyDown`)
  - [x] 2.9: On submit: call `mutate({ title: title.trim(), description: description.trim() || undefined })`, close modal immediately (set `onOpenChange(false)`)
  - [x] 2.10: On error callback from `useCreateTodo`: preserve `title` and `description` state, reopen modal (`onOpenChange(true)`), show Sonner toast "Couldn't save your task. Try again."
  - [x] 2.11: On close/Escape: reset `title` and `description` to `''` only if close was NOT triggered by an error
  - [x] 2.12: Import and use `toast` from `sonner` for error notification

- [x] Task 3: Install Sonner toast provider (AC: #5)
  - [x] 3.1: Sonner is already in `package.json` dependencies (`"sonner": "^2.0.7"`)
  - [x] 3.2: Add `<Toaster />` from `sonner` to `main.tsx` (or `App.tsx`) so toasts are globally rendered
  - [x] 3.3: Position: `position="bottom-right"` (desktop default)

- [x] Task 4: Wire `AppHeader` add-task callback to `AddTaskModal` in `App.tsx` (AC: #1)
  - [x] 4.1: Add `isAddModalOpen` state to `App.tsx` (useState)
  - [x] 4.2: Pass `onAddTask={() => setIsAddModalOpen(true)}` to `<AppHeader />`
  - [x] 4.3: Render `<AddTaskModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />` in `App.tsx`

- [x] Task 5: Write unit tests (AC: #7)
  - [x] 5.1: Create `frontend/src/components/AddTaskModal.test.tsx`
  - [x] 5.2: Test: "Add task" submit button is disabled when title is empty
  - [x] 5.3: Test: submitting with a title calls mutate with the title (mock `useCreateTodo`)
  - [x] 5.4: Test: submitting with title + description calls mutate with both values
  - [x] 5.5: Test: on error, modal stays/reopens with input values preserved, toast called
  - [x] 5.6: Create `frontend/src/hooks/useCreateTodo.test.ts`
  - [x] 5.7: Test: optimistic todo prepended to cache on `onMutate`
  - [x] 5.8: Test: cache rolled back on `onError`
  - [x] 5.9: Test: `invalidateQueries` called on `onSettled`

- [x] Task 6: Run all tests and build
  - [x] 6.1: Run `cd frontend && npm test` — all tests pass (no regressions)
  - [x] 6.2: Run `cd frontend && npm run build` — no TypeScript errors

## Dev Notes

### Architecture Requirements

- **TanStack Query v5 optimistic mutation pattern** — `onMutate` → `onError` → `onSettled`
- **Query key**: `['todos']` — consistent with `useTodos.ts`
- `queryClient.cancelQueries({ queryKey: ['todos'] })` should be called in `onMutate` before snapshot to prevent race conditions
- The optimistic todo needs a valid shape matching `Todo` interface. Use `Date.now()` for temporary id prefix so it never collides with real UUIDs

### Optimistic Pattern (exact implementation):

```ts
// useCreateTodo.ts
onMutate: async (newTodo) => {
  await queryClient.cancelQueries({ queryKey: ['todos'] })
  const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])
  const optimisticTodo: Todo = {
    id: `pending-${Date.now()}`,
    title: newTodo.title,
    description: newTodo.description ?? null,
    completed: false,
    userId: null,
    createdAt: new Date().toISOString(),
    doneAt: null,
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  }
  queryClient.setQueryData<Todo[]>(['todos'], (old) => [optimisticTodo, ...(old ?? [])])
  return { previousTodos, optimisticTodo }
},
onError: (_err, _vars, context) => {
  queryClient.setQueryData(['todos'], context?.previousTodos)
  options?.onError?.()
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ['todos'] })
},
```

### Dialog Implementation (Radix UI)

`@radix-ui/react-dialog` is already installed. Pattern:

```tsx
import * as Dialog from '@radix-ui/react-dialog'

<Dialog.Root open={open} onOpenChange={onOpenChange}>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
    <Dialog.Content
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface rounded-lg p-6 shadow-xl w-full max-w-md z-50 focus:outline-none"
    >
      <Dialog.Title className="text-base font-semibold text-text-primary mb-4">
        Add task
      </Dialog.Title>
      {/* form content */}
      <Dialog.Close asChild>
        <button aria-label="Close">...</button>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

- Radix Dialog handles Escape key close and backdrop click automatically
- `autoFocus` on the title input triggers on Dialog open

### Sonner Toast

```tsx
import { toast } from 'sonner'
// In onError:
toast.error("Couldn't save your task. Try again.")
```

```tsx
// In main.tsx or App.tsx:
import { Toaster } from 'sonner'
// Render: <Toaster position="bottom-right" />
```

### Input Preservation on Error

State management approach:
- `title` and `description` are local state in `AddTaskModal`
- On successful submit: reset to `''` after mutation call
- On error: do NOT reset; instead reopen the modal keeping current state
- Use an `isErrorReopen` ref or pass `onError` callback from modal to hook

```tsx
// In AddTaskModal:
const { mutate } = useCreateTodo({
  onError: () => {
    onOpenChange(true)   // reopen the modal
    toast.error("Couldn't save your task. Try again.")
    // title and description state are preserved (not reset)
  }
})

const handleSubmit = () => {
  mutate({ title: title.trim(), description: description.trim() || undefined })
  onOpenChange(false)   // close immediately (optimistic)
  // note: do NOT reset title/description here — reset on successful close
}

// reset only when modal is closed intentionally (not error reopen):
const handleOpenChange = (newOpen: boolean) => {
  if (!newOpen) {
    // Only reset if not an error case — use a ref flag
    setTitle('')
    setDescription('')
  }
  onOpenChange(newOpen)
}
```

The cleanest approach: use a `skipReset` ref in the component, set it `true` before `onOpenChange(false)` in the error callback, and in `handleOpenChange`, check `skipReset.current` before resetting.

### Testing AddTaskModal

Mock `useCreateTodo`:
```ts
vi.mock('../hooks/useCreateTodo', () => ({
  useCreateTodo: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
}))
```

Use `@testing-library/user-event` for typing and pressing Enter.

### Files Already Existing

| File | Status |
|---|---|
| `frontend/src/App.tsx` | EXISTS — needs `isAddModalOpen` state and modal render |
| `frontend/src/components/AppHeader.tsx` | EXISTS — `onAddTask` prop already defined |
| `frontend/src/main.tsx` | EXISTS — needs `<Toaster />` added |

### Source Traceability

- Optimistic mutation pattern: [Source: planning-artifacts/architecture.md#Frontend Architecture Decision 3.1]
- Dialog/Sheet for creation: [Source: planning-artifacts/ux-design-specification.md#Experience Mechanics "Task Creation"]
- Input auto-focus: [Source: planning-artifacts/epics.md#Story 3.2 AC #1]
- Disabled button when empty: [Source: planning-artifacts/epics.md#Story 3.2 AC #2]
- onError rollback + modal reopen: [Source: planning-artifacts/epics.md#Story 3.2 AC #5]
- Sonner toast text: [Source: planning-artifacts/epics.md#Story 3.2 AC #5 "Couldn't save your task. Try again."]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

- `useCreateTodo.ts` created with full TanStack Query v5 optimistic mutation pattern (cancelQueries → snapshot → prepend optimistic → onError rollback → onSettled invalidate)
- `AddTaskModal.tsx` created with Radix UI Dialog, autoFocus title input, disabled submit when empty, Enter-key submit, error rollback with input preservation via `skipReset` ref
- Sonner `<Toaster />` added to `App.tsx`
- `App.tsx` wired with `isAddModalOpen` state, `AppHeader` onAddTask callback, and `AddTaskModal` rendered
- 4 `useCreateTodo` tests + 10 `AddTaskModal` tests — all pass
- All 45 frontend tests pass; build clean

### File List

- `frontend/src/hooks/useCreateTodo.ts`
- `frontend/src/hooks/useCreateTodo.test.ts`
- `frontend/src/components/AddTaskModal.tsx`
- `frontend/src/components/AddTaskModal.test.tsx`
- `frontend/src/App.tsx` (updated)
