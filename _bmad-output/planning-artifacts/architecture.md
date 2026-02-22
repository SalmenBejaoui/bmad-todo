---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-22'
inputDocuments:
  - product-brief-bmad-todo-2026-02-21.md
  - prd.md
  - ux-design-specification.md
project_name: 'bmad-todo'
user_name: 'Salmen'
date: '2026-02-22'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

39 FRs across 8 categories drive the architectural shape of bmad-todo:

- **Task Management (FR1–FR6c):** Single entity (`Todo`) with 7 fields (title, description,
  completion status, createdAt, doneAt, lastModifiedAt, deletedAt). Creation via modal/panel
  (required title + optional description). Detail view exposes all fields. List shows title only.
  Architectural implication: API must support both a lightweight list response and a full-entity
  detail response — or return full entities always (acceptable at this scale).

- **Optimistic Interaction (FR12–FR16):** All mutations optimistic with rollback on failure and
  input preservation. Deletion has a 5-second client-side undo window before the API call fires.
  Architectural implication: frontend requires a dedicated data/store layer (not ad-hoc component
  state) capable of managing pending operations and rollback state.

- **API Contract (FR25–FR30):** 6 REST endpoints. Soft-delete pattern (deletionTimestamp) for
  DELETE. All endpoints return meaningful HTTP status codes and descriptive error bodies.
  Architectural implication: a consistent structured error response shape must be agreed and
  applied across all endpoints.

- **Observability (FR31–FR34):** Structured log entry on every critical backend operation
  (create, update, delete, error) with sufficient context to diagnose without code inspection.
  Architectural implication: backend needs a logging middleware/interceptor layer, not ad-hoc
  console statements.

- **Quality Assurance (FR35–FR39):** ≥70% meaningful coverage (unit + integration) + ≥5
  Playwright E2E tests. Architectural implication: both layers need test-friendly structure
  (dependency injection, clear separation of concerns, seedable test data).

**Non-Functional Requirements:**

- **Performance:** <200ms API response under typical load; 2s initial page load; optimistic UI
  means perceived interaction latency is zero.
- **Reliability:** No data loss under normal conditions; graceful failure and rollback; no
  unrecoverable states.
- **Accessibility:** WCAG 2.1 Level AA; zero critical violations in automated audit; full
  keyboard operability; semantic HTML.
- **Maintainability:** Single-command test run; README-driven deployment; ≥70% coverage;
  extensible architecture for auth/multi-user (NFR13).
- **Security (baseline):** No internal error detail exposure to client; standard XSS/injection
  protection via framework-level mechanisms.

**Scale & Complexity:**

- Primary domain: Full-stack web (SPA + REST API + persistent data store)
- Complexity level: **Low** — single user, no auth, no real-time sync, no third-party
  integrations, no regulatory compliance, single entity domain model
- Estimated architectural components:
  - Frontend: ~8 custom components + shadcn/ui primitives + 1 data/store layer
  - Backend: ~5 route handlers + 1 service layer + 1 repository layer + 1 logging middleware
  - Data: 1 table/collection (`todos`), 7 fields
  - Testing: unit (backend service/repo) + integration (API routes) + E2E (Playwright)

### Technical Constraints & Dependencies

- **Frontend stack committed:** React SPA + Tailwind CSS + shadcn/ui (Radix UI). Backend must
  serve static assets or be paired with a static host. No SSR required.
- **Browser support:** Modern evergreen only. No polyfills, no IE11.
- **No WebSockets / real-time sync:** Cross-tab or cross-device sync explicitly out of scope.
- **No offline support:** Standard network assumptions only.
- **Soft-delete pattern:** The PRD specifies `deletionTimestamp` is recorded on delete (FR28),
  implying either soft-delete (record retained, flagged as deleted) or a hybrid (record deleted
  after timestamp is recorded). This must be decided explicitly.
- **Extensibility contract (NFR13):** The v1 data model and API structure must permit adding
  a `userId` foreign key and authentication middleware without structural rewrites.

### Cross-Cutting Concerns Identified

1. **Optimistic UI + rollback state management** — Applies to create, complete/uncomplete, and
   delete flows. A centralised state management approach (e.g. React Query, Zustand, or similar)
   is required to handle pending/error states consistently. The undo-delete timer is a stateful
   side effect that must be coordinated with API call timing.

2. **Structured logging** — All backend operations (create, update, delete, errors) must emit
   structured log entries. A logging middleware or interceptor pattern ensures consistency without
   per-handler implementation.

3. **Error contract alignment** — The frontend's error handling (toast messages, rollback
   triggers) depends on predictable API error response shapes. A shared error envelope
   (`{ error: string, code?: string }`) must be agreed and applied uniformly.

4. **Test infrastructure** — Both frontend and backend need test-friendly architecture: backend
   uses dependency injection for repository/service separation; E2E tests require a consistent
   database state (seed/teardown strategy).

5. **Extensibility seams** — User identity (`userId`) is a dormant column in the `todos` table
   from the start. Auth middleware is a future addition to the API layer. No UI-level auth
   work in v1 — but the data model and API must not assume single-user in a way that prevents
   adding it.

---

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application — separate frontend SPA and backend REST API, orchestrated
via Docker Compose with a shared PostgreSQL database.

### Architecture Decision: Separate Frontend + Backend (not Next.js)

