---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
workflowStatus: complete
completedAt: '2026-02-22'
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
---

# bmad-todo - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for bmad-todo, decomposing the requirements from the PRD, UX Design Specification, and Architecture document into implementable stories.

## Requirements Inventory

### Functional Requirements

**Task Management**

- FR1: A user can create a new todo item by providing a required title and an optional short description, submitted via a modal or off-canvas panel
- FR2: A user can view the complete list of all their todo items
- FR3: A user can mark a todo item as complete
- FR4: A user can mark a completed todo item as incomplete (toggle back)
- FR5: A user can delete a todo item permanently
- FR6: The system stores each todo item with the following fields: title (required), description (optional), completion status, creation timestamp, done timestamp, last-modified timestamp, deletion timestamp
- FR6a: Task creation occurs in a modal or off-canvas panel presenting a title field (required) and description field (optional) before submission
- FR6b: The task list displays only the task title for each item; full task details are accessible by opening the individual task
- FR6c: A user can open a task item to view all its details: title, description, creation timestamp, done timestamp (if completed), and last-modified timestamp

**List Display & Visual State**

- FR7: Active and completed todo items are visually distinguishable from each other at a glance
- FR8: The list displays an empty state when no todo items exist
- FR9: The list displays a loading state while data is being fetched
- FR10: The application displays an error state when data cannot be loaded
- FR11: All todo items are visible immediately when the application loads

**Optimistic Interaction**

- FR12: Todo item creation is reflected in the UI immediately upon submission, before server confirmation
- FR13: Todo completion toggle is reflected in the UI immediately upon interaction, before server confirmation
- FR14: Todo deletion is reflected in the UI immediately upon interaction, before server confirmation
- FR15: The UI reverts an optimistic update and displays a meaningful error message if the server operation fails
- FR16: The user's input is preserved when a submission fails, so no retyping is required

**Data Persistence**

- FR17: All todo items persist across page refreshes
- FR18: All todo items persist across browser sessions
- FR19: The system stores data durably on the server side (not client-side storage only)

**Accessibility & Responsive Design**

- FR20: All interactive elements are operable via keyboard without a mouse
- FR21: The application uses semantic HTML elements for all structural and interactive components
- FR22: The application renders correctly and is fully usable on mobile screen sizes
- FR23: The application renders correctly and is fully usable on desktop screen sizes
- FR24: ARIA attributes are applied where semantic HTML alone is insufficient to convey context

**API Contract**

- FR25: The system exposes an endpoint to retrieve all todo items (GET /todos)
- FR25a: The system exposes an endpoint to retrieve a single todo item by ID (GET /todos/:id)
- FR26: The system exposes an endpoint to create a new todo item (POST /todos), accepting a required title and an optional description
- FR27: The system exposes an endpoint to update a todo item's completion status (PATCH /todos/:id); server sets the done timestamp and last-modified timestamp accordingly
- FR28: The system exposes an endpoint to delete a todo item (DELETE /todos/:id); server records a deletion timestamp before soft-deleting the record
- FR29: All API endpoints return meaningful HTTP status codes for both success and failure responses
- FR30: All API error responses include a descriptive message body in the shape `{ error: string, code?: string }`

**Observability**

- FR31: The system emits a structured log entry when a todo item is created
- FR32: The system emits a structured log entry when a todo item's completion status is updated
- FR33: The system emits a structured log entry when a todo item is deleted
- FR34: The system emits a structured log entry when a server-side error occurs, including context sufficient to diagnose the failure without code inspection

**Quality Assurance**

- FR35: The system has automated unit and integration tests covering ≥ 70% of meaningful code paths
- FR36: The system has automated E2E tests implemented in Playwright covering the complete core user journey (create, view, complete, delete)
- FR37: A minimum of 5 Playwright E2E tests pass as part of the automated test suite
- FR38: Tests are integrated into the development workflow and must pass before any change is considered complete
- FR39: The application produces zero critical WCAG violations in an automated accessibility audit

---

### NonFunctional Requirements

**Performance**

- NFR1: Core API endpoints (list, create, update, delete) respond in under 200ms under typical single-user load
- NFR2: The frontend reflects user actions (create, complete, delete) immediately via optimistic updates — no visible delay between user action and UI change
- NFR3: The initial page load renders the task list within 2 seconds on a standard broadband connection

**Reliability**

- NFR4: The application does not lose or corrupt todo data under normal operating conditions
- NFR5: The application handles API failures gracefully without crashing or entering an unrecoverable state
- NFR6: The application recovers to a consistent state after a failed optimistic update

**Accessibility**

- NFR7: The application produces zero critical WCAG 2.1 violations as measured by an automated accessibility audit tool
- NFR8: All core user interactions (create, complete, delete todo) are fully operable using keyboard only
- NFR9: The application uses semantic HTML such that screen readers can navigate and understand the UI without additional configuration

**Maintainability**

- NFR10: The codebase achieves ≥ 70% meaningful code coverage across unit and integration tests
- NFR11: The test suite can be run with a single command and produces a clear pass/fail result
- NFR12: The application can be deployed by following the README without requiring knowledge of undocumented conventions or decisions
- NFR13: The architecture does not structurally prevent the addition of user authentication or multi-user support in future iterations
- NFR14: Structured log output includes sufficient context (operation type, entity ID, timestamp, error details where applicable) to diagnose failures without code inspection

**Security (Baseline)**

- NFR15: The API does not expose internal error details (stack traces, paths, internal identifiers) in error responses to the client
- NFR16: The application protects against common web vulnerabilities (XSS, injection) using standard framework-level protections

---

### Additional Requirements

**From Architecture — Starter Template & Project Initialisation**

- ARCH1: Project uses `create-vite` (frontend, already scaffolded) + manual backend scaffold. Frontend initialised with `npm create vite@latest frontend -- --template react-ts`. Backend initialised manually with `npm init -y` in the `backend/` directory. This dictates Epic 1, Story 1.
- ARCH2: Root `package.json` must include workspace scripts: `dev`, `test`, `test:e2e`, `build`.

**From Architecture — Stack & Versions**

