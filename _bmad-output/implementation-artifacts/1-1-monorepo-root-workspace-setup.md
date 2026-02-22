# Story 1.1: Monorepo Root Workspace Setup

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a configured root workspace with unified scripts and environment files,
So that I can manage the entire application from a single root with consistent commands.

## Acceptance Criteria

1. **Given** the repository is cloned, **When** I run `npm install` at the root, **Then** all frontend and backend workspace dependencies are installed.

2. **Given** env files are configured, **When** I run `npm run dev` at the root, **Then** both the Vite frontend dev server (port 5173) and the Fastify backend (port 3000) start concurrently.

3. **Given** the project root `package.json`, **When** I inspect its scripts, **Then** it contains `dev`, `test`, `test:e2e`, and `build` scripts that delegate to the appropriate sub-packages.

4. **Given** the project root, **When** I check `.env.example`, **Then** it lists every required environment variable for all three layers (frontend, backend, database) with placeholder values and a comment describing each.

5. **Given** the project root, **When** I check `.gitignore`, **Then** it includes `.env`, `node_modules/`, `dist/`, `frontend/dist/`, `backend/dist/`, and Prisma generated client files.

## Tasks / Subtasks

- [ ] Task 1: Create root `package.json` with npm workspaces and unified scripts (AC: 1, 2, 3)
  - [ ] Set `"workspaces": ["frontend", "backend"]` to enable npm workspaces
  - [ ] Add `dev` script: run `concurrently` to start both Vite (port 5173) and Fastify (port 3000)
  - [ ] Add `test` script: delegate to `npm run test --workspaces --if-present`
  - [ ] Add `test:e2e` script: run Playwright from `e2e/` directory
  - [ ] Add `build` script: delegate to `npm run build --workspaces --if-present`
  - [ ] Install `concurrently` as a root dev dependency
- [ ] Task 2: Create `.env.example` at project root (AC: 4)
  - [ ] Include `DATABASE_URL` with placeholder and comment (backend / Prisma)
  - [ ] Include `PORT` with placeholder and comment (backend server port, default 3000)
  - [ ] Include `ALLOWED_ORIGIN` with placeholder and comment (CORS origin for backend)
  - [ ] Include `VITE_API_URL` with placeholder and comment (frontend API base URL)
- [ ] Task 3: Create/update `.gitignore` at project root (AC: 5)
  - [ ] Ensure `.env` (all variants) is ignored
  - [ ] Ensure `node_modules/` is ignored (root and sub-packages)
  - [ ] Ensure `dist/`, `frontend/dist/`, `backend/dist/` are ignored
  - [ ] Ensure Prisma generated client files (`backend/node_modules/.prisma`, `backend/src/generated`) are ignored
- [ ] Task 4: Create placeholder directory stubs for sub-packages (ARCH1)
  - [ ] Create `frontend/` directory with minimal `package.json` if not already scaffolded
  - [ ] Create `backend/` directory with minimal `package.json` if not already present
  - [ ] Create `e2e/` directory stub at root
- [ ] Task 5: Verify `npm install` from root installs all workspace dependencies (AC: 1)

## Dev Notes

### Root `package.json` Requirements

