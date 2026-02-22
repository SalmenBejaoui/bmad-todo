# bmad-todo — Copilot Coding Agent Instructions

## Project Overview

**bmad-todo** is a full-stack, single-user task management web application.  
Stack: **React 19 SPA** (Vite 7, TypeScript 5, Tailwind CSS v4, shadcn/ui, TanStack Query v5, React Router v7) + **Fastify v5 REST API** (TypeScript, Zod, Prisma, Pino) + **PostgreSQL 16**.  
Runtime: **Node.js ≥ 24** (enforced via `engines` in root `package.json`).  
Monorepo managed with **npm workspaces** (`frontend/`, `backend/`).  
E2E tests use **Playwright** from the `e2e/` directory.

---

## Repository Structure

```
bmad-todo/
├── .github/
│   ├── copilot-instructions.md   # this file
│   ├── agents/                   # Copilot agent definition files
│   └── prompts/                  # Copilot prompt files
├── frontend/                     # React SPA (Vite, TypeScript)
│   ├── src/
│   │   ├── components/           # AppHeader, TaskList, TaskRow, AddTaskModal, TaskDetailModal, …
│   │   ├── hooks/                # useTodos, useCreateTodo, useToggleTodo, useDeleteTodo
│   │   ├── lib/                  # api-client.ts, query-client.ts
│   │   └── types/                # Todo, ApiError shared types
│   ├── tests/                    # co-located *.test.tsx / *.test.ts unit tests
│   └── package.json
├── backend/                      # Fastify REST API (TypeScript)
│   ├── src/
│   │   ├── routes/               # todo.routes.ts (thin Fastify handlers)
│   │   ├── services/             # todo.service.ts (business logic)
│   │   ├── repositories/         # todo.repository.ts (Prisma wrapper)
│   │   ├── plugins/              # error-handler.ts, health.ts
│   │   ├── schemas/              # Zod schemas + JSON Schema for Fastify validation
│   │   └── app.ts                # Fastify instance factory
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tests/
│   │   ├── unit/                 # service + repository unit tests (Vitest)
│   │   └── integration/          # route tests via fastify.inject() (Vitest)
│   └── package.json
├── e2e/                          # Playwright E2E tests (run against full Docker stack)
├── docker-compose.yml            # three services: frontend, backend, postgres
├── docker-compose.test.yml       # isolated postgres-test service for integration tests
├── .env.example                  # copy to .env; DATABASE_URL, PORT, ALLOWED_ORIGIN, VITE_API_URL
└── package.json                  # root workspace: scripts dev, test, test:e2e, build
```

---

## Environment Setup

1. Copy `.env.example` to `.env` and fill in values (defaults work for local dev with Docker).
2. Always run `npm install` from the **repo root** before building or testing.
3. Start the full stack: `docker compose up` (or `npm run dev` for local dev without Docker).

---

## Build, Test & Run Commands

Always run these from the **repo root** unless stated otherwise.

| Purpose | Command |
|---|---|
| Install dependencies | `npm install` |
| Start all services (dev) | `npm run dev` |
| Build all workspaces | `npm run build` |
| Run all unit/integration tests | `npm test` |
| Run E2E tests (requires full stack) | `npm run test:e2e` |
| Backend only — dev | `npm run dev --workspace=backend` |
| Frontend only — dev | `npm run dev --workspace=frontend` |
| Apply Prisma migrations | `npx prisma migrate deploy --schema=backend/prisma/schema.prisma` |

> **Note:** Backend integration tests require a running PostgreSQL instance.  
> Set `DATABASE_URL` to a test database before running; never run integration tests against the dev database.  
> Use `docker-compose.test.yml` to start an isolated `postgres-test` service.

---

## Key Architectural Decisions

- **API endpoints:** `GET /todos`, `GET /todos/:id`, `POST /todos`, `PATCH /todos/:id`, `DELETE /todos/:id`, `GET /health` — no `/api` prefix.
- **Error envelope:** All API errors return `{ error: string, code?: string }`. Never expose stack traces or internal paths.
- **Soft delete:** Records are never physically deleted; `deletedAt` is set. All list/detail queries filter `WHERE deletedAt IS NULL`.
- **Optimistic UI:** All mutations are optimistic with rollback via TanStack Query `onMutate`/`onError`/`onSettled`. Delete has a 5-second client-side undo window before the API call fires.
- **Frontend routing:** React Router v7, modal-as-route pattern (`/` = list, `/todos/:id` = list + detail modal).
- **State management:** TanStack Query for server state; `useState`/`useRef` only for local UI state (no Zustand).
- **`useTodo(id)`** must use `initialData` seeded from the `useTodos` query cache to avoid loading flashes.
- **CORS:** Configured via `ALLOWED_ORIGIN` env var in `@fastify/cors`.
- **API base URL:** `VITE_API_URL` env var, prepended by `lib/api-client.ts`.
- **Fastify v5 plugins:** Use `@fastify/cors ≥9`, `@fastify/sensible ≥6`, `@fastify/type-provider-zod ≥4`, `fastify-plugin ≥5`. V4-era plugins silently fail in Fastify v5.
- **Prisma schema:** `Todo` model has `userId String?` (nullable, reserved for future auth — never read/written in v1).
- **UUIDs:** Primary keys use UUID v4 (`@default(uuid())`).
- **Logging:** Pino (built into Fastify) — structured JSON logging on every create/update/delete/error operation.
- **Extensibility:** `userId` nullable column is in the initial migration. Auth middleware slots in later without schema changes.