- ARCH3: Runtime is Node.js 24 LTS for both frontend and backend containers.
- ARCH4: Frontend stack: Vite 7, React 19, TypeScript 5.9, Tailwind CSS V4.2 (CSS-first `@theme {}` config, no `tailwind.config.js`), shadcn/ui (Radix UI, V4-compatible init path), TanStack Query V5, Vitest + React Testing Library.
- ARCH5: Backend stack: Fastify V5, Pino (built-in structured JSON logging), Zod, Prisma (latest). Fastify V5-compatible plugin versions: `@fastify/cors@^9`, `@fastify/sensible@^6`, `@fastify/type-provider-zod@^4`, `fastify-plugin@^5`.
- ARCH6: Database: PostgreSQL 16 in a Docker container.
- ARCH7: E2E: Playwright running against the full Docker Compose stack.

**From Architecture — Data Model**

- ARCH8: All `todos` records use UUID v4 as primary key (`id String @id @default(uuid())`).
- ARCH9: True soft-delete pattern — records are never physically removed. `deletedAt DateTime?` is set on delete. Every `findMany` query MUST filter `WHERE deletedAt IS NULL`.
- ARCH10: `userId String?` nullable column added to the `todos` Prisma schema from day one; always `null` in v1. Satisfies NFR13.
- ARCH11: Prisma schema `Todo` model includes: `id`, `title`, `description`, `completed`, `userId`, `createdAt`, `doneAt`, `updatedAt`, `deletedAt`.

**From Architecture — API Design**

- ARCH12: API base route is `/todos` (no `/api` prefix). Backend is a standalone service.
- ARCH13: All API errors use `{ error: string, code?: string }` envelope exclusively — no stack traces, no raw DB errors exposed to the client.
- ARCH14: CORS strategy: `@fastify/cors` reads `ALLOWED_ORIGIN` environment variable.
- ARCH15: Health check endpoint: `GET /health` → `{ status: "ok", timestamp: "<ISO-8601>" }`. Used by Docker Compose health check.

**From Architecture — Frontend Patterns**

- ARCH16: Server state (todos list, mutations, cache) managed exclusively by TanStack Query V5. Local UI state uses `useState` only.
- ARCH17: `useTodo(id)` MUST use `initialData` sourced from the `useTodos` query cache to render task detail instantly (no loading flash on modal open).
- ARCH18: Frontend routing uses React Router v7 with modal-as-route pattern: `/` (list, no modal) and `/todos/:id` (list + TaskDetailModal open).
- ARCH19: Frontend API base URL sourced from `VITE_API_URL` environment variable exclusively — no hardcoded URLs.

**From Architecture — Infrastructure & Deployment**

- ARCH20: Three-service Docker Compose setup (`frontend`, `backend`, `postgres`) with multi-stage Dockerfiles (non-root user, health checks).
- ARCH21: Separate `docker-compose.test.yml` for an isolated test environment with a dedicated `postgres-test` service.
- ARCH22: Prisma migrations must be applied to the test DB before integration tests run (`prisma migrate deploy` as a `pretest` script).
- ARCH23: `doneAt` transition logic (set `now()` on `false→true`, set `null` on `true→false`) managed exclusively in `todo.service.ts`.

**From Architecture — Logging**

- ARCH24: All per-request operation logs MUST use `request.log` (not `app.log`) to carry Fastify's auto-generated `reqId`.
- ARCH25: Every operation log entry MUST include: `reqId` (auto by Fastify), `userId: null` (v1), `todoId`, and a descriptive `msg`.

**From Architecture — Implementation Sequence**

- ARCH26: Implementation order: (1) Prisma schema + initial migration → (2) Backend routes/service/repository → (3) `api-client.ts` + TanStack Query setup → (4) React Router setup → (5) Core components → (6) Optimistic mutation hooks → (7) Undo-delete timer → (8) Docker Compose + health checks → (9) Test suites (unit → integration → E2E).

**From UX Design Specification**

- UX1: Layout is single-column, `max-w-xl` centred, warm off-white background (`#FAFAF9`). No sidebars, no grid, no multi-column layout.
- UX2: Task list UI has two explicitly labelled sections: **Active · n** and **Done · n** (section label shows live count).
- UX3: "Add task" button is always visible, top-right of the list header (AppHeader component). Opening the creation panel must feel instant (<100ms).
- UX4: Task creation panel is a `Dialog` (desktop ≥ md) or `Sheet` (bottom, mobile < md). Title field auto-focuses on open. Enter on title submits; Escape dismisses.
- UX5: Task row shows title only (no description, no timestamps). Row is tappable to open task detail. Delete icon hover-reveal on desktop, always-visible on mobile.
- UX6: Completion toggle: strikethrough fades in ~150ms + task moves to Done section. Transition uses `motion-safe:transition-all motion-safe:duration-150`.
- UX7: Delete flow: optimistic removal + 5-second Sonner undo-toast ("Task deleted. Undo?"). API DELETE fires after 5s; undo cancels the timer. Uses `useRef` for the timer handle.
- UX8: Undo-delete: timer handle stored in `useRef<ReturnType<typeof setTimeout>>` — never `useState`.
- UX9: Task detail panel (read-only in MVP) shows: title, description (or muted italic "No description added."), creation timestamp, done timestamp (if completed), last-modified timestamp. All timestamps use `<time datetime="ISO-8601">` elements.
- UX10: Custom colour tokens: `background #FAFAF9`, `surface #FFFFFF`, `border #E7E5E4`, `text-primary #1C1917`, `text-secondary #78716C`, `text-muted #A8A29E`, `accent #4F46E5`, `accent-hover #4338CA`, `error #DC2626`, `error-surface #FEF2F2`.
- UX11: Typography: Inter font, loaded via `@fontsource/inter` or system-ui fallback. Minimum text size 14px.
- UX12: Responsive breakpoints: default = mobile styles (Sheet, always-visible delete, `py-3` row padding); `md` (≥768px) = desktop styles (Dialog, hover-reveal delete, `py-2.5` row padding).
- UX13: Accessibility: all interactive elements have visible focus indicators (2px `accent` ring). Touch targets minimum 44×44px. `aria-live="polite"` on the task list container. `Checkbox` + delete icon have `aria-label`. Error messages use both colour and text.
- UX14: Reduced-motion: all transition classes wrapped with `motion-safe:` prefix.
- UX15: Loading state renders 3 `Skeleton` rows (matching TaskRow height `h-10`) — no spinner overlay.
- UX16: `muted-text (#A8A29E)` must ONLY be used for non-informational decorators (placeholders, metadata labels) — never as the sole carrier of required information.