**Considered and rejected: Next.js (App Router + Server Actions)**
Next.js with Server Actions was explored and rejected. The implementation requirements
explicitly mandate: separate Docker containers for frontend and backend, Postman-level
HTTP API validation, and an independently deployable and testable API service. Server
Actions cannot satisfy these constraints — they are not HTTP endpoints and cannot run
as a standalone container. Next.js with Route Handlers was also considered but produces
a REST API inside a React framework with no advantage over a dedicated backend.

**Decision: Vite SPA + Fastify API — clean separation, Docker-orchestrated.**

### Selected Starter: `create-vite` (frontend) + manual scaffold (backend)

Frontend is already initialised. Backend is scaffolded manually alongside it.

**Initialization Commands:**

```bash
# Frontend — already scaffolded
npm create vite@latest frontend -- --template react-ts

# Backend
mkdir backend && cd backend && npm init -y

# E2E
mkdir e2e

# Root workspace scripts
# package.json at root with dev, test, test:e2e, build scripts
```

### Confirmed Stack & Versions

**Runtime:** Node.js 24 LTS — both frontend and backend containers.

**Frontend:**
- Vite 7.3.1 — instant HMR, optimised SPA build ✅ already installed
- React 19.2.0 ✅ already installed
- TypeScript 5.9.3 ✅ already installed
- Tailwind CSS V4.2 — CSS-first config (`@theme {}` in CSS, no `tailwind.config.js`)
- shadcn/ui — Radix UI component primitives, V4-compatible init path
- TanStack Query V5 — data fetching, optimistic mutations, rollback, cache invalidation
- Vitest + React Testing Library — component and hook unit tests

**Backend:**
- Fastify V5 — TypeScript-first, built-in JSON Schema validation, high performance
- Pino (built-in to Fastify) — structured JSON logging; satisfies FR31–34 out of the box
- Zod — runtime request validation with TypeScript inference
- Prisma (latest) — type-safe DB client, migration tooling, schema-first
- `fastify.inject()` — route integration tests without port binding
- Vitest — unit (service layer) + integration (route layer) tests

**Fastify V5 Ecosystem — plugin version floor (Fastify V5 broke V4-era plugins):**

| Plugin | Minimum version |
|---|---|
| `@fastify/cors` | `^9.0.0` |
| `@fastify/sensible` | `^6.0.0` |
| `@fastify/type-provider-zod` | `^4.0.0` |
| `fastify-plugin` | `^5.0.0` |

> Always install these versions or higher. V4-era plugins silently fail to register in Fastify V5.

**Database:** PostgreSQL 16 — containerised in Docker Compose.

**E2E:** Playwright — runs against the full Docker Compose stack.

**Containerisation:**
- Multi-stage Dockerfiles (build + production), non-root user, health checks
- `docker-compose.yml` — three services: `frontend`, `backend`, `postgres`
- `docker-compose.test.yml` — test environment with isolated test DB

### Project Structure

```
bmad-todo/
├── frontend/
│   ├── src/
│   │   ├── components/   # AppHeader, TaskList, TaskRow, AddTaskModal, TaskDetailModal, etc.
│   │   ├── hooks/        # useTodos, useCreateTodo, useToggleTodo, useDeleteTodo
│   │   ├── lib/          # api client (fetch wrapper), queryClient config
│   │   └── types/        # Todo, ApiError shared types
│   ├── tests/
│   └── Dockerfile
├── backend/
│   ├── src/
│   │   ├── routes/       # todo.routes.ts (thin Fastify handlers)
│   │   ├── services/     # todo.service.ts (business logic, unit-testable)
│   │   ├── repositories/ # todo.repository.ts (Prisma wrapper, mockable)
│   │   ├── plugins/      # error-handler.ts, health.ts
│   │   ├── schemas/      # Zod schemas + JSON Schema for Fastify validation
│   │   └── app.ts        # Fastify instance factory
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   └── Dockerfile
├── e2e/                  # Playwright tests
├── docker-compose.yml
├── docker-compose.test.yml
└── package.json          # root scripts: dev, test, test:e2e, build
```

**Note:** Project initialisation is the first implementation story.

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data model: UUID IDs, soft-delete pattern, nullable userId
- API contract: URL structure, error envelope, CORS strategy
- Frontend data layer: TanStack Query for server state, useState for local state
- Frontend routing: React Router with modal-as-route pattern for task deep-linking

**Important Decisions (Shape Architecture):**
- Prisma schema extensibility seam (userId nullable from day one)
- Environment-variable-driven configuration at all layers
- Health check endpoint for container orchestration

**Deferred Decisions (Post-MVP):**
- Authentication strategy (slots into middleware layer; userId column already present)
- Multi-user data isolation (userId foreign key queries, no structural change required)
- Rate limiting (no multi-user load in v1)
- CDN / static asset hosting strategy

---

### Data Architecture

**Decision 1.1 — Todo ID Format: UUID v4**
- All `todos` records use UUID v4 as primary key
- Prisma: `id String @id @default(uuid())`
- Rationale: safe to expose in URLs, no enumerable record count leakage,
  compatible with multi-user future without collision risk

**Decision 1.2 — Soft-Delete: True Soft-Delete (`deletedAt`)**
- Records are never physically deleted. `deletedAt DateTime?` is set on delete.
- All list and detail queries filter `WHERE deletedAt IS NULL`
- Undo-delete: within the 5-second client window, the API DELETE call is simply
  never made; UI restores the item from local state
- Satisfies FR28 (deletionTimestamp recorded), supports audit/observability,
  and enables the undo window without additional rollback complexity