---

## Coding Conventions

**Files:**
- Backend source files: `kebab-case.ts` (e.g. `todo.routes.ts`, `todo.service.ts`)
- Frontend component files: `PascalCase.tsx` (e.g. `TaskRow.tsx`)
- Frontend hook files: `camelCase.ts` with `use` prefix (e.g. `useTodos.ts`)
- Frontend utility files: `kebab-case.ts` (e.g. `api-client.ts`)

**Naming:**
- Classes: `PascalCase` (`TodoService`, `TodoRepository`)
- Functions/methods: `camelCase`, verb-first (`createTodo()`, `findById()`, `softDelete()`)
- Constants: `SCREAMING_SNAKE_CASE`
- Zod schemas: `camelCase` + `Schema` suffix (`createTodoSchema`, `patchTodoSchema`)
- DB model names: `PascalCase` (`Todo`); column names: `camelCase` (`createdAt`, `deletedAt`)
- API JSON response fields: `camelCase`

**Testing:**
- Backend unit tests: `backend/tests/unit/` — filename mirrors source (`todo.service.test.ts`)
- Backend integration tests: `backend/tests/integration/` — use `fastify.inject()`, never a live port
- Frontend tests: co-located as `*.test.tsx` / `*.test.ts` next to source files
- E2E tests: `e2e/` directory, Playwright
- Coverage target: ≥ 70% meaningful coverage

**Architecture layers (backend):** routes (thin handlers) → services (business logic) → repositories (Prisma wrapper). Each layer is independently testable via dependency injection.

---

<!-- BMAD:START -->
# BMAD Method — Project Instructions

## Project Configuration

- **Project**: bmad-todo
- **User**: Salmen
- **Communication Language**: English
- **Document Output Language**: English
- **User Skill Level**: intermediate
- **Output Folder**: {project-root}/_bmad-output
- **Planning Artifacts**: {project-root}/_bmad-output/planning-artifacts
- **Implementation Artifacts**: {project-root}/_bmad-output/implementation-artifacts
- **Project Knowledge**: {project-root}/docs

## BMAD Runtime Structure

- **Agent definitions**: `_bmad/bmm/agents/` (BMM module) and `_bmad/core/agents/` (core)
- **Workflow definitions**: `_bmad/bmm/workflows/` (organized by phase)
- **Core tasks**: `_bmad/core/tasks/` (help, editorial review, indexing, sharding, adversarial review)
- **Core workflows**: `_bmad/core/workflows/` (brainstorming, party-mode, advanced-elicitation)
- **Workflow engine**: `_bmad/core/tasks/workflow.xml` (executes YAML-based workflows)
- **Module configuration**: `_bmad/bmm/config.yaml`
- **Core configuration**: `_bmad/core/config.yaml`
- **Agent manifest**: `_bmad/_config/agent-manifest.csv`
- **Workflow manifest**: `_bmad/_config/workflow-manifest.csv`
- **Help manifest**: `_bmad/_config/bmad-help.csv`
- **Agent memory**: `_bmad/_memory/`

## Key Conventions

- Always load `_bmad/bmm/config.yaml` before any agent activation or workflow execution
- Store all config fields as session variables: `{user_name}`, `{communication_language}`, `{output_folder}`, `{planning_artifacts}`, `{implementation_artifacts}`, `{project_knowledge}`
- MD-based workflows execute directly — load and follow the `.md` file
- YAML-based workflows require the workflow engine — load `workflow.xml` first, then pass the `.yaml` config
- Follow step-based workflow execution: load steps JIT, never multiple at once
- Save outputs after EACH step when using the workflow engine
- The `{project-root}` variable resolves to the workspace root at runtime

## Available Agents

| Agent | Persona | Title | Capabilities |
|---|---|---|---|
| bmad-master | BMad Master | BMad Master Executor, Knowledge Custodian, and Workflow Orchestrator | runtime resource management, workflow orchestration, task execution, knowledge custodian |
| analyst | Mary | Business Analyst | market research, competitive analysis, requirements elicitation, domain expertise |
| architect | Winston | Architect | distributed systems, cloud infrastructure, API design, scalable patterns |
| dev | Amelia | Developer Agent | story execution, test-driven development, code implementation |
| pm | John | Product Manager | PRD creation, requirements discovery, stakeholder alignment, user interviews |
| qa | Quinn | QA Engineer | test automation, API testing, E2E testing, coverage analysis |
| quick-flow-solo-dev | Barry | Quick Flow Solo Dev | rapid spec creation, lean implementation, minimum ceremony |
| sm | Bob | Scrum Master | sprint planning, story preparation, agile ceremonies, backlog management |
| tech-writer | Paige | Technical Writer | documentation, Mermaid diagrams, standards compliance, concept explanation |
| ux-designer | Sally | UX Designer | user research, interaction design, UI patterns, experience strategy |

## Slash Commands

Type `/bmad-` in Copilot Chat to see all available BMAD workflows and agent activators. Agents are also available in the agents dropdown.
<!-- BMAD:END -->