---

### FR Coverage Map

```
FR1  → Epic 3 — Task creation via AddTaskModal
FR2  → Epic 3 — Task list view (TaskList + TaskRow)
FR3  → Epic 3 — Completion toggle (useToggleTodo + TaskDetailModal action button)
FR4  → Epic 3 — Toggle back to active (same hook + TaskDetailModal action button)
FR5  → Epic 3 — Task deletion (useDeleteTodo + TaskDetailModal delete button → undo-delete flow)
FR6  → Epic 2 — Todo data model (Prisma schema, 7 fields)
FR6a → Epic 3 — Modal/panel with title + description fields
FR6b → Epic 3 — Title-only list rows
FR6c → Epic 3 — Task detail modal (all 7 fields)
FR7  → Epic 3 — Active/Done section visual distinction
FR8  → Epic 3 — EmptyState component
FR9  → Epic 3 — Skeleton loading rows
FR10 → Epic 3 — Error state with retry
FR11 → Epic 3 — Immediate list visibility on load
FR12 → Epic 3 — Optimistic create (onMutate snapshot)
FR13 → Epic 3 — Optimistic toggle (onMutate snapshot)
FR14 → Epic 3 — Optimistic delete (onMutate snapshot)
FR15 → Epic 3 — Rollback + error toast on API failure
FR16 → Epic 3 — Input preserved on submission failure
FR17 → Epic 1 — Prisma schema + PostgreSQL (foundation)
FR18 → Epic 1 — Server-side persistence (foundation)
FR19 → Epic 1 — Server-side storage (Prisma + DB migration)
FR20 → Epic 3 — Keyboard operability (shadcn/ui + aria-label)
FR21 → Epic 3 — Semantic HTML throughout
FR22 → Epic 3 — Mobile responsive layout
FR23 → Epic 3 — Desktop responsive layout
FR24 → Epic 3 — ARIA attributes (Radix UI primitives)
FR25 → Epic 2 — GET /todos endpoint
FR25a→ Epic 2 — GET /todos/:id endpoint
FR26 → Epic 2 — POST /todos endpoint
FR27 → Epic 2 — PATCH /todos/:id endpoint
FR28 → Epic 2 — DELETE /todos/:id (soft-delete, deletedAt)
FR29 → Epic 2 — Meaningful HTTP status codes
FR30 → Epic 2 — Error response envelope { error, code }
FR31 → Epic 2 — Structured log on create
FR32 → Epic 2 — Structured log on status update
FR33 → Epic 2 — Structured log on delete
FR34 → Epic 2 — Structured log on server error
FR35 → Epic 2 + Epic 4 — ≥70% coverage (BE unit+integration in E2, E2E in E4)
FR36 → Epic 4 — Playwright E2E test suite
FR37 → Epic 4 — ≥5 Playwright tests passing
FR38 → Epic 4 — Tests in development workflow
FR39 → Epic 3 — Zero critical WCAG violations
```

## Epic List

### Epic 1: Project Foundation & Developer Environment

A developer can clone the repository, start the full stack locally with a single command, verify the Todo database schema is live and migrated, and confirm the project structure matches the architecture — fulfilling the baseline of the developer/maintainer persona's operational needs.

**Delivers:** Scaffolded monorepo, Vite + React frontend shell, Fastify backend shell, Prisma schema with `Todo` model (all 7 fields, soft-delete, nullable `userId`), initial DB migration, PostgreSQL via Docker, root workspace scripts (`dev`, `test`, `build`), env configuration files (`.env.example`, `.env.development`, `.env.test`).

**FRs covered:** FR17, FR18, FR19
**ARCH requirements covered:** ARCH1, ARCH2, ARCH3, ARCH4, ARCH5, ARCH6, ARCH8, ARCH9, ARCH10, ARCH11, ARCH20

---

### Epic 2: Core Task API

A developer or API consumer can perform all task operations — list all todos, retrieve a single todo, create a todo, toggle completion, and soft-delete a todo — through a fully tested REST API that returns structured JSON, meaningful HTTP status codes, safe error envelopes, and emits structured log entries for every critical operation.

**Delivers:** All 6 REST endpoints (`GET /todos`, `GET /todos/:id`, `POST /todos`, `PATCH /todos/:id`, `DELETE /todos/:id`, `GET /health`), Fastify 3-layer architecture (route/service/repository), Zod validation, global error handler (`{ error, code }`), Pino structured logging (`reqId` + `userId: null`), Vitest unit + integration tests, ≥70% backend coverage.

**FRs covered:** FR6, FR25, FR25a, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR33, FR34, FR35
**NFRs covered:** NFR1, NFR4, NFR10, NFR11, NFR14, NFR15, NFR16

---

### Epic 3: Core Task UI

A user can perform the complete core task loop — create a task via modal, view all tasks in a two-section list (Active / Done), toggle completion with immediate visual feedback, open a task to view all details (with action buttons to mark done/active and delete), and delete a task with a 5-second undo window — across desktop and mobile, with full keyboard operability and zero critical WCAG violations.

**Delivers:** React Router v7 routes (`/` and `/todos/:id`), `api-client.ts`, TanStack Query V5 optimistic mutations (`useCreateTodo`, `useToggleTodo`, `useDeleteTodo`), all 8 custom components (`AppHeader`, `SectionHeader`, `TaskList`, `TaskRow`, `EmptyState`, `AddTaskModal`, `TaskDetailModal`, `UndoToast`), shadcn/ui integration, responsive layout (Dialog desktop / Sheet mobile), 150ms completion animation, undo-delete timer via `useRef`, loading skeletons, error states with input preservation, action buttons inside `TaskDetailModal` (Mark as done/active + Delete triggering undo-toast), frontend Vitest + React Testing Library tests.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6a, FR6b, FR6c, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR20, FR21, FR22, FR23, FR24, FR39
**NFRs covered:** NFR2, NFR3, NFR5, NFR6, NFR7, NFR8, NFR9