- Prisma query pattern: `findMany({ where: { deletedAt: null } })`

**Decision 1.3 — Nullable `userId` from Day One**
- `userId String?` added to the `todos` Prisma schema immediately
- Never read or written in v1 — always `null`
- No migration required when auth is added; column already exists
- Satisfies NFR13 (must not structurally prevent multi-user support)

**Prisma Schema (`todos` table):**
```prisma
model Todo {
  id          String    @id @default(uuid())
  title       String
  description String?
  completed   Boolean   @default(false)
  userId      String?                        // nullable — reserved for future auth
  createdAt   DateTime  @default(now())
  doneAt      DateTime?
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?                      // soft-delete marker
}
```

**Database Configuration:**
- `DATABASE_URL` environment variable (standard Prisma convention)
- Development: local PostgreSQL instance (`localhost:5432`) via `.env`
- Docker Compose: `postgres` service, credentials via environment variables
- Test: separate database (`DATABASE_URL` overridden in test environment)

---

### API & Communication Patterns

**Decision 2.1 — API URL Structure: `/todos` (no `/api` prefix)**
- Base route: `/todos`
- Backend is a standalone service, not a sub-path of a web app

**API Endpoints:**
```
GET    /todos          → list all todos (deletedAt IS NULL)
GET    /todos/:id      → get single todo by ID
POST   /todos          → create todo (title required, description optional)
PATCH  /todos/:id      → update completion status (sets/clears doneAt, updatedAt)
DELETE /todos/:id      → soft-delete (sets deletedAt, emits structured log)
GET    /health         → health check
```

**Decision 2.2 — Error Response Envelope:**
```ts
// All API errors (4xx, 5xx):
{ error: string, code?: string }

// Examples:
{ error: "Todo not found", code: "TODO_NOT_FOUND" }
{ error: "Title is required", code: "VALIDATION_ERROR" }
{ error: "Internal server error", code: "INTERNAL_ERROR" }
```
- `error`: human-readable message (safe to display to users)
- `code`: machine-readable string for frontend programmatic handling
- Backend never exposes stack traces, internal paths, or DB errors in responses (NFR15)

**Decision 2.3 — CORS Strategy: `ALLOWED_ORIGIN` env var**
- `@fastify/cors` reads `ALLOWED_ORIGIN` environment variable
- Development default: `http://localhost:5173`
- Production: set to deployed frontend domain
- No hardcoded origins in source code

---

### Frontend Architecture

**Decision 3.1 — State Management: TanStack Query + useState**
- **Server state** (todos list, mutations, cache): TanStack Query V5 exclusively
  - `useQuery` for list and single-task fetching
  - `useMutation` with `onMutate` / `onError` / `onSettled` for optimistic updates
    and rollback on create, toggle, and delete
- **Local UI state** (`useState` only — no Zustand):
  - Modal open/close state
  - Undo-delete pending state + 5-second timer (`useRef` for timer handle)
  - Form values in `AddTaskModal`
- Rationale: component tree is shallow; no cross-tree state-sharing problem;
  Zustand would be over-engineering at this scope

**`useTodo(id)` — single-task query with list cache seeding:**
- `useTodo(id)` calls `GET /todos/:id` to fetch a single todo (used by `TaskDetailModal`)
- It MUST use `initialData` sourced from the `useTodos` query cache to render instantly:
  ```ts
  const { data: todos } = useQueryClient().getQueryData<Todo[]>(['todos'])
  useQuery({
    queryKey: ['todos', id],
    queryFn: () => apiClient.get(`/todos/${id}`),
    initialData: () => todos?.find((t) => t.id === id),
    initialDataUpdatedAt: () => queryClient.getQueryState(['todos'])?.dataUpdatedAt,
  })
  ```
- This ensures `TaskDetailModal` opens with data immediately (no loading flash) while
  a background fetch validates freshness
- Anti-pattern: do NOT make `useTodo` a completely independent query with no `initialData`
  — this wastes a network round-trip on every modal open

**Decision 3.2 — Frontend Routing: React Router v7 (modal-as-route pattern)**
- Routes:
  - `/` — task list, no modal open
  - `/todos/:id` — task list rendered underneath, `TaskDetailModal` opened
    on top, driven by the `:id` URL param
- On page load at `/todos/:id`: app renders task list and immediately opens
  detail modal for that task (fetched by ID via `GET /todos/:id`)
- Refresh at `/todos/:id` → same state restored ✅
- Modal close → navigates to `/`, no full page reload
- Pattern used by Linear, GitHub, Notion — list is always the background context

**Decision 3.3 — API Base URL: `VITE_API_URL` env var**
- `VITE_API_URL` in `.env.development` and `.env.production`
- `lib/api-client.ts` wrapper prepends `VITE_API_URL` to all requests
- Development: `VITE_API_URL=http://localhost:3000`

---

### Infrastructure & Deployment

**Decision 4.1 — Health Check: `GET /health`**
- Returns `{ status: "ok", timestamp: "<ISO-8601>" }`
- Docker Compose `healthcheck` for the backend container points to this endpoint
- Frontend container health check: HTTP 200 on static server root

**Decision 4.2 — Backend Port: `3000` (env-configurable)**
- Default: `PORT=3000`; configurable via `PORT` environment variable
- Frontend Vite dev server: `5173` (default)

