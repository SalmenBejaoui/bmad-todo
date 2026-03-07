# Story 3-4: Task Detail View with Actions

## Status: in-progress

## Story

As a user,
I want to tap a task row to open a detail panel showing all task fields and action buttons to mark the task done/active or delete it,
So that I can review the full context of any task and act on it directly without closing the panel.

## Acceptance Criteria

- Clicking task row body opens detail modal (Dialog) with title, description, timestamps
- Footer shows "Mark as done" + "Delete" for active tasks; "Mark as active" + "Delete" for completed
- Toggle buttons use `useToggleTodo` — modal closes on success, error toast on failure
- Delete triggers undo-delete flow from Story 3-5 (modal closes immediately)
- `useTodo(id)` uses `initialData` from `['todos']` cache — no loading flash
- Route `/todos/:id` renders detail modal over task list
- Escape/backdrop/close button → navigate to `/`
- Tests cover all above scenarios

## Tasks

1. Create `useTodo(id)` hook with initialData from cache
2. Create `TaskDetailModal` component 
3. Add `/todos/:id` route to routes.tsx
4. Wire `onClickTodo` in App.tsx to navigate to `/todos/:id`
5. Write tests
6. Run tests + build