---

### Epic 4: Production Readiness & Quality Gates

A DevOps engineer can deploy the complete application to production using Docker Compose with a README-only guide, and the development team can verify the full user journey through ≥5 passing Playwright E2E tests — achieving every quality gate that makes the application production-trustworthy.

**Delivers:** Multi-stage production `Dockerfiles` (frontend + backend, non-root user), production `docker-compose.yml` (3 services), `docker-compose.test.yml` (isolated test DB), `prisma migrate deploy` pretest automation, 5+ Playwright E2E specs (`create-todo.spec.ts`, `complete-todo.spec.ts`, `delete-todo.spec.ts`, `task-detail.spec.ts`, `empty-state.spec.ts`), `README.md` (deployment guide, architecture overview, single-command test run), final accessibility audit pass.

**FRs covered:** FR35 (E2E layer), FR36, FR37, FR38
**NFRs covered:** NFR10, NFR11, NFR12, NFR13

---

## Epic 1: Project Foundation & Developer Environment

A developer can clone the repository, start the full stack locally with a single command, verify the Todo database schema is live and migrated, and confirm the project structure matches the architecture — fulfilling the baseline of the developer/maintainer persona's operational needs.

### Story 1.1: Monorepo Root Workspace Setup

As a developer,
I want a configured root workspace with unified scripts and environment files,
So that I can manage the entire application from a single root with consistent commands.

**Acceptance Criteria:**

**Given** the repository is cloned,
**When** I run `npm install` at the root,
**Then** all frontend and backend workspace dependencies are installed.

**Given** env files are configured,
**When** I run `npm run dev` at the root,
**Then** both the Vite frontend dev server (port 5173) and the Fastify backend (port 3000) start concurrently.

**Given** the project root `package.json`,
**When** I inspect its scripts,
**Then** it contains `dev`, `test`, `test:e2e`, and `build` scripts that delegate to the appropriate sub-packages.

**Given** the project root,
**When** I check `.env.example`,
**Then** it lists every required environment variable for all three layers (frontend, backend, database) with placeholder values and a comment describing each.

**Given** the project root,
**When** I check `.gitignore`,
**Then** it includes `.env`, `node_modules/`, `dist/`, `frontend/dist/`, `backend/dist/`, and Prisma generated client files.

---

### Story 1.2: Backend Project Initialisation & Fastify Shell

As a developer,
I want a minimal Fastify V5 backend application that starts and responds to a health check,
So that the backend layer is ready to receive route, service, and repository additions in Epic 2.

**Acceptance Criteria:**

**Given** the backend directory,
**When** I run `npm install`,
**Then** Fastify V5, `@fastify/cors@^9`, `@fastify/sensible@^6`, `@fastify/type-provider-zod@^4`, `fastify-plugin@^5`, Zod, and Pino are installed with correct version constraints.

**Given** the backend is running,
**When** I send `GET /health` to port 3000,
**Then** I receive HTTP 200 with `{ "status": "ok", "timestamp": "<ISO-8601>" }`.

**Given** `src/app.ts` (Fastify instance factory),
**When** the backend starts,
**Then** `@fastify/cors` (reading `ALLOWED_ORIGIN` env var), `@fastify/sensible`, and the global error handler plugin are all registered.

**Given** an unhandled error of any kind reaches the global error handler,
**When** Fastify processes it,
**Then** the client receives `{ "error": "...", "code": "..." }` — no stack traces, no internal paths, no raw DB error details — and the error is logged before the response is sent.

**Given** `src/server.ts`,
**When** the backend is started in production,
**Then** it calls `app.listen()` with `PORT` from the environment (default 3000) — `server.ts` is never imported in tests, only `app.ts` is.

**Given** `backend/tsconfig.json`,
**When** I run `npm run build`,
**Then** TypeScript compiles the backend without errors.

---

### Story 1.3: Prisma Schema, Migration & Database Connection

As a developer,
I want the `todos` table provisioned in PostgreSQL with the exact data model specified in the architecture,
So that the backend API can persist and query todo items without schema changes throughout the project.

**Acceptance Criteria:**

**Given** `backend/prisma/schema.prisma`,
**When** I inspect the `Todo` model,
**Then** it contains exactly: `id String @id @default(uuid())`, `title String`, `description String?`, `completed Boolean @default(false)`, `userId String?`, `createdAt DateTime @default(now())`, `doneAt DateTime?`, `updatedAt DateTime @updatedAt`, `deletedAt DateTime?`.

**Given** a running PostgreSQL instance and `DATABASE_URL` set in `backend/.env`,
**When** I run `npx prisma migrate dev --name init`,
**Then** the migration succeeds and the `todos` table exists in the database with all specified columns.

**Given** the migration is applied,
**When** I run `npx prisma generate`,
**Then** the Prisma client is generated and the `Todo` TypeScript type reflects all 9 model fields.

**Given** `backend/.env.test` contains a separate `DATABASE_URL` pointing to the test database,
**When** the `pretest` script runs,
**Then** `prisma migrate deploy` is executed against the test database — never the development database.

**Given** all repository `findMany` queries,
**When** the code is inspected,
**Then** every `prisma.todo.findMany` call includes `where: { deletedAt: null }` — no exceptions.

---

### Story 1.4: Frontend Shell & Dependency Configuration

As a developer,
I want the frontend configured with Tailwind V4, shadcn/ui, TanStack Query V5, and React Router v7,
So that all visual and data-fetching foundations are in place for component development in Epic 3.

**Acceptance Criteria:**

**Given** the frontend directory,
**When** I run `npm install`,
**Then** Tailwind CSS V4.2, shadcn/ui (V4-compatible), TanStack Query V5, React Router v7, and Vitest + React Testing Library are all installed.