**Decision 4.3 — Database: env-configurable, local for development**
- All database config via `DATABASE_URL` env var (Prisma standard)
- Development: local PostgreSQL on `localhost:5432` via `.env`
- Docker Compose: `postgres` service with named volume for persistence
- Test: `DATABASE_URL` overridden to isolated test database
- `.env` gitignored; `.env.example` committed with placeholder values

**Test database migration strategy:**
- Before running integration tests, apply all Prisma migrations to the test database:
  ```bash
  DATABASE_URL=$(cat backend/.env.test | grep DATABASE_URL | cut -d= -f2) \
    npx prisma migrate deploy --schema=backend/prisma/schema.prisma
  ```
- Add this as a `pretest` script in `backend/package.json` so it runs automatically
- `docker-compose.test.yml` starts the isolated `postgres-test` service; the migration
  step must run after the container is healthy (use `wait-for-it` or health check polling)
- Never run integration tests against the development database

---

### Decision Impact Analysis

**Implementation Sequence (order matters):**
1. Prisma schema + initial migration (data model is the foundation)
2. Backend route + service + repository layer (API before UI)
3. `api-client.ts` + TanStack Query setup (data layer before components)
4. React Router setup + route structure (routing before components)
5. Core components (TaskList, TaskRow, AddTaskModal, TaskDetailModal)
6. Optimistic mutation hooks (create, toggle, delete with rollback)
7. Undo-delete timer pattern
8. Docker Compose + health checks
9. Test suites (unit → integration → E2E)

**Cross-Component Dependencies:**
- Soft-delete (`deletedAt`) affects every Prisma query — must be in all `findMany` filters
- Error envelope shape must be agreed before frontend error handling is built
- `VITE_API_URL` must be set before any frontend API call works
- React Router must be installed before `TaskDetailModal` is URL-driven
- `userId` nullable column requires no query changes in v1 but must be in initial migration

---

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database / Prisma Naming:**

| Rule | Convention | Example |
|---|---|---|
| Model names | PascalCase | `Todo` |
| Column names | camelCase | `createdAt`, `deletedAt`, `userId` |
| Boolean columns | plain adjective | `completed` not `isCompleted` |
| Timestamp columns | `*At` suffix | `createdAt`, `doneAt`, `updatedAt`, `deletedAt` |

**API Naming:**

| Rule | Convention | Example |
|---|---|---|
| Resource paths | lowercase plural nouns | `/todos`, `/todos/:id` |
| Route params | `:camelCase` | `:id` |
| Query params | `camelCase` | `?includeCompleted=true` |
| JSON response fields | `camelCase` | `{ "createdAt": "...", "userId": null }` |

**Code Naming — Backend:**

