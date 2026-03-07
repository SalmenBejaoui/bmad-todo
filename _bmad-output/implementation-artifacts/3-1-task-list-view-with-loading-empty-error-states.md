# Story 3.1: Task List View with Loading, Empty & Error States

Status: done

## Story

As a user,
I want to see my full task list immediately when the app loads — with clear loading, empty, and error states —
so that I always know the current state of my tasks and the application never leaves me with a blank or ambiguous screen.

## Acceptance Criteria

1. **Given** the app loads and the API call is in-flight, **When** `GET /todos` has not yet returned, **Then** `TaskList` renders 3 `Skeleton` rows matching `TaskRow` height — no spinner overlay, no blank area.

2. **Given** the API returns successfully with an empty array, **When** the task list renders, **Then** `EmptyState` is shown with primary text "No tasks yet." and sub-text "Tap '+ Add task' to capture your first task." — the `AppHeader` with "+ Add task" button remains visible above it.

3. **Given** the API returns successfully with tasks, **When** the task list renders, **Then** active tasks appear in an "Active · n" labelled section and completed tasks appear in a "Done · n" labelled section, with live counts reflecting the actual task counts.

4. **Given** the API call fails (network error or 5xx), **When** the error state renders, **Then** a clear error message is shown and the UI does not crash or enter an unrecoverable state.

5. **Given** the app is opened at the `/` route, **When** React Router resolves the route, **Then** `App.tsx` renders the task list layout, `useTodos` fires `GET /todos`, and `TaskList` receives the query result as props.

6. **Given** `TaskList`, `TaskRow`, `SectionHeader`, `EmptyState` components, **When** Vitest + React Testing Library tests run, **Then** all component unit tests pass — covering loading, empty, populated, and error states.

## Tasks / Subtasks