**Given** `src/app.css`,
**When** I inspect it,
**Then** it uses Tailwind V4 CSS-first syntax (`@import "tailwindcss"`) and an `@theme {}` block defining the 10 design tokens: `background #FAFAF9`, `surface #FFFFFF`, `border #E7E5E4`, `text-primary #1C1917`, `text-secondary #78716C`, `text-muted #A8A29E`, `accent #4F46E5`, `accent-hover #4338CA`, `error #DC2626`, `error-surface #FEF2F2`.

**Given** `src/main.tsx`,
**When** the app initialises,
**Then** `QueryClientProvider` (wrapping the configured `QueryClient` from `lib/query-client.ts`) and `RouterProvider` (with routes from `App.tsx`) are both present.

**Given** `src/lib/api-client.ts`,
**When** any exported function is called,
**Then** it prepends `import.meta.env.VITE_API_URL` to the request path — no URLs are hardcoded anywhere in the frontend source.

**Given** `frontend/.env.development`,
**When** the Vite dev server starts,
**Then** `VITE_API_URL=http://localhost:3000` is available via `import.meta.env.VITE_API_URL`.

**Given** the frontend runs in a browser,
**When** I open the app,
**Then** there are no console errors, the page renders without crashing, and React Router is active with the `/` route matched.

---

## Epic 2: Core Task API

A developer or API consumer can perform all task operations — list all todos, retrieve a single todo, create a todo, toggle completion, and soft-delete a todo — through a fully tested REST API that returns structured JSON, meaningful HTTP status codes, safe error envelopes, and emits structured log entries for every critical operation.

### Story 2.1: Todo Repository & Service Layer

As a developer,
I want a typed repository and service layer that encapsulates all todo data access and business logic,
So that all API route handlers can delegate to a testable, dependency-injected implementation without touching Prisma directly.

**Acceptance Criteria:**

**Given** `backend/src/repositories/todo.repository.ts`,
**When** inspected,
**Then** it exposes methods: `findAll()`, `findById(id)`, `create(data)`, `update(id, data)`, `softDelete(id)` — all using Prisma client, all `findMany`/`findFirst` calls include `where: { deletedAt: null }`.

**Given** `backend/src/services/todo.service.ts`,
**When** inspected,
**Then** it depends on `TodoRepository` via constructor injection (not importing Prisma directly) and exposes: `getAllTodos()`, `getTodoById(id)`, `createTodo(data)`, `toggleCompletion(id, completed)`, `deleteTodo(id)`.

**Given** `toggleCompletion(id, true)` is called on a currently active todo,
**When** the service executes,
**Then** it sets `doneAt` to the current timestamp and `completed` to `true` — via the repository `update` method only.

**Given** `toggleCompletion(id, false)` is called on a currently completed todo,
**When** the service executes,
**Then** it sets `doneAt` to `null` and `completed` to `false` — `updatedAt` is updated automatically by Prisma `@updatedAt` (not set manually).

**Given** `deleteTodo(id)` is called,
**When** the service executes,
**Then** it calls `repository.softDelete(id)` which sets `deletedAt` to the current timestamp — the record is never physically removed from the database.

**Given** `backend/tests/unit/todo.service.test.ts` and `todo.repository.test.ts`,
**When** I run `npm test`,
**Then** all unit tests pass with the Prisma client mocked — testing logic in isolation.

---

### Story 2.2: List & Retrieve Todos API

As an API consumer,
I want to retrieve all active todos and fetch a single todo by ID,
So that I can build a UI that displays the complete task list and individual task details.

**Acceptance Criteria:**

**Given** the backend is running,
**When** I send `GET /todos`,
**Then** I receive HTTP 200 with an array of all non-deleted todo objects; if no todos exist, the response is an empty array `[]`.

**Given** a todo exists with id `abc-123`,
**When** I send `GET /todos/abc-123`,
**Then** I receive HTTP 200 with the full todo object including all 9 fields.

**Given** no todo exists with a given ID,
**When** I send `GET /todos/nonexistent-id`,
**Then** I receive HTTP 404 with `{ "error": "Todo not found", "code": "TODO_NOT_FOUND" }`.

**Given** any successful `GET /todos` or `GET /todos/:id` request,
**When** inspecting response field types,
**Then** all timestamps are ISO 8601 strings — never Unix timestamps — and `id` is a UUID string.

**Given** `backend/tests/integration/todos.get.test.ts`,
**When** I run `npm test`,
**Then** integration tests using `fastify.inject()` cover: empty list, populated list, get by valid ID, get by invalid ID — all pass without starting an HTTP server.

---

### Story 2.3: Create Todo API

As an API consumer,
I want to create a new todo item by posting a title and optional description,
So that users can persist new tasks to the database with a creation timestamp and all required fields initialised.

**Acceptance Criteria:**

**Given** a valid request body `{ "title": "Buy milk" }`,
**When** I send `POST /todos`,
**Then** I receive HTTP 201 with the created todo object containing: a UUID `id`, `title: "Buy milk"`, `description: null`, `completed: false`, `userId: null`, a valid ISO 8601 `createdAt`, `doneAt: null`, a valid ISO 8601 `updatedAt`, `deletedAt: null`.

**Given** a request body `{ "title": "Buy milk", "description": "2% please" }`,
**When** I send `POST /todos`,
**Then** I receive HTTP 201 with the created todo including `description: "2% please"`.

**Given** a request body with an empty or missing `title`,
**When** I send `POST /todos`,
**Then** I receive HTTP 400 with `{ "error": "Title is required", "code": "VALIDATION_ERROR" }`.

**Given** a successful `POST /todos`,
**When** the operation completes,
**Then** `request.log.info({ todoId: todo.id, userId: null }, 'Todo created')` is emitted — carrying the auto-generated `reqId` from Fastify.

**Given** `backend/tests/integration/todos.post.test.ts`,
**When** I run `npm test`,
**Then** integration tests cover: valid create with title only, valid create with description, missing title 400, empty title 400 — all pass.

---

### Story 2.4: Toggle Todo Completion API

As an API consumer,
I want to toggle a todo's completion status via a PATCH request,
So that users can mark tasks as done or active, with the server managing all timestamp transitions correctly.