| Rule | Convention | Example |
|---|---|---|
| Files | `kebab-case.ts` | `todo.routes.ts`, `todo.service.ts` |
| Classes | `PascalCase` | `TodoService`, `TodoRepository` |
| Functions/methods | `camelCase` verb-first | `createTodo()`, `findById()`, `softDelete()` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_TITLE_LENGTH` |
| Zod schemas | `camelCase` + `Schema` suffix | `createTodoSchema`, `patchTodoSchema` |

**Code Naming — Frontend:**

| Rule | Convention | Example |
|---|---|---|
| Component files | `PascalCase.tsx` | `TaskRow.tsx`, `AddTaskModal.tsx` |
| Hook files | `camelCase.ts`, `use` prefix | `useTodos.ts`, `useCreateTodo.ts` |
| Utility files | `kebab-case.ts` | `api-client.ts`, `query-client.ts` |
| Component functions | `PascalCase` | `function TaskRow(...)` |
| Custom hooks | `camelCase`, `use` prefix | `function useTodos()` |
| Local variables | `camelCase` | `const isModalOpen`, `const todoId` |

---

### Structure Patterns

**Test file location — Backend:**
- Unit tests: `backend/tests/unit/` — test service and repository in isolation
- Integration tests: `backend/tests/integration/` — test routes via `fastify.inject()`
- Filename mirrors source: `todo.service.test.ts`, `todo.routes.test.ts`

**Test file location — Frontend:**
- Co-located with source as `*.test.tsx` / `*.test.ts`
- e.g. `TaskRow.test.tsx` sits next to `TaskRow.tsx`

**Test file location — E2E:**
- All Playwright tests in `e2e/` at root
- Named by user journey: `create-todo.spec.ts`, `complete-todo.spec.ts`, `delete-todo.spec.ts`

**Backend layer responsibilities (strict — agents must not blur these):**

| Layer | File | Responsibility | Must NOT |
|---|---|---|---|
| Route | `todo.routes.ts` | Parse request, validate input, call service, return response | Contain business logic or DB calls |
| Service | `todo.service.ts` | Business logic, orchestrate repository calls | Import Prisma directly |
| Repository | `todo.repository.ts` | All Prisma/DB calls | Contain business logic |
| Plugin | `plugins/*.ts` | Cross-cutting concerns (logging, error handling) | Be called from components |

**Frontend component responsibilities:**

| Layer | Responsibility | Must NOT |
|---|---|---|
| Component (`components/`) | Render UI, handle user events, call hooks | Call `fetch` directly or contain query logic |
| Hook (`hooks/`) | Wrap TanStack Query mutations/queries | Contain JSX or render logic |
| API client (`lib/api-client.ts`) | Raw `fetch` calls, prepend base URL, parse JSON | Know about React state or components |

---

### Format Patterns

**API success responses — direct resource, no envelope wrapper:**
```
GET  /todos       → array of Todo objects, HTTP 200
GET  /todos/:id   → single Todo object, HTTP 200
POST /todos       → created Todo object, HTTP 201
PATCH /todos/:id  → updated Todo object, HTTP 200
DELETE /todos/:id → no body, HTTP 204
```

**Date/time format:** ISO 8601 strings everywhere (`"2026-02-22T14:30:00.000Z"`). Never Unix timestamps. Frontend formats for display using `Intl.DateTimeFormat`.

**HTTP status codes — strictly enforced:**

| Situation | Code |
|---|---|
| Successful read | 200 |
| Successful create | 201 |
| Successful delete | 204 |
| Validation error | 400 |
| Not found | 404 |
| Server error | 500 |

---

### Process Patterns

**Optimistic mutation pattern (TanStack Query) — ALL three mutations follow this exact shape:**
```ts
useMutation({
  mutationFn: (data) => apiClient.post('/todos', data),
  onMutate: async (data) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] })
    const previous = queryClient.getQueryData(['todos'])
    queryClient.setQueryData(['todos'], (old) => /* optimistic update */)
    return { previous }  // snapshot for rollback
  },
  onError: (_err, _data, context) => {
    queryClient.setQueryData(['todos'], context.previous)  // rollback
    // show error toast
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })  // always re-sync
  },
})
```

**Undo-delete pattern:**
```
1. Optimistic: remove from local list immediately (onMutate snapshot)
2. Start 5s timer via useRef<ReturnType<typeof setTimeout>>
3. Show Sonner toast with "Undo" button
4. If Undo clicked: clearTimeout, queryClient restores from snapshot, no API call
5. If 5s elapsed: fire DELETE /todos/:id
6. If API error: onError rolls back from snapshot, shows error toast
```

**`doneAt` transition logic — managed exclusively in `todo.service.ts`:**
```ts
// In TodoService.toggleCompletion(id, completed):
const doneAt = completed ? new Date() : null
await this.repository.update(id, { completed, doneAt })
// updatedAt is managed automatically by Prisma @updatedAt — do not set manually
```
- `doneAt` = current timestamp when `completed` transitions `false → true`
- `doneAt` = `null` when `completed` transitions `true → false`
- `updatedAt` is set automatically by Prisma `@updatedAt` — never set it manually
- This logic lives ONLY in `todo.service.ts` — route handlers must not set `doneAt` directly

**Backend error handling — Fastify `setErrorHandler` plugin:**
```
- All unhandled errors route through the global error handler
- Never let Prisma errors, Zod errors, or unknown errors reach the client raw
- Always transform to: { error: string, code?: string }
- Always log with request.log.error before responding
```

**Structured logging — request correlation & context:**

Fastify's built-in `pino` logger auto-generates a unique `reqId` per request and propagates it to `request.log`. All operation-level logs MUST use `request.log` (not `app.log`) so every log entry is traceable to its originating request.

```ts
// ✅ All operation logs use request.log (carries reqId + userId automatically):
request.log.info({ todoId: todo.id, userId: null }, 'Todo created')
request.log.info({ todoId: id, userId: null, completed }, 'Todo completion updated')
request.log.info({ todoId: id, userId: null }, 'Todo soft-deleted')
request.log.error({ err, todoId: id, userId: null }, 'Todo operation failed')

// ✅ app.log for system-level events only:
app.log.info('Server listening on port 3000')