- **Workspaces:** `"workspaces": ["frontend", "backend"]` — enables npm v7+ workspaces so a single `npm install` at root installs all dependencies for both sub-packages. [Source: architecture.md#Selected-Starter]
- **`dev` script:** Use `concurrently` to run both servers in parallel:
  ```json
  "dev": "concurrently \"npm run dev --workspace=frontend\" \"npm run dev --workspace=backend\""
  ```
- **`test` script:** Delegate to workspaces:
  ```json
  "test": "npm run test --workspaces --if-present"
  ```
- **`test:e2e` script:** Run Playwright from `e2e/`:
  ```json
  "test:e2e": "playwright test"
  ```
- **`build` script:** Delegate to workspaces:
  ```json
  "build": "npm run build --workspaces --if-present"
  ```
- **`concurrently`**: Install as `devDependency` at root — used only for the `dev` script to fan out both dev servers. [Source: architecture.md#ARCH2]

### `.env.example` Required Variables

All three layers must be represented with placeholder values and inline comments:

```dotenv
# Backend — Prisma database connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bmad_todo

# Backend — HTTP server port (default: 3000)
PORT=3000

# Backend — CORS allowed origin (frontend dev server URL)
ALLOWED_ORIGIN=http://localhost:5173

# Frontend — Vite API base URL (Vite bakes this at build time via import.meta.env.VITE_API_URL)
VITE_API_URL=http://localhost:3000
```

[Source: architecture.md#Decision-4.3, architecture.md#Decision-3.3]

> **Critical:** `VITE_*` prefix is mandatory for Vite to expose the variable at build time via `import.meta.env`. Plain `API_URL` will be `undefined` at runtime. [Source: architecture.md#Frontend-Boundary]

### `.gitignore` Required Entries

```
# Secrets
.env
.env.*
!.env.example

# Dependencies
node_modules/

# Build output
dist/
frontend/dist/
backend/dist/

# Prisma generated client
backend/node_modules/.prisma/
backend/src/generated/
```

[Source: architecture.md#Decision-4.3, epics.md#Story-1.1-AC5]

### Project Structure Notes

The full expected directory layout after all Epic 1 stories (for orientation):

```
bmad-todo/
├── package.json            ← THIS STORY: root workspace scripts + concurrently
├── .env.example            ← THIS STORY: all env var placeholders
├── .gitignore              ← THIS STORY: covers .env, node_modules, dist, prisma generated
├── frontend/               ← stub in this story; fully scaffolded in Story 1.4
│   └── package.json
├── backend/                ← stub in this story; scaffolded in Story 1.2
│   └── package.json
├── e2e/                    ← empty directory stub
├── docker-compose.yml      ← Story 4.1
└── docker-compose.test.yml ← Story 4.1
```

[Source: architecture.md#Complete-Project-Directory-Structure]

### Sub-package `package.json` Minimum Requirements (stubs only — full content in later stories)

**`frontend/package.json`** (already scaffolded by `npm create vite@latest frontend -- --template react-ts` per ARCH1 — verify it exists):
- Must have `"name": "frontend"` so npm workspaces can reference it
- Scripts `dev` and `build` must exist (Vite scaffold provides these)

**`backend/package.json`** (created by `npm init -y` per ARCH1 — will be fully populated in Story 1.2):
- Must have `"name": "backend"` for workspace resolution
- Ensure a `dev` script placeholder exists (e.g. `"dev": "echo 'backend dev not yet configured'"`) so the root `dev` script does not fail before Story 1.2

### Node.js Version

- Node.js **24 LTS** — both frontend and backend (ARCH3). Add `"engines": { "node": ">=24" }` to root `package.json` for tooling enforcement.

### Anti-patterns to Avoid

- ❌ Do NOT create a `tailwind.config.js` — Tailwind V4 uses CSS-first `@theme {}` config only [Source: architecture.md#ARCH4]
- ❌ Do NOT hardcode `localhost:3000` anywhere — use `VITE_API_URL` env var [Source: architecture.md#Anti-patterns]
- ❌ Do NOT use `process.env` in frontend source — use `import.meta.env.VITE_*` [Source: architecture.md#Frontend-Boundary]

### References

- [Source: architecture.md#Selected-Starter] — Initialization commands and starter template
- [Source: architecture.md#ARCH1] — `npm create vite` frontend + manual backend scaffold
- [Source: architecture.md#ARCH2] — Root `package.json` workspace scripts requirement
- [Source: architecture.md#ARCH3] — Node.js 24 LTS runtime
- [Source: architecture.md#Decision-4.3] — `.env` gitignored, `.env.example` committed
- [Source: architecture.md#Decision-3.3] — `VITE_API_URL` env var
- [Source: architecture.md#Complete-Project-Directory-Structure] — Full project layout
- [Source: epics.md#Story-1.1] — Acceptance criteria and user story

## Dev Agent Record

### Agent Model Used

BMad SM Agent (Bob) — story created 2026-02-22

### Debug Log References

### Completion Notes List

### File List
