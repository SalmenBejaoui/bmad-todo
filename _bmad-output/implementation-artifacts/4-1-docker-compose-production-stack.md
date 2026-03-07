# Story 4.1: Docker Compose Production Stack

## Status: done

## Story

As a DevOps engineer,
I want a fully containerised production stack I can start with a single `docker compose up` command,
So that I can deploy the complete application — frontend, backend, and database — without knowledge of undocumented conventions or decisions.

## Acceptance Criteria

1. `frontend/Dockerfile` and `backend/Dockerfile` use multi-stage builds (build stage + lean production stage), run as non-root users, and expose correct ports (5173 for frontend served via nginx, 3000 for backend).
2. `docker-compose.yml` defines three services — `frontend`, `backend`, `postgres` — with a named volume for PostgreSQL data persistence, health checks on `backend` (via `GET /health`) and `postgres`, environment variables from `.env`, and `depends_on` with `condition: service_healthy`.
3. With `docker compose up` and all env vars set, frontend is reachable, `GET /health` returns `{ "status": "ok", "timestamp": "..." }`, and the database is accepting connections.
4. `docker-compose.test.yml` defines an isolated `postgres-test` service with a separate database name, used exclusively by integration and E2E tests.
5. `backend/package.json` `pretest` script runs `prisma migrate deploy` against `DATABASE_URL` from `.env.test` before any test file executes.

## Tasks / Subtasks

- [ ] Task 1: Create `frontend/Dockerfile` (AC: #1)
  - [ ] Stage 1 (build): Node 24 Alpine, copy package files, npm ci, npm run build
  - [ ] Stage 2 (prod): nginx:alpine, copy built assets from stage 1, non-root user, expose 80 (nginx serves SPA)
  - [ ] Add nginx.conf for SPA routing (try_files fallback)

- [ ] Task 2: Create `backend/Dockerfile` (AC: #1)
  - [ ] Stage 1 (build): Node 24 Alpine, copy package files, npm ci, generate Prisma client, tsc build
  - [ ] Stage 2 (prod): Node 24 Alpine slim, copy dist + node_modules, non-root user, expose 3000

- [ ] Task 3: Create `docker-compose.yml` (AC: #2, #3)
  - [ ] postgres service: postgres:16-alpine, named volume, healthcheck
  - [ ] backend service: depends_on postgres (service_healthy), healthcheck on /health, env vars
  - [ ] frontend service: depends_on backend (service_healthy), env vars

- [ ] Task 4: Create `docker-compose.test.yml` (AC: #4)
  - [ ] postgres-test service: isolated database, separate port (5433), named volume

- [ ] Task 5: Verify/update `backend/package.json` pretest script (AC: #5)
  - [ ] Confirm `db:migrate:test` or add `pretest` that runs prisma migrate deploy against .env.test

## Dev Notes

### Docker Architecture

**Frontend container:**
- Multi-stage: Node 24 Alpine for build, `nginx:alpine` for serving
- Build stage: `npm ci`, `npm run build` → outputs to `/app/dist`
- Prod stage: nginx serves `dist/` as static files on port 80
- nginx.conf must handle React Router SPA routing: `try_files $uri $uri/ /index.html`
- Non-root: `USER nginx` (nginx image already runs as nginx user)
- `VITE_API_URL` must be passed as build arg during docker build (baked into the SPA bundle)

**Backend container:**
- Multi-stage: Node 24 Alpine for both stages (keep slim)
- Build stage: `npm ci --include=dev`, generate Prisma client, `tsc`
- Prod stage: copy `dist/`, `node_modules/` (production only), `prisma/` directory (needed for migrations)
- Non-root: create `node` user group, use `USER node`
- `CMD ["node", "dist/server.js"]`
- Expose port 3000

**PostgreSQL:**
- Image: `postgres:16-alpine`
- Named volume: `postgres-data`
- Healthcheck: `pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}`
- Environment: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` from `.env`

### docker-compose.yml Design

```yaml
services:
  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment: (from .env)
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3000/health || exit 1"]
    environment: (from .env)

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: # from .env
    depends_on:
      backend:
        condition: service_healthy
    ports:
      - "80:80"
```

### docker-compose.test.yml Design
- Only defines `postgres-test` service
- Port: 5433 (avoids conflict with dev postgres on 5432)
- Database: `bmad_todo_test`
- No volume (ephemeral; use `tmpfs` or standard for speed)

### Existing pretest setup
- The `backend/package.json` already has `db:migrate:test` script
- Need to add a proper `pretest` that executes migration

### References

- Architecture: ARCH20, ARCH21, ARCH15 [architecture.md]
- Decision 4.1 (health checks), Decision 4.3 (database config) [architecture.md]
- FR38 (tests integrated into workflow) [epics.md]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

- frontend/Dockerfile: multi-stage (Node 24 Alpine build + nginx:alpine prod), VITE_API_URL build arg, nginx serves SPA on port 80
- backend/Dockerfile: multi-stage (Node 24 Alpine both stages), prisma generate + tsc, cp src/generated to dist/generated, non-root node user, port 3000
- frontend/nginx.conf: SPA routing with try_files fallback, gzip, static asset caching
- docker-compose.yml: postgres (healthcheck), backend (depends_on postgres healthy, healthcheck on /health), frontend (depends_on backend healthy)
- docker-compose.test.yml: postgres-test on port 5433 with bmad_todo_test database
- backend/package.json: pretest script added to call db:migrate:test before vitest run
- .env.example: added POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB for Docker Compose

### File List

- frontend/Dockerfile
- frontend/nginx.conf
- backend/Dockerfile
- docker-compose.yml
- docker-compose.test.yml
- backend/package.json (pretest added)
- frontend/.dockerignore
- backend/.dockerignore

**Code review fixes applied:** fixed frontend Dockerfile to use specific COPY commands (avoids node_modules overwrite); simplified backend Dockerfile by removing redundant prisma generate step; added .dockerignore files to both services.