// ❌ Never use app.log for per-request operations (loses reqId context)
// ❌ Never use console.log anywhere in backend production code
```

Every operation log entry MUST include:
- `reqId` — auto-included by Fastify `request.log`
- `userId` — `null` in v1, populated when auth lands (never omit the field)
- `todoId` — the affected resource ID
- A descriptive `msg` string

---

### Enforcement Guidelines

**All agents MUST:**
- Follow file naming conventions exactly — no variation
- Keep route/service/repository layers strictly separated — no cross-layer imports
- Use `{ error, code }` for all error responses — no other shape
- Add `deletedAt: null` filter to every `findMany` query — no exceptions
- Use `VITE_API_URL` env var for all frontend API calls — no hardcoded URLs
- Use `request.log` (not `app.log`) for all per-request operation logs
- Include `userId` field in every operation log (value: `null` in v1)
- Return ISO 8601 strings for all dates — no Unix timestamps
- Use `uuid()` for all IDs — no auto-increment, no `nanoid`
- Use `useRef` for the undo timer handle — never `useState` for a timer

**Anti-patterns — explicitly forbidden:**
- ❌ `console.log` anywhere in backend code (use `request.log` or `app.log`)
- ❌ `app.log` for per-request operations (loses `reqId` traceability)
- ❌ Calling `prisma.*` directly from a route handler (must go through repository)
- ❌ Calling `fetch` directly from a React component (must go through hook + api-client)
- ❌ Wrapping API success responses in `{ data: ... }` — direct resource only
- ❌ Using `parseInt` on IDs — IDs are UUIDs, always strings
- ❌ Querying `todos` without `where: { deletedAt: null }` unless intentionally querying deleted records
- ❌ Hardcoding `localhost:3000` anywhere in frontend source
- ❌ Omitting `userId` from operation log entries


---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
bmad-todo/
├── package.json                    # root: workspace scripts (dev, test, test:e2e, build)
├── .env.example                    # committed: placeholder values for all env vars
├── .gitignore
├── README.md
├── docker-compose.yml              # production: frontend + backend + postgres
├── docker-compose.test.yml         # test environment: isolated test DB
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── .env.development            # VITE_API_URL=http://localhost:3000
│   ├── .env.production             # VITE_API_URL=https://api.yourdomain.com
│   ├── index.html
│   ├── Dockerfile
│   │
│   ├── src/
│   │   ├── main.tsx                # React root, QueryClientProvider, RouterProvider
│   │   ├── app.css                 # Tailwind V4 @import + @theme design tokens
│   │   ├── App.tsx                 # Route definitions (/ and /todos/:id)
│   │   │
│   │   ├── components/
│   │   │   ├── AppHeader.tsx
│   │   │   ├── SectionHeader.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskRow.tsx
│   │   │   ├── AddTaskModal.tsx
│   │   │   ├── TaskDetailModal.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── UndoToast.tsx
│   │   │   └── ui/                 # shadcn/ui generated components
│   │   │       ├── button.tsx
│   │   │       ├── checkbox.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── input.tsx
│   │   │       ├── sheet.tsx
│   │   │       ├── skeleton.tsx
│   │   │       ├── sonner.tsx
│   │   │       └── textarea.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useTodos.ts
│   │   │   ├── useTodo.ts
│   │   │   ├── useCreateTodo.ts
│   │   │   ├── useToggleTodo.ts
│   │   │   └── useDeleteTodo.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── api-client.ts
│   │   │   └── query-client.ts
│   │   │
│   │   └── types/
│   │       └── index.ts
│   │
│   └── tests/
│       └── setup.ts
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── .env.test
│   ├── Dockerfile
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── routes/
│   │   │   ├── todo.routes.ts
│   │   │   └── health.routes.ts
│   │   ├── services/
│   │   │   └── todo.service.ts
│   │   ├── repositories/
│   │   │   └── todo.repository.ts
│   │   ├── plugins/
│   │   │   ├── error-handler.ts
│   │   │   └── cors.ts
│   │   ├── schemas/
│   │   │   ├── todo.schema.ts
│   │   │   └── error.schema.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   └── tests/
│       ├── unit/
│       │   ├── todo.service.test.ts
│       │   └── todo.repository.test.ts
│       └── integration/
│           ├── todos.get.test.ts
│           ├── todos.post.test.ts
│           ├── todos.patch.test.ts
│           ├── todos.delete.test.ts
│           └── health.test.ts
│
└── e2e/
    ├── playwright.config.ts
    ├── fixtures/
    │   └── todo.fixture.ts
    └── tests/
        ├── create-todo.spec.ts
        ├── complete-todo.spec.ts
        ├── delete-todo.spec.ts
        ├── task-detail.spec.ts
        └── empty-state.spec.ts
```

---

### Architectural Boundaries

#### Frontend Boundary
- **Owns**: All UI rendering, client-side routing, optimistic state, UX interaction logic
- **Entry point**: `src/main.tsx` — mounts React tree with `QueryClientProvider` and `RouterProvider`
- **Exits only through**: `src/lib/api-client.ts` — the single point of HTTP communication
- **Must NOT**: import anything from `backend/`, call `fetch` directly in components, access `process.env` at runtime (Vite bakes `import.meta.env.VITE_*` at build time)

#### Backend Boundary
- **Owns**: Business logic, data persistence, validation, error translation
- **Entry point**: `src/app.ts` — builds and configures the Fastify instance (plugins, routes)
- **Runtime entry**: `src/server.ts` — calls `app.listen()` (not imported in tests)
- **Exits only through**: Prisma client to PostgreSQL
- **Must NOT**: import anything from `frontend/`, serve static files, contain any HTML

#### Database Boundary
- **Owns**: Data persistence, schema, constraint enforcement, migrations
- **Accessed only through**: `todo.repository.ts` via Prisma client
- **Must NOT**: be accessed directly from `todo.service.ts`, route handlers, or tests (tests use the repository layer)

#### Test Boundaries
- **Unit tests** (`tests/unit/`): mock the Prisma client — test service/repo logic in isolation
- **Integration tests** (`tests/integration/`): use `fastify.inject()` against a real test database (`DATABASE_URL` from `.env.test`) — no HTTP server started
- **E2E tests** (`e2e/tests/`): run against the full Docker Compose stack — no mocking

---

### Requirements-to-Structure Mapping

| FR Category | Files Responsible |
|---|---|
| Auth-free operation | `src/app.ts` (no auth plugin registered); all routes open |
| Todo CRUD | `routes/todo.routes.ts` → `services/todo.service.ts` → `repositories/todo.repository.ts` |
| Soft-delete | `todo.repository.ts` (`deletedAt` field); `prisma/schema.prisma` (nullable `DateTime`) |
| Undo (5s window) | `hooks/useDeleteTodo.ts` (optimistic + 5s timer via `useRef`); `DELETE /todos/:id` |
| Task detail deep-link | `App.tsx` route `/todos/:id`; `TaskDetailModal.tsx` rendered at that route |
| Filtering (active/all) | `useTodos.ts` (query param); `GET /todos?filter=active` handled in `todo.routes.ts` |
| Completion toggle | `useToggleTodo.ts`; `PATCH /todos/:id` in `todo.routes.ts` |
| Empty state | `EmptyState.tsx` rendered when `useTodos` returns empty array |
| Request correlation | `src/app.ts` (Fastify auto `reqId`); every `request.log.*` call includes `userId: null` |
| Error responses | `plugins/error-handler.ts`; `schemas/error.schema.ts` (`{ error, code }` shape) |
| Health check | `routes/health.routes.ts`; `GET /health` → `{ status: 'ok' }` |
| Environment config | `.env.development` / `.env.production` (FE); `.env` / `.env.test` (BE) |
| Containerisation | `frontend/Dockerfile`, `backend/Dockerfile`, `docker-compose.yml` |
| E2E test coverage | `e2e/tests/*.spec.ts` — one file per user story |