**Acceptance Criteria:**

**Given** an active todo (`completed: false`),
**When** I send `PATCH /todos/:id` with `{ "completed": true }`,
**Then** I receive HTTP 200 with the updated todo: `completed: true`, `doneAt` set to the current ISO 8601 timestamp, `updatedAt` updated — `doneAt` is set by the service layer, never the route handler.

**Given** a completed todo (`completed: true`),
**When** I send `PATCH /todos/:id` with `{ "completed": false }`,
**Then** I receive HTTP 200 with the updated todo: `completed: false`, `doneAt: null`, `updatedAt` updated.

**Given** a PATCH request for a non-existent or soft-deleted todo,
**When** I send the request,
**Then** I receive HTTP 404 with `{ "error": "Todo not found", "code": "TODO_NOT_FOUND" }`.

**Given** a PATCH request with a missing or invalid `completed` field,
**When** I send the request,
**Then** I receive HTTP 400 with `{ "error": "...", "code": "VALIDATION_ERROR" }`.

**Given** a successful `PATCH /todos/:id`,
**When** the operation completes,
**Then** `request.log.info({ todoId: id, userId: null, completed }, 'Todo completion updated')` is emitted with the new completion state.

**Given** `backend/tests/integration/todos.patch.test.ts`,
**When** I run `npm test`,
**Then** integration tests cover: toggle to complete (doneAt set), toggle to active (doneAt null), not-found 404, invalid body 400 — all pass.

---

### Story 2.5: Delete Todo API

As an API consumer,
I want to soft-delete a todo via a DELETE request,
So that users can remove tasks while the server preserves the deletion record for audit and observability purposes.

**Acceptance Criteria:**

**Given** an existing todo,
**When** I send `DELETE /todos/:id`,
**Then** I receive HTTP 204 with no response body.

**Given** a successful DELETE,
**When** I subsequently send `GET /todos`,
**Then** the deleted todo does not appear in the list (`deletedAt: null` filter applied).

**Given** a successful DELETE,
**When** I subsequently send `GET /todos/:id`,
**Then** I receive HTTP 404 — the record is excluded by the `deletedAt: null` filter.

**Given** a DELETE request for a non-existent or already-deleted todo,
**When** I send the request,
**Then** I receive HTTP 404 with `{ "error": "Todo not found", "code": "TODO_NOT_FOUND" }`.

**Given** a successful `DELETE /todos/:id`,
**When** the operation completes,
**Then** `request.log.info({ todoId: id, userId: null }, 'Todo soft-deleted')` is emitted.

**Given** a server-side error occurs during any todo operation,
**When** the global error handler catches it,
**Then** `request.log.error({ err, todoId: id, userId: null }, 'Todo operation failed')` is emitted and the client receives `{ "error": "Internal server error", "code": "INTERNAL_ERROR" }` — no stack trace or DB internals exposed.

**Given** `backend/tests/integration/todos.delete.test.ts`,
**When** I run `npm test`,
**Then** integration tests cover: successful soft-delete (204), deleted todo absent from list, deleted todo 404 on get, double-delete 404 — all pass.

**Given** `npm test` is run across all backend test files,
**When** the coverage report is generated,
**Then** meaningful code coverage across `routes/`, `services/`, and `repositories/` is ≥70%.

---

## Epic 3: Core Task UI

A user can perform the complete core task loop — create a task via modal, view all tasks in a two-section list (Active / Done), toggle completion with immediate visual feedback, open a task to view all details, and delete a task with a 5-second undo window — across desktop and mobile, with full keyboard operability and zero critical WCAG violations.

### Story 3.1: Task List View with Loading, Empty & Error States

As a user,
I want to see my full task list immediately when the app loads — with clear loading, empty, and error states —
So that I always know the current state of my tasks and the application never leaves me with a blank or ambiguous screen.

**Acceptance Criteria:**

**Given** the app loads and the API call is in-flight,
**When** `GET /todos` has not yet returned,
**Then** `TaskList` renders 3 `Skeleton` rows matching `TaskRow` height — no spinner overlay, no blank area.

**Given** the API returns successfully with an empty array,
**When** the task list renders,
**Then** `EmptyState` is shown with primary text "No tasks yet." and sub-text "Tap '+ Add task' to capture your first task." — the `AppHeader` with "+ Add task" button remains visible above it.

**Given** the API returns successfully with tasks,
**When** the task list renders,
**Then** active tasks appear in an "Active · n" labelled section and completed tasks appear in a "Done · n" labelled section, with live counts reflecting the actual task counts.

**Given** the API call fails (network error or 5xx),
**When** the error state renders,
**Then** a clear error message is shown and the UI does not crash or enter an unrecoverable state.

**Given** the app is opened at the `/` route,
**When** React Router resolves the route,
**Then** `App.tsx` renders the task list layout, `useTodos` fires `GET /todos`, and `TaskList` receives the query result as props.

**Given** `TaskList`, `TaskRow`, `SectionHeader`, `EmptyState` components,
**When** Vitest + React Testing Library tests run,
**Then** all component unit tests pass — covering loading, empty, populated, and error states.

---

### Story 3.2: Create Task via Modal

As a user,
I want to open a creation panel, enter a required title and optional description, and submit to see the task appear instantly in the Active section,
So that I can capture tasks with zero friction and immediate feedback.

**Acceptance Criteria:**

**Given** the app is loaded,
**When** I click or tap "+ Add task" in `AppHeader`,
**Then** a `Dialog` (desktop ≥ md) or `Sheet` (mobile < md) opens with the title `Input` field auto-focused — no click required to begin typing.

**Given** the creation modal is open with the title field empty,
**When** I inspect the "Add task" button,
**Then** it is disabled.

**Given** the creation modal is open with at least one character in the title field,
**When** I press Enter in the title field or click "Add task",
**Then** the modal closes immediately and the new task appears at the top of the Active section before the API call returns (optimistic update via `useCreateTodo` `onMutate`).

**Given** an optimistic task has been added to the list,
**When** `POST /todos` succeeds,
**Then** the task is confirmed in place — no visible change to the user.

