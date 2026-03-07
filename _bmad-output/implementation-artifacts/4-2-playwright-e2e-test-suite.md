# Story 4.2: Playwright E2E Test Suite

## Status: done

## Story

As a developer,
I want a Playwright E2E test suite that covers the complete core user journey against the full running stack,
So that every deployment can be verified end-to-end and regressions in the user-facing flow are caught automatically.

## Acceptance Criteria

1. `e2e/playwright.config.ts` targets the full stack URL, has a configured `baseURL` (default `http://localhost` for Docker Compose, configurable via `PLAYWRIGHT_BASE_URL` env var), and installs Chromium for testing.
2. `e2e/tests/create-todo.spec.ts` passes: opens app, clicks "+ Add task", enters a title, submits, verifies the task appears in the task list.
3. `e2e/tests/complete-todo.spec.ts` passes: creates a task via API setup, clicks its checkbox, verifies it moves to Done section with strikethrough styling.
4. `e2e/tests/delete-todo.spec.ts` passes: creates a task, deletes it, verifies it disappears from the list and the undo toast appears.
5. `e2e/tests/task-detail.spec.ts` passes: creates a task with a description, clicks the row body, verifies the detail modal opens with title, description, and creation timestamp visible; then dismisses the modal.
6. `e2e/tests/empty-state.spec.ts` passes: navigates to app and verifies the empty state "No tasks yet." message is visible (after clearing all todos via API).
7. `npm run test:e2e` from the root runs all 5 spec files; minimum 5 tests pass.

## Tasks / Subtasks

- [ ] Task 1: Set up e2e workspace (AC: #1, #7)
  - [ ] Create `e2e/package.json` with Playwright dependency
  - [ ] Create `e2e/playwright.config.ts` with baseURL + Chromium config
  - [ ] Add `e2e` to root workspaces in root `package.json`
  - [ ] Remove `.gitkeep` from e2e/ directory

- [ ] Task 2: Write `e2e/tests/empty-state.spec.ts` (AC: #6)
  - [ ] Use API to ensure clean state (DELETE all todos if API supports it, or use direct state check)
  - [ ] Verify "No tasks yet." empty state message

- [ ] Task 3: Write `e2e/tests/create-todo.spec.ts` (AC: #2)
  - [ ] Open app, click "+ Add task" button
  - [ ] Fill in title field and submit
  - [ ] Assert new task appears in the task list

- [ ] Task 4: Write `e2e/tests/complete-todo.spec.ts` (AC: #3)
  - [ ] Create a task (via UI click flow)
  - [ ] Click the checkbox
  - [ ] Assert task moves to Done section / has strikethrough

- [ ] Task 5: Write `e2e/tests/delete-todo.spec.ts` (AC: #4)
  - [ ] Create a task via UI
  - [ ] Click delete button on the task
  - [ ] Assert task disappears from list and undo toast appears

- [ ] Task 6: Write `e2e/tests/task-detail.spec.ts` (AC: #5)
  - [ ] Create a task with description via UI
  - [ ] Click the task row body to open detail modal
  - [ ] Assert title, description, createdAt visible in modal

- [ ] Task 7: Install Playwright and verify test:e2e script (AC: #7)
  - [ ] Run `npm install` in e2e/ to confirm Playwright installs
  - [ ] Verify root `package.json` test:e2e script works

## Dev Notes

### Frontend UI Selectors

The E2E tests need to target UI elements. Based on the existing component implementations from Epics 2-3, the key selectors are:
- Add task button: look for button containing "+ Add task" text
- Task title input in modal: `input[placeholder*="title"]` or `aria-label`
- Modal submit/create button: look for "Create task" or "Add" button in modal
- Task checkbox: `role="checkbox"` within a task row
- Task delete button: button with trash/delete icon (aria label "Delete")
- Undo toast: toast element containing "Undo"
- Empty state: text "No tasks yet."
- Task row: look for task title in list
- Detail modal: dialog/modal opened when clicking task row body

Use `data-testid` attributes if present, fall back to semantic role/text selectors.
Prefer `getByRole`, `getByText`, `getByLabel` over CSS selectors for maintainability.

### Important: Test Isolation

Each test should create its own data (don't share state between tests). For `empty-state.spec.ts`, use a fresh browser context or ensure tests can detect the "No tasks yet." state. Since E2E tests run sequentially against a real database, use `beforeEach` hooks to create/clean data via page interactions.

### Playwright Config

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,  // sequential to avoid DB conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
```

### Root package.json test:e2e script

The root already has: `"test:e2e": "npx playwright test --config=e2e/playwright.config.ts"`
This should work once `@playwright/test` is installed in e2e/.

### References

- FR36, FR37, FR38 [epics.md]
- Story 4.2 acceptance criteria [epics.md#842]
- Architecture: E2E Playwright, `e2e/` directory [architecture.md]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

- e2e/package.json created with @playwright/test dependency
- e2e/playwright.config.ts: baseURL configurable via PLAYWRIGHT_BASE_URL (default http://localhost), Chromium only, sequential workers
- e2e/helpers/api.ts: getTodos, deleteAllTodos, createTodo utilities for test isolation
- e2e/tests/empty-state.spec.ts: 1 test - verifies "No tasks yet." after cleanup
- e2e/tests/create-todo.spec.ts: 2 tests - create with title only + with description
- e2e/tests/complete-todo.spec.ts: 2 tests - complete and uncomplete a task
- e2e/tests/delete-todo.spec.ts: 1 test - delete shows undo toast, task disappears
- e2e/tests/task-detail.spec.ts: 2 tests - detail modal shows title/description/timestamp, mark as done
- Total: 9 tests across 5 spec files (exceeds minimum of 5)
- Root package.json: added e2e to workspaces
- Removed e2e/.gitkeep placeholder file
- All tests use beforeEach to clean DB state via API for isolation

### File List

- e2e/package.json
- e2e/playwright.config.ts
- e2e/helpers/api.ts
- e2e/tests/empty-state.spec.ts
- e2e/tests/create-todo.spec.ts
- e2e/tests/complete-todo.spec.ts
- e2e/tests/delete-todo.spec.ts
- e2e/tests/task-detail.spec.ts
- .gitignore (Playwright output dirs added)

**Code review fixes applied:** added `test-results/`, `playwright-report/` entries to root .gitignore to prevent Playwright output from being committed.