---

### Data Flow

```
User Action (browser)
        │
        ▼
React Component (e.g., TaskRow)
        │  calls mutation/query hook
        ▼
TanStack Query Hook  (e.g., useToggleTodo)
        │  calls api-client function
        ▼
api-client.ts  (fetch wrapper, sets base URL from VITE_API_URL)
        │  HTTP request
        ▼
─────────────── Docker network boundary ───────────────
        │
        ▼
Fastify Route Handler  (todo.routes.ts)
        │  Zod schema validation (request body/params)
        │  calls service method
        ▼
Todo Service  (todo.service.ts)
        │  business logic (e.g., set deletedAt timestamp)
        │  calls repository method
        ▼
Todo Repository  (todo.repository.ts)
        │  Prisma query (always includes deletedAt: null filter on reads)
        ▼
PostgreSQL 16  (Docker container, port 5432)
        │
        ▼  Prisma result
Todo Repository
        │
        ▼  mapped domain object
Todo Service
        │
        ▼  JSON response
Fastify Route Handler
        │  serialised per Fastify JSON schema
        ▼
─────────────── Docker network boundary ───────────────
        │
        ▼
api-client.ts  (parses response, throws typed error on 4xx/5xx)
        │
        ▼
TanStack Query  (caches result, triggers re-render)
        │
        ▼
React Component  (renders updated UI)
```

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

All technology choices are mutually compatible with no version conflicts:
- Vite 7 + React 19 + TypeScript 5.9 — designed together; V4 compat confirmed
- Tailwind V4.2 + shadcn/ui — V4-compatible init path called out; CSS-first `@theme {}` replaces `tailwind.config.js` (no conflict)
- TanStack Query V5 + React Router v7 — no overlap; Query owns server state, Router owns URL state
- Fastify V5 + Pino (built-in) + Zod + Prisma — standard Fastify V5 ecosystem; V5-compatible plugin versions now documented
- PostgreSQL 16 + Prisma — supported pairing; UUID `@default(uuid())` works natively
- Node.js 24 LTS — no version floor conflicts for any dependency

**Pattern Consistency:**

All patterns cohere internally and across layers:
- Layered backend (routes → service → repository) maps exactly to the test strategy (integration tests hit routes, unit tests mock repository)
- `request.log` + auto `reqId` logging is consistent with Fastify V5's built-in Pino integration
- TanStack Query V5 `onMutate` / `onError` / `onSettled` is the correct V5 pattern for optimistic mutations and rollback
- `VITE_API_URL` / `ALLOWED_ORIGIN` / `DATABASE_URL` env var pattern is consistent across all three layers
- Naming conventions (camelCase columns, PascalCase models, kebab-case files) are internally consistent

**Structure Alignment:**

The project structure fully supports every architectural decision:
- `routes/` → `services/` → `repositories/` maps directly to the 3-layer decision
- `plugins/cors.ts` and `plugins/error-handler.ts` support the CORS and error envelope decisions
- `schemas/` directory supports the Zod naming pattern
- Two separate Dockerfiles + `docker-compose.yml` support the separate-container decision
- `e2e/` at root (not inside either sub-project) supports the full-stack Playwright decision
- `frontend/src/lib/api-client.ts` as the single HTTP exit point supports the `VITE_API_URL` decision

---

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

| FR Category | Architectural Coverage | Status |
|---|---|---|
| Task Management (FR1–FR6c) | `todos` table (7 fields), `GET /todos/:id` for full entity, `GET /todos` for list | ✅ |
| Optimistic Interaction (FR12–FR16) | TanStack Query `onMutate`/`onError`/`onSettled`, `useRef` undo timer | ✅ |
| Filtering (FR8–FR11) | `GET /todos?filter=active`, `useTodos.ts` passes query param | ✅ |
| Soft-delete & Undo (FR27–FR29) | `deletedAt DateTime?`, all queries filter `deletedAt: null`, 5s client-side undo window | ✅ |
| API Contract (FR25–FR30) | 6 endpoints, `{ error, code }` envelope, HTTP status codes explicit | ✅ |
| Task Detail Deep-link | React Router `/todos/:id`, `TaskDetailModal` modal-as-route | ✅ |
| Observability/Logging (FR31–FR34) | Pino via Fastify, `request.log`, `reqId`, `userId: null` per log entry | ✅ |
| Quality Assurance (FR35–FR39) | Unit + integration + E2E (5 spec files), all layers mapped to structure | ✅ |

**Non-Functional Requirements Coverage:**

| NFR | Architectural Coverage | Status |
|---|---|---|
| Performance <200ms API | Fastify V5 (fastest Node.js framework), Prisma indexed queries, single-entity domain | ✅ |
| 2s initial page load | Vite SPA build, route-based code split, shadcn/ui tree-shakeable | ✅ |
| Accessibility WCAG 2.1 AA | shadcn/ui (Radix UI primitives — fully accessible by default), semantic HTML conventions | ✅ |
| Security (no internal error exposure) | Global `error-handler.ts` catches all; `{ error, code }` only — no stack traces to client | ✅ |
| Extensibility for auth (NFR13) | `userId String?` in schema from day one; auth middleware slot in `src/app.ts` | ✅ |
| Maintainability (≥70% coverage) | Unit + integration + E2E layers defined; `fastify.inject()` makes integration tests trivial | ✅ |