**Given** `POST /todos` fails,
**When** `onError` fires,
**Then** the optimistic task is removed from the list, the modal reopens with the entered title and description preserved, and a Sonner error toast appears: "Couldn't save your task. Try again."

**Given** I press Escape or click the backdrop,
**When** the modal is open,
**Then** it closes without submitting and no task is added.

**Given** `AddTaskModal` and `useCreateTodo` hook,
**When** Vitest tests run,
**Then** tests cover: submit with title only, submit with title + description, disabled state when empty, error rollback with input preservation — all pass.

---

### Story 3.3: Toggle Task Completion

As a user,
I want to click a checkbox to mark a task as done or active with immediate visual feedback,
So that I can track my progress through my task list without waiting for server confirmation.

**Acceptance Criteria:**

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

---

### Story 3.4: Task Detail View with Actions

As a user,
I want to tap a task row to open a detail panel showing all task fields and action buttons to mark the task done/active or delete it,
So that I can review the full context of any task and act on it directly without closing the panel.

**Acceptance Criteria:**

**Given** a task row in the list,
**When** I click or tap the row body (not the checkbox or delete icon),
**Then** a `Dialog` (desktop) or `Sheet` (mobile) opens displaying: title, description (or "No description added." in muted italic if absent), creation timestamp, done timestamp (if completed), and last-modified timestamp — all formatted as human-readable strings using `Intl.DateTimeFormat`, rendered with `<time datetime="ISO-8601">` elements.

**Given** the detail modal opens for an active task,
**When** the footer is rendered,
**Then** it shows a "Mark as done" `Button` (accent) and a "Delete" `Button` (destructive outline) — and no "Mark as active" button.

**Given** the detail modal opens for a completed task,
**When** the footer is rendered,
**Then** it shows a "Mark as active" `Button` (accent) and a "Delete" `Button` (destructive outline) — and no "Mark as done" button.

**Given** the detail modal is open for an active task,
**When** I click "Mark as done",
**Then** `useToggleTodo` fires the same optimistic PATCH flow as Story 3.3, the modal closes, and the task moves to the Done section — with rollback and error toast on API failure.

**Given** the detail modal is open for a completed task,
**When** I click "Mark as active",
**Then** `useToggleTodo` fires the same optimistic PATCH flow as Story 3.3, the modal closes, and the task moves to the Active section — with rollback and error toast on API failure.

**Given** the detail modal is open,
**When** I click "Delete",
**Then** the modal closes immediately, the same optimistic undo-delete flow from Story 3.5 fires (task removed from list, Sonner toast with "Task deleted. [Undo]", 5-second timer before API DELETE) — with rollback and error toast on API failure.

**Given** the detail modal opens,
**When** `useTodo(id)` runs,
**Then** it uses `initialData` sourced from the `useTodos` query cache so the modal renders instantly — no loading flash on open.

**Given** the app is navigated directly to `/todos/:id` (e.g. page refresh or shared link),
**When** the route resolves,
**Then** the task list renders in the background and `TaskDetailModal` opens for that task ID, fetching via `GET /todos/:id`.

**Given** the detail modal is open,
**When** I press Escape, click the backdrop, or click the close button,
**Then** the modal closes and React Router navigates to `/` — no full page reload.

**Given** `TaskDetailModal` and `useTodo` hook,
**When** Vitest tests run,
**Then** tests cover: renders all fields, "No description" placeholder, timestamp formatting, modal-as-route navigation, "Mark as done" button triggers toggle hook, "Mark as active" button triggers toggle hook, "Delete" button triggers undo-delete flow — all pass.

---

### Story 3.5: Delete Task with Undo

As a user,
I want to delete a task and have a 5-second window to undo the deletion,
So that I can remove tasks confidently knowing I can reverse the action if I made a mistake.

**Acceptance Criteria:**

**Given** a task row on desktop,
**When** I hover over the row,
**Then** a delete icon button becomes visible at the right edge (`opacity-0 group-hover:opacity-100`).

**Given** a task row on a touch device,
**When** the row is rendered,
**Then** the delete icon is always visible (`@media (hover: none) { opacity: 1 }`).

**Given** I click or tap the delete icon,
**When** the action fires,
**Then** the task disappears from the list immediately (optimistic removal via `onMutate` snapshot) and a Sonner toast appears: "Task deleted. [Undo]" with a 5-second auto-dismiss.

**Given** the undo toast is visible,
**When** I click "Undo" within 5 seconds,
**Then** `clearTimeout` is called on the timer ref, the task is restored to its original position from the snapshot, and no `DELETE /todos/:id` API call is ever made.

**Given** the undo toast auto-dismisses after 5 seconds,
**When** the timer fires,
**Then** `DELETE /todos/:id` is sent; on HTTP 204, the task remains removed with no further UI change.

**Given** `DELETE /todos/:id` fails after the 5-second window,
**When** `onError` fires,
**Then** the task is restored to the list from the snapshot and a Sonner error toast appears: "Couldn't delete. Try again."

**Given** the undo timer handle,
**When** stored in the hook,
**Then** it uses `useRef<ReturnType<typeof setTimeout>>` — never `useState`.

**Given** `useDeleteTodo` hook and `UndoToast` component,
**When** Vitest tests run,
**Then** tests cover: optimistic removal, undo restores and cancels API call, timer fires API call, rollback on API error — all pass.

---

### Story 3.6: Accessibility & Responsive Polish

As a user on any device or using any assistive technology,
I want the full task loop to be operable by keyboard and screen reader, and render correctly on mobile and desktop,
So that the application meets WCAG 2.1 AA standards and works excellently across all supported contexts.

**Acceptance Criteria:**

**Given** the application loaded on desktop,
**When** I navigate using only the keyboard (Tab, Shift+Tab, Enter, Space, Escape),
**Then** I can complete the full task loop — open modal → type title → submit → toggle completion → open detail → close → delete → undo — without using a mouse.

**Given** all interactive elements (buttons, checkboxes, inputs, modal triggers),
**When** they receive keyboard focus,
**Then** a visible 2px `accent` colour focus ring is shown — `outline-none` is never used without a replacement focus indicator.

