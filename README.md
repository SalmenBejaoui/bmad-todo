# bmad-todo

A full-stack task management application built with React, Fastify, PostgreSQL, and Playwright — implementing optimistic UI, soft-delete with undo, and a Docker Compose production stack.

---

## Documentation

Implementation-focused project documentation lives in [docs/index.md](./docs/index.md).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                     │
│  React 19 + Vite + TanStack Query + React Router v7         │
│  (SPA served by nginx in production)                         │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP REST (/todos, /health)
┌────────────────────────▼────────────────────────────────────┐
│  Fastify V5 API Server (Node 24)                             │
│  Route → Service → Repository (strict 3-layer separation)   │
│  Zod validation · Pino structured logging · @fastify/cors   │
└────────────────────────┬────────────────────────────────────┘
                         │ Prisma (driver adapter)
┌────────────────────────▼────────────────────────────────────┐
│  PostgreSQL 16                                               │
│  Single `todos` table · soft-delete (deletedAt) · UUID PKs  │
└─────────────────────────────────────────────────────────────┘
```

### Key Decisions

| Concern | Decision |
|---|---|
| Backend layers | **Route → Service → Repository** — thin handlers, business logic in service, all Prisma calls in repository |
| Soft-delete | Records are **never physically deleted**; `deletedAt` is set; all queries filter `WHERE deletedAt IS NULL` |
| Optimistic UI | TanStack Query `onMutate` snapshots + rollback on error for create, toggle, and delete |
| Undo-delete | 5-second client-side timer; if Undo is clicked the DELETE API call is cancelled entirely |
| Frontend routing | React Router v7 **modal-as-route** — detail modal opens at `/todos/:id`, list stays behind |
| Error envelope | All API errors return `{ error: string, code?: string }` — no stack traces exposed |
| Containerisation | Docker Compose with **3 services** (postgres, backend, frontend) and health-check startup ordering |

---

## Prerequisites

- **Node.js 24+** — [install via nvm](https://github.com/nvm-sh/nvm): `nvm install 24 && nvm use 24`
- **Docker + Docker Compose** — [install Docker Desktop](https://www.docker.com/products/docker-desktop)
- **PostgreSQL 16** (local dev only) — or use the Docker Compose test DB for running tests

---

## Local Development

### 1 — Clone and install

```bash
git clone https://github.com/SalmenBejaoui/bmad-todo.git
cd bmad-todo
npm install
```

### 2 — Configure environment

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL to your local PostgreSQL instance
# Defaults work if PostgreSQL runs on localhost:5432 with user/password "postgres"
```

Create the backend development environment file:

```bash
cat > backend/.env.development << 'EOF'
PORT=3000
ALLOWED_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bmad_todo
EOF
# Edit if your local PostgreSQL credentials differ
```

### 3 — Set up the database

Ensure PostgreSQL is running, then apply the Prisma migration:

```bash
cd backend
npx prisma migrate dev --name init
cd ..
```

### 4 — Start the full stack

```bash
npm run dev
```

This starts both services concurrently:
- **Frontend** — Vite dev server at `http://localhost:5173`
- **Backend** — Fastify at `http://localhost:3000`

Verify the backend is healthy:

```bash
curl http://localhost:3000/health
# → {"status":"ok","timestamp":"2026-03-07T..."}
```

---

## Running Tests

### Unit & Integration Tests (backend + frontend)

```bash
npm test
```

This runs:
1. **Backend** — `vitest run` (unit tests for service/repository + integration tests via `fastify.inject()`)
2. **Frontend** — `vitest run` (component and hook tests with React Testing Library)

> **Note:** Backend integration tests require a running test PostgreSQL instance. Start one with `docker compose -f docker-compose.test.yml up -d` before running `npm test`. Prisma migrations are applied automatically via the `pretest` hook.

### E2E Tests (Playwright)

```bash
# 1. Start the full application (dev or production via Docker Compose)
npm run dev   # or: docker compose up --build

# 2. Install Playwright browser (first time only)
cd e2e && npm run install:browsers && cd ..

# 3. Run all E2E tests
npm run test:e2e
```

By default, Playwright targets `http://localhost` (Docker Compose nginx port 80).  
Override for dev server: `PLAYWRIGHT_BASE_URL=http://localhost:5173 npm run test:e2e`

The suite covers 5 spec files with 9 tests:
- `empty-state.spec.ts` — empty list message
- `create-todo.spec.ts` — create with title + description
- `complete-todo.spec.ts` — toggle completion
- `delete-todo.spec.ts` — delete with undo toast
- `task-detail.spec.ts` — detail modal + mark as done

---

## Production Deployment (Docker Compose)

### 1 — Configure production environment

```bash
cp .env.example .env
```

Edit `.env` and set:

| Variable | Description |
|---|---|
| `VITE_API_URL` | The public URL of the backend, as seen from the browser. E.g. `http://your-server:3000` |
| `ALLOWED_ORIGIN` | The frontend origin for CORS. E.g. `http://your-server` |
| `DATABASE_URL` | PostgreSQL connection string. For Docker Compose, use `postgresql://postgres:<password>@postgres:5432/bmad_todo` |
| `POSTGRES_USER` | PostgreSQL superuser name |
| `POSTGRES_PASSWORD` | PostgreSQL superuser password |
| `POSTGRES_DB` | Database name (default: `bmad_todo`) |

### 2 — Build and start

```bash
docker compose up --build -d
```

This starts all three services in dependency order:
1. `postgres` — PostgreSQL 16 with named volume
2. `backend` — Fastify API (waits for postgres health check)
3. `frontend` — nginx serving the built SPA (waits for backend health check)

### 3 — Apply database migrations

On first deployment (or after schema changes):

```bash
docker compose exec backend node node_modules/.bin/prisma migrate deploy
```

### 4 — Verify

```bash
curl http://localhost:3000/health
# → {"status":"ok","timestamp":"..."}
```

The frontend SPA is served at `http://localhost` (port 80).

### 5 — Stop

```bash
docker compose down          # stop containers
docker compose down -v       # also remove the postgres data volume
```

---

## Environment Variables Reference

All variables are listed in `.env.example`. Copy it to `.env` and fill in values before starting.

### Frontend

| Variable | Purpose | Default (dev) |
|---|---|---|
| `VITE_API_URL` | Base URL of the Fastify backend API, prepended to every API call | `http://localhost:3000` |

### Backend

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Port the Fastify server listens on | `3000` |
| `ALLOWED_ORIGIN` | Frontend origin allowed by `@fastify/cors` | `http://localhost:5173` |
| `DATABASE_URL` | Prisma PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/bmad_todo` |

### Docker Compose

| Variable | Purpose | Default |
|---|---|---|
| `POSTGRES_USER` | PostgreSQL superuser username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL superuser password | `postgres` |
| `POSTGRES_DB` | PostgreSQL database name created on first start | `bmad_todo` |

### Test Environment (`backend/.env.test`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Points to isolated test PostgreSQL instance (`bmad_todo_test`) |
| `LOG_LEVEL` | Set to `silent` to suppress Pino output during tests |
| `PORT` | Test server port (`3001`) to avoid conflict with dev server |

---

## Project Structure

```
bmad-todo/
├── package.json              # Root workspace: dev, test, test:e2e, build
├── docker-compose.yml        # Production: frontend + backend + postgres
├── docker-compose.test.yml   # Test: isolated postgres-test on port 5433
├── .env.example              # Template: all required env vars with comments
│
├── frontend/                 # React 19 SPA (Vite + Tailwind V4 + shadcn/ui)
│   ├── src/
│   │   ├── components/       # UI components (AppHeader, TaskList, TaskRow, modals…)
│   │   ├── hooks/            # TanStack Query hooks (useTodos, useCreateTodo…)
│   │   ├── lib/              # api-client.ts, query-client.ts
│   │   └── types/            # Shared TypeScript types
│   └── Dockerfile            # Multi-stage: Node 24 build + nginx production
│
├── backend/                  # Fastify V5 API (Node 24 + Prisma + Zod)
│   ├── src/
│   │   ├── routes/           # Thin Fastify handlers (no business logic)
│   │   ├── services/         # Business logic (todo.service.ts)
│   │   ├── repositories/     # All Prisma calls (todo.repository.ts)
│   │   └── plugins/          # error-handler.ts, health.ts
│   ├── prisma/
│   │   └── schema.prisma     # Todo model: 9 fields, soft-delete, nullable userId
│   ├── tests/
│   │   ├── unit/             # Service + repository tests (mocked Prisma)
│   │   └── integration/      # Route tests via fastify.inject()
│   └── Dockerfile            # Multi-stage: Node 24 build + production
│
└── e2e/                      # Playwright E2E tests
    ├── playwright.config.ts
    ├── helpers/api.ts         # Test setup/teardown utilities
    └── tests/                # 5 spec files covering the full user journey
```

---

## API Endpoints

| Method | Path | Description | Status |
|---|---|---|---|
| `GET` | `/todos` | List all active todos | 200 |
| `GET` | `/todos/:id` | Get single todo by ID | 200 / 404 |
| `POST` | `/todos` | Create todo (`title` required, `description` optional) | 201 |
| `PATCH` | `/todos/:id` | Toggle completion status | 200 |
| `DELETE` | `/todos/:id` | Soft-delete (sets `deletedAt`) | 204 |
| `GET` | `/health` | Health check | 200 |

All error responses: `{ "error": "message", "code": "ERROR_CODE" }`