---

### Implementation Readiness Validation ✅

**Decision Completeness:**
All 12 critical decisions are documented with explicit rationale, version numbers, code/config examples, and Prisma schema snippet. Fastify V5 plugin version floor now documented. All critical+important gaps addressed.

**Structure Completeness:**
Step 6 directory tree names every file — components, hooks, routes, services, repositories, plugins, schemas, env files, test files, spec files, Docker and Compose files. An AI agent can derive all file names and locations without ambiguity.

**Pattern Completeness:**
All patterns are specified: naming conventions, error handling, structured logging with correlation IDs, optimistic mutation shape, undo-delete timer, `doneAt` toggle logic, `useTodo` cache seeding, test DB migration, layer responsibility boundaries.

---

### Gap Analysis Results

All gaps identified during validation have been resolved and documented in the architecture:

| Gap | Priority | Resolution |
|---|---|---|
| Fastify V5 plugin version floor | Important | Plugin version table added to Confirmed Stack section (`@fastify/cors@^9`, `@fastify/sensible@^6`, etc.) |
| `useTodo(id)` cache seeding pattern | Important | `initialData` + `initialDataUpdatedAt` pattern documented after Decision 3.1 |
| Test DB migration strategy | Important | `prisma migrate deploy` pretest pattern documented in Decision 4.3 |
| `doneAt` toggle logic | Nice-to-have | Service-layer-only transition logic documented in Process Patterns |

**No critical gaps remain.** All implementation-blocking decisions are fully specified.

---

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed (39 FRs across 8 categories)
- [x] Scale and complexity assessed (Low — single user, single entity, no auth)
- [x] Technical constraints identified (pre-scaffolded frontend, separate Docker containers, Postman testability requirement)
- [x] Cross-cutting concerns mapped (optimistic UI, structured logging, error envelope, test infrastructure, extensibility seams)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions (all 12 decisions, all versions pinned)
- [x] Technology stack fully specified (runtime, frontend, backend, DB, infra, E2E, plugin version floor)
- [x] Integration patterns defined (CORS, health check, env vars, Docker Compose, test isolation)
- [x] Performance considerations addressed (Fastify V5, optimistic UI, Vite build, `initialData` cache seeding)

**✅ Implementation Patterns**
- [x] Naming conventions established (DB, API, backend, frontend — complete tables)
- [x] Structure patterns defined (test file location, env file location, layer responsibilities)
- [x] Communication patterns specified (error envelope, API response shapes, no `{ data: ... }` wrapping)
- [x] Process patterns documented (soft-delete filter, logging correlation, `doneAt` logic, optimistic rollback)

**✅ Project Structure**
- [x] Complete directory structure defined (every file named in Step 6 tree)
- [x] Component/layer boundaries established (frontend/backend/DB boundary definitions)
- [x] Integration points mapped (data flow diagram, API contract table, requirements-to-structure mapping)
- [x] Requirements-to-structure mapping complete

---

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level: High** — Every decision is locked, all patterns are explicit and unambiguous, every project file is named in the structure, and all validation gaps have been closed. An AI agent implementing any story can proceed without architectural ambiguity.

**Key Strengths:**
- Clean 3-layer backend (route → service → repository) enables independent unit testing of each layer
- True soft-delete with mandatory `deletedAt: null` filter eliminates an entire class of data-loss bugs
- TanStack Query V5 optimistic mutation pattern with `onMutate` snapshot rollback is the most robust approach for the undo-delete requirement
- Fastify V5 + Pino structured logging with auto `reqId` satisfies all FR31–34 observability requirements at zero additional cost
- `useTodo(id)` `initialData` cache seeding eliminates loading flash on modal open
- React Router v7 modal-as-route pattern enables deep-linking without a full page reload

**Areas for Future Enhancement (post-v1, no structural changes required):**
- Authentication middleware — slot exists in `src/app.ts`; `userId String?` already in schema
- Rate limiting — Fastify plugin, zero structural change
- CDN/static hosting for Vite build — Dockerfile already present

---

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented — do not improvise alternatives
- Use Fastify V5-compatible plugins: `@fastify/cors@^9`, `@fastify/sensible@^6`, `@fastify/type-provider-zod@^4`
- Every `findMany` Prisma call **must** include `where: { deletedAt: null }` — no exceptions
- Use `request.log.*` (never `app.log.*`) for all per-request operations
- Include `userId: null` in every structured log entry in v1
- `useTodo(id)` must use `initialData` sourced from the `useTodos` query cache
- `doneAt` transitions (`now()` / `null`) must be managed in `todo.service.ts` only
- Run `prisma migrate deploy` against the test DB before executing integration tests

**First Implementation Priority:**
```bash
# Story 1: Backend scaffold + Prisma schema + initial migration
cd backend
npm init -y
npm install fastify @fastify/cors@^9 @fastify/sensible@^6 @fastify/type-provider-zod@^4
npm install prisma @prisma/client zod pino
npm install -D typescript vitest @types/node
npx prisma init --datasource-provider postgresql
# → define schema.prisma → npx prisma migrate dev --name init
```