- [x] Task 1: Create shared `Todo` type and `useTodos` hook (AC: #5)
  - [x] 1.1: Create `frontend/src/types/todo.ts` — export `Todo` interface with all fields from Prisma schema
  - [x] 1.2: Create `frontend/src/hooks/useTodos.ts` — `useQuery({ queryKey: ['todos'], queryFn: () => apiClient.get<Todo[]>('/todos') })`
  - [x] 1.3: Add `@tanstack/react-query` import to hook file

- [x] Task 2: Create `AppHeader` component (AC: #2, #5)
  - [x] 2.1: Create `frontend/src/components/AppHeader.tsx` — title left, "+ Add task" button right
  - [x] 2.2: `AppHeader` accepts `onAddTask: () => void` callback prop
  - [x] 2.3: Button uses accent colour: `bg-accent text-white hover:bg-accent-hover` via Tailwind tokens

- [x] Task 3: Create `SectionHeader` component (AC: #3)
  - [x] 3.1: Create `frontend/src/components/SectionHeader.tsx` — receives `label: string` and `count: number`
  - [x] 3.2: Style: `text-[11px] font-semibold uppercase tracking-wider text-text-muted`

- [x] Task 4: Create `TaskRow` component (AC: #3, #6)
  - [x] 4.1: Create `frontend/src/components/TaskRow.tsx`
  - [x] 4.2: Flex row: Checkbox (shadcn/Radix) | title text | delete icon (Lucide `Trash2`, right-aligned)
  - [x] 4.3: For now, `onToggle`, `onDelete`, `onClick` props stubbed (wired in later stories)
  - [x] 4.4: Completed task title: `line-through text-text-muted`; active: `text-text-primary`
  - [x] 4.5: Full row body (excluding checkbox and delete icon) is a `button` element for click-to-detail (stubbed)
  - [x] 4.6: Delete icon: `opacity-0 group-hover:opacity-100` on desktop; `@media (hover: none) { opacity: 1 }` (touch always visible)
  - [x] 4.7: Row has `group` class on outer div for hover group targeting
  - [x] 4.8: `aria-label="Mark '[title]' as complete"` on Checkbox (or "incomplete" when completed); `aria-label="Delete '[title]'"` on delete button

- [x] Task 5: Create `EmptyState` component (AC: #2)
  - [x] 5.1: Create `frontend/src/components/EmptyState.tsx`
  - [x] 5.2: Primary text: "No tasks yet." (`text-sm font-medium text-text-secondary`)
  - [x] 5.3: Sub-text: "Tap '+ Add task' to capture your first task." (`text-sm text-text-muted`)
  - [x] 5.4: Centred layout with `py-12`

- [x] Task 6: Create `TaskList` component (AC: #1, #2, #3, #4)
  - [x] 6.1: Create `frontend/src/components/TaskList.tsx`
  - [x] 6.2: Accept query result props: `todos: Todo[] | undefined`, `isLoading: boolean`, `isError: boolean`
  - [x] 6.3: Loading branch: render 3 `Skeleton` elements matching `TaskRow` height (`h-10` with `rounded` and `animate-pulse`)
  - [x] 6.4: Error branch: render error message paragraph: "Couldn't load your tasks. Please try again."
  - [x] 6.5: Empty branch (no todos): render `<EmptyState />`
  - [x] 6.6: Populated branch: split `todos` into `activeTodos` (completed=false) and `doneTodos` (completed=true)
  - [x] 6.7: Render `<SectionHeader label="Active" count={activeTodos.length} />` then map `activeTodos` to `<TaskRow />`
  - [x] 6.8: Render `<SectionHeader label="Done" count={doneTodos.length} />` then map `doneTodos` to `<TaskRow />` (only if doneTodos.length > 0)
  - [x] 6.9: Wrap list container in `<ul role="list" aria-live="polite">` for screen reader announcements
  - [x] 6.10: Each `<TaskRow>` wrapped in `<li>` element

- [x] Task 7: Wire `App.tsx` to use `useTodos` and render `AppHeader` + `TaskList` (AC: #5)
  - [x] 7.1: Update `App.tsx` to import `useTodos`, `AppHeader`, `TaskList`
  - [x] 7.2: Call `useTodos()` in `App.tsx` and pass `todos`, `isLoading`, `isError` to `TaskList`
  - [x] 7.3: Render `<AppHeader onAddTask={() => {/* stubbed — wired in Story 3.2 */}} />`
  - [x] 7.4: Layout: `max-w-xl mx-auto px-4` wrapper, page background via `bg-background min-h-screen`
  - [x] 7.5: Update `App.css` — remove default Vite styles that conflict (`.logo`, `@keyframes logo-spin`), keep `@theme {}` tokens
  - [x] 7.6: Update `index.css` — replace default Vite styles with minimal reset (keep `@import "tailwindcss"`, font imports, `body { margin: 0; }`)

- [x] Task 8: Write unit tests (AC: #6)
  - [x] 8.1: Create `frontend/src/components/TaskList.test.tsx`
  - [x] 8.2: Test: loading state renders 3 skeleton elements (query skeletons present)
  - [x] 8.3: Test: empty state renders "No tasks yet." text
  - [x] 8.4: Test: populated state renders active and done section headers with correct counts
  - [x] 8.5: Test: error state renders "Couldn't load your tasks" message
  - [x] 8.6: Create `frontend/src/components/TaskRow.test.tsx`
  - [x] 8.7: Test: active task row renders title without strikethrough
  - [x] 8.8: Test: completed task row renders title with `line-through` class
  - [x] 8.9: Test: `aria-label` on checkbox and delete button contains the task title
  - [x] 8.10: Wrap all tests in `QueryClientProvider` with `retry: false`

- [x] Task 9: Validate and run tests
  - [x] 9.1: Run `cd frontend && npm test` — all tests pass (11 tests pass)
  - [x] 9.2: Run `cd frontend && npm run build` — no TypeScript errors

## Dev Notes

### Architecture & Stack Context

- **React Router v7** is already installed and wired in `main.tsx` via `RouterProvider`
- **TanStack Query v5** provider is in `main.tsx` via `QueryClientProvider` with `queryClient` from `lib/query-client.ts`
- **API client** is in `frontend/src/lib/api-client.ts` — use `apiClient.get<T>(path)` for queries
- **`VITE_API_URL`** must be set in `.env.development` (e.g., `VITE_API_URL=http://localhost:3000`) — the `apiClient` throws at module load if missing

### Existing File Inventory

| File | Status | Notes |
|---|---|---|
| `frontend/src/App.tsx` | EXISTS — minimal stub | Replace body with real layout |
| `frontend/src/App.css` | EXISTS — has `@theme {}` tokens | Remove Vite logo/animation styles, keep tokens |
| `frontend/src/index.css` | EXISTS — has Vite defaults | Replace body/h1/button/a defaults with minimal reset |
| `frontend/src/routes.tsx` | EXISTS — single `/` route | No change needed this story |
| `frontend/src/lib/api-client.ts` | EXISTS | Use as-is |
| `frontend/src/lib/query-client.ts` | EXISTS | Use as-is |
| `frontend/src/lib/utils.ts` | EXISTS | `cn()` utility |

### New Files to Create

```
frontend/src/types/todo.ts
frontend/src/hooks/useTodos.ts
frontend/src/components/AppHeader.tsx
frontend/src/components/AppHeader.test.tsx   (optional, basic smoke test)
frontend/src/components/SectionHeader.tsx
frontend/src/components/TaskRow.tsx
frontend/src/components/TaskRow.test.tsx
frontend/src/components/EmptyState.tsx
frontend/src/components/TaskList.tsx
frontend/src/components/TaskList.test.tsx
```

### Todo Type Shape

```ts
// frontend/src/types/todo.ts
export interface Todo {
  id: string
  title: string
  description: string | null
  completed: boolean
  userId: string | null
  createdAt: string       // ISO-8601 string from JSON
  doneAt: string | null
  updatedAt: string
  deletedAt: string | null
}
```

### No shadcn/ui CLI components needed this story

- `Skeleton`: use Tailwind directly — `<div className="h-10 rounded animate-pulse bg-border" />`
- `Checkbox`: use `@radix-ui/react-checkbox` directly (already installed in `package.json`)
- Do NOT run `npx shadcn add` — that would overwrite project files. Import from `@radix-ui/react-checkbox` directly or create a minimal `Checkbox.tsx` component wrapper

### Radix Checkbox Usage

```tsx
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

// Basic usage:
<CheckboxPrimitive.Root
  checked={todo.completed}
  onCheckedChange={() => onToggle(todo.id)}
  aria-label={`Mark '${todo.title}' as ${todo.completed ? 'incomplete' : 'complete'}`}
  className="h-5 w-5 rounded border border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
>
  <CheckboxPrimitive.Indicator>
    <Check className="h-3 w-3 text-white" />
  </CheckboxPrimitive.Indicator>
</CheckboxPrimitive.Root>
```

### CSS Cleanup Required

`index.css` currently has Vite default styles that conflict with the design system tokens. Replace with:
```css
@import "tailwindcss";
@import "@fontsource/inter";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";

@layer base {
  *, *::before, *::after { box-sizing: border-box; }
  body {
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;
    min-height: 100vh;
    background-color: #FAFAF9;
  }
}
```

`App.css` — keep only the `@theme {}` block, remove `.logo`, `@keyframes logo-spin`, and `@media (prefers-color-scheme: light)` blocks.

### Testing Setup

Tests are co-located with source. Import test utils from `frontend/src/test/` (check for existing `setup.ts` that imports `@testing-library/jest-dom`).

```tsx
// Minimal test wrapper helper
const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}
```

### Source Traceability

- `Todo` type fields: [Source: planning-artifacts/architecture.md#Data Architecture Decision 1.1, 1.3]
- `useTodos` hook pattern: [Source: planning-artifacts/architecture.md#Frontend Architecture Decision 3.1]
- `AppHeader` layout: [Source: planning-artifacts/ux-design-specification.md#Implementation Approach]
- Section labels "Active · n" / "Done · n": [Source: planning-artifacts/ux-design-specification.md#Chosen Direction]
- Skeleton loading (3 rows): [Source: planning-artifacts/epics.md#Story 3.1 AC "3 Skeleton rows"]
- Delete icon hover reveal: [Source: planning-artifacts/epics.md#Story 3.5 AC "opacity-0 group-hover:opacity-100"]
- `aria-live="polite"` on list: [Source: planning-artifacts/epics.md#Story 3.6 AC]
- Checkbox `aria-label`: [Source: planning-artifacts/epics.md#Story 3.6 AC]
- `max-w-xl` layout: [Source: planning-artifacts/ux-design-specification.md#Spacing & Layout Foundation]
- Design tokens (`@theme {}`): [Source: frontend/src/App.css]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

- All 11 tests pass (App.test.tsx: 1, TaskList.test.tsx: 5, TaskRow.test.tsx: 5)
- Created Todo type, useTodos hook, AppHeader, SectionHeader, TaskRow, EmptyState, TaskList components
- Updated App.tsx with real layout using useTodos + AppHeader + TaskList
- Cleaned up index.css (removed Vite defaults) and App.css (removed Vite logo styles, kept @theme tokens)
- App.test.tsx updated to mock api-client so VITE_API_URL not needed in test env
- Build passes with zero TypeScript errors

### File List

- `frontend/src/types/todo.ts` (created)
- `frontend/src/hooks/useTodos.ts` (created)
- `frontend/src/components/AppHeader.tsx` (created)
- `frontend/src/components/SectionHeader.tsx` (created)
- `frontend/src/components/TaskRow.tsx` (created)
- `frontend/src/components/TaskRow.test.tsx` (created)
- `frontend/src/components/EmptyState.tsx` (created)
- `frontend/src/components/TaskList.tsx` (created)
- `frontend/src/components/TaskList.test.tsx` (created)
- `frontend/src/App.tsx` (modified)
- `frontend/src/App.css` (modified — removed Vite defaults)
- `frontend/src/index.css` (modified — replaced Vite defaults with minimal reset)
- `frontend/src/App.test.tsx` (modified — added api-client mock)