**Given** the `TaskList` container,
**When** tasks are added, toggled, or deleted,
**Then** `aria-live="polite"` on the container causes screen readers to announce the change without interrupting current speech.

**Given** the `Checkbox` and delete icon button in `TaskRow`,
**When** rendered,
**Then** `Checkbox` has `aria-label="Mark '[title]' as complete"` (or "incomplete") and the delete button has `aria-label="Delete '[title]'"`.

**Given** the app viewed on a 375px mobile viewport,
**When** rendered,
**Then** the layout is single-column `px-4`, all touch targets are minimum 44×44px, and task rows have `py-3` padding.

**Given** the app viewed on a 1280px desktop viewport,
**When** rendered,
**Then** content is `max-w-xl` centred, task rows have `py-2.5` padding, and the delete icon is hover-reveal only.

**Given** all animation transition classes,
**When** `prefers-reduced-motion` is enabled in the OS,
**Then** all transitions use `motion-safe:` prefix so animations are suppressed for users who prefer reduced motion.

**Given** an automated accessibility audit (axe) run against the fully rendered application,
**When** the audit completes,
**Then** zero critical WCAG violations are reported.

---

## Epic 4: Production Readiness & Quality Gates

A DevOps engineer can deploy the complete application to production using Docker Compose with a README-only guide, and the development team can verify the full user journey through ≥5 passing Playwright E2E tests — achieving every quality gate that makes the application production-trustworthy.

### Story 4.1: Docker Compose Production Stack

As a DevOps engineer,
I want a fully containerised production stack I can start with a single `docker compose up` command,
So that I can deploy the complete application — frontend, backend, and database — without knowledge of undocumented conventions or decisions.

**Acceptance Criteria:**

**Given** `frontend/Dockerfile` and `backend/Dockerfile`,
**When** inspected,
**Then** both use multi-stage builds (build stage + lean production stage), run as non-root users, and expose the correct ports (5173 and 3000 respectively).

**Given** `docker-compose.yml`,
**When** inspected,
**Then** it defines three services — `frontend`, `backend`, `postgres` — with a named volume for PostgreSQL data persistence, health checks on both `backend` (via `GET /health`) and `postgres`, environment variables sourced from `.env`, and `depends_on` with `condition: service_healthy` ensuring correct startup order.

**Given** `docker compose up` is run with all env vars set,
**When** all containers are healthy,
**Then** the frontend is reachable at the configured port, `GET /health` on the backend returns `{ "status": "ok", "timestamp": "..." }`, and the database is accepting connections.

**Given** `docker-compose.test.yml`,
**When** inspected,
**Then** it defines an isolated `postgres-test` service with a separate database name, used exclusively by integration and E2E tests — never the development database.

**Given** `backend/package.json`,
**When** inspected,
**Then** a `pretest` script runs `prisma migrate deploy` against `DATABASE_URL` from `.env.test` before any test file executes.

---

### Story 4.2: Playwright E2E Test Suite

As a developer,
I want a Playwright E2E test suite that covers the complete core user journey against the full running stack,
So that every deployment can be verified end-to-end and regressions in the user-facing flow are caught automatically.

**Acceptance Criteria:**

**Given** `e2e/playwright.config.ts`,
**When** inspected,
**Then** it targets the full Docker Compose stack URL, has a configured `baseURL`, and uses the isolated test database from `docker-compose.test.yml`.

**Given** `e2e/tests/create-todo.spec.ts`,
**When** Playwright runs,
**Then** it passes: opens the app, clicks "+ Add task", enters a title, submits, and verifies the task appears in the Active section.

**Given** `e2e/tests/complete-todo.spec.ts`,
**When** Playwright runs,
**Then** it passes: creates a task, clicks its checkbox, and verifies it moves to the Done section with strikethrough styling.

**Given** `e2e/tests/delete-todo.spec.ts`,
**When** Playwright runs,
**Then** it passes: creates a task, deletes it, and verifies it disappears from the list and the undo toast appears.

**Given** `e2e/tests/task-detail.spec.ts`,
**When** Playwright runs,
**Then** it passes: creates a task with a description, clicks the row body, verifies the detail modal opens with title, description, and creation timestamp visible; then clicks "Mark as done" in the modal footer and verifies the task moves to the Done section.

**Given** `e2e/tests/empty-state.spec.ts`,
**When** Playwright runs against a clean database,
**Then** it passes: opens the app and verifies the empty state "No tasks yet." message is visible.

**Given** `npm run test:e2e` at the root,
**When** all 5 spec files run,
**Then** all tests pass and the output clearly reports pass/fail per spec — minimum 5 tests passing.

---

### Story 4.3: README & Deployment Documentation

As a DevOps engineer or new developer,
I want a README that fully documents the project architecture, setup, and deployment steps,
So that I can get the application running in any environment and diagnose operational issues without reverse-engineering the codebase.

**Acceptance Criteria:**

**Given** the root `README.md`,
**When** I read it,
**Then** it contains: project overview, architecture summary (frontend/backend/database separation, key tech decisions), prerequisites (Node.js 24, Docker, Docker Compose), local development setup (step-by-step from clone to running app), running tests (single-command for unit, integration, and E2E), production deployment via Docker Compose, and an environment variables reference.

**Given** the README environment variables section,
**When** I inspect it,
**Then** every variable in `.env.example` is documented with its purpose, accepted values, and default — enough to configure the application from scratch.

**Given** a developer who has never seen the codebase,
**When** they follow the README setup steps from a clean environment (Node.js 24 + Docker installed),
**Then** they can run `npm run dev` and have the full stack running locally with no undocumented steps required.

**Given** the README test section,
**When** followed,
**Then** `npm test` runs all unit and integration tests with a single command and reports coverage; `npm run test:e2e` runs all Playwright tests with a single command.

**Given** the README architecture section,
**When** read,
**Then** it conveys: the 3-layer backend pattern (route → service → repository), the soft-delete strategy, the optimistic UI approach, and the Docker Compose service topology — without requiring the reader to consult the architecture document.
