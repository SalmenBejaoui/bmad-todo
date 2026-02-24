# Story 1.1: Monorepo Root Workspace Setup

Status: done

## Story

As a developer,
I want a configured root workspace with unified scripts and environment files,
so that I can manage the entire application from a single root with consistent commands.

## Acceptance Criteria

1. **Given** the repository is cloned, **when** I run `npm install` at the root, **then** all frontend and backend workspace dependencies are installed.
2. **Given** env files are configured, **when** I run `npm run dev` at the root, **then** both the Vite frontend dev server (port 5173) and the Fastify backend (port 3000) start concurrently.
3. **Given** the project root `package.json`, **when** I inspect its scripts, **then** it contains `dev`, `test`, `test:e2e`, and `build` scripts that delegate to the appropriate sub-packages.
4. **Given** the project root, **when** I check `.env.example`, **then** it lists every required environment variable for all three layers (frontend, backend, database) with placeholder values and a comment describing each.
5. **Given** the project root, **when** I check `.gitignore`, **then** it includes `.env`, `node_modules/`, `dist/`, `frontend/dist/`, `backend/dist/`, and Prisma generated client files.

## Tasks / Subtasks

- [x] Task 1: Create root `package.json` with npm workspaces and unified scripts (AC: 1, 2, 3)
  - [x] 1.1: Define `workspaces: ["frontend", "backend"]`
  - [x] 1.2: Add `dev` script running both frontend and backend concurrently (use `concurrently` package)
  - [x] 1.3: Add `test` script delegating to `npm -w backend test`
  - [x] 1.4: Add `test:e2e` script delegating to Playwright in `e2e/`
  - [x] 1.5: Add `build` script delegating to both `frontend` and `backend` build scripts
- [x] Task 2: Create `frontend/` directory scaffold (AC: 1)
  - [x] 2.1: Initialised using `npm create vite@latest frontend -- --template react-ts`
  - [x] 2.2: `frontend/package.json` exists with name `frontend`
- [x] Task 3: Create `backend/` directory scaffold stub (AC: 1)
  - [x] 3.1: Ran `mkdir backend && cd backend && npm init -y` from inside `backend/`
  - [x] 3.2: `backend/package.json` exists with name `backend`
- [x] Task 4: Create `e2e/` directory stub (AC: 1)
  - [x] 4.1: `e2e/` directory created
- [x] Task 5: Create `.env.example` at project root (AC: 4)
  - [x] 5.1: All required env vars for all three layers added with placeholder values and comments
- [x] Task 6: Create `.gitignore` at project root (AC: 5)
  - [x] 6.1: Required entries added (project-specific entries appended to existing .gitignore)
- [x] Task 7: Confirm `concurrently` declared in root `devDependencies` as `"^9.0.0"` (AC: 2)
  - [x] 7.1: Declared in root `package.json`; installed automatically via `npm install`
- [x] Task 8: Verify workspace wiring (AC: 1, 2, 3)
  - [x] 8.1: `npm install` at root — no errors (201 packages, 0 vulnerabilities)
  - [x] 8.2: `npm run dev` — Vite frontend dev server confirmed started on port 5173 ✓ (backend `dev` warning expected per story; deferred to Story 1.2)
  - [x] 8.3: All four scripts confirmed in root `package.json` (`dev`, `test`, `test:e2e`, `build`)
- [x] Task 9: Create `.nvmrc` and add Node.js version enforcement (ARCH3)
  - [x] 9.1: `.nvmrc` created at project root with content `24`
  - [x] 9.2: `"engines": { "node": ">=24.0.0" }` added to root `package.json`

## Dev Notes

### Project Structure

The expected repository layout after this story completes:

```
bmad-todo/                        ← project root
├── frontend/                     ← Vite + React TS (already scaffolded with create-vite)
│   ├── src/
│   ├── package.json              ← name: "frontend"
│   └── ...
├── backend/                      ← stub only; full Fastify setup in Story 1.2
│   └── package.json              ← name: "backend" (npm init -y output)
├── e2e/                          ← empty stub; Playwright setup in Epic 4
├── .env.example                  ← committed; all vars with placeholders
├── .env                          ← gitignored; actual local values
├── .gitignore
└── package.json                  ← root workspace, workspaces: ["frontend","backend"]
```

[Source: architecture.md#Project Structure]

### Root `package.json` Shape

```json
{
  "name": "bmad-todo",
  "private": true,
  "workspaces": ["frontend", "backend"],
  "scripts": {
    "dev":      "concurrently \"npm -w frontend run dev\" \"npm -w backend run dev\"",
    "test":     "npm -w backend test",
    "test:e2e": "npx playwright test --config=e2e/playwright.config.ts",
    "build":    "npm -w frontend run build && npm -w backend run build"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

> ⚠️ `test:e2e` references `e2e/playwright.config.ts` which does not exist yet — this is expected. The script must be wired now and will be exercisable after Epic 4.
> [Source: architecture.md#ARCH2, epics.md#Story 1.1 AC3]

> ⚠️ The root `test` script intentionally delegates to the **backend only** in this story. Story 1.4 adds frontend Vitest; at that point expand to: `"test": "npm -w backend test && npm -w frontend test"`.

### `.env.example` — Complete Variable List

```dotenv
# ─── Frontend ───────────────────────────────────────────────────────────────
# Base URL of the backend API, consumed by Vite via import.meta.env.VITE_API_URL
VITE_API_URL=http://localhost:3000

# ─── Backend ────────────────────────────────────────────────────────────────
# Port the Fastify server listens on
PORT=3000

# Allowed CORS origin, read by @fastify/cors
ALLOWED_ORIGIN=http://localhost:5173

# ─── Database ───────────────────────────────────────────────────────────────
# PostgreSQL connection string for Prisma
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bmad_todo
```

> Each layer gets its own clearly labelled section. `VITE_` prefix is required for Vite to expose the variable to browser code via `import.meta.env`.
> [Source: architecture.md#Decision 2.3, Decision 3.3, Decision 4.3]

### `.gitignore` — Required Entries

```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
frontend/dist/
backend/dist/

# Environment files (never commit real secrets)
.env
.env.local
.env.*.local

# Prisma generated client
backend/node_modules/.prisma/
backend/src/generated/

# OS / Editor
.DS_Store
*.swp
.vscode/
```

> [Source: epics.md#Story 1.1 AC5, architecture.md#ARCH1]

### Node.js Version

Use **Node.js 24 LTS** for both frontend and backend. Task 9 creates `.nvmrc` and adds the `engines` field to enforce this:

```
# .nvmrc
24
```

```json
"engines": { "node": ">=24.0.0" }
```

[Source: architecture.md#ARCH3]

### `concurrently` Script Pattern

The `dev` script must start **both** sub-services simultaneously and show interleaved output. The pattern:

```bash
concurrently "npm -w frontend run dev" "npm -w backend run dev"
```

This requires:
1. `frontend/package.json` to have a `dev` script (`vite`)
2. `backend/package.json` to have a `dev` script (added in Story 1.2)

For Story 1.1, `npm run dev` may show a warning that `backend` has no `dev` script yet — this is acceptable. The wiring is validated in full in Story 1.2.

[Source: architecture.md#ARCH2]

### What This Story Does NOT Include

| Excluded | Handled In |
|---|---|
| Fastify installation, `app.ts`, `server.ts` | Story 1.2 |
| Prisma schema, migration, DB connection | Story 1.3 |
| Tailwind, shadcn/ui, TanStack Query, React Router install | Story 1.4 |
| Dockerfiles, docker-compose files | Epic 4 |
| Playwright config and E2E tests | Epic 4 |

> ⚠️ Do NOT add Fastify, Prisma, or any backend runtime dependencies in this story. The backend `package.json` stub needs only a `name` field and no dependencies. Story 1.2 owns all backend dependency installation.

### Acceptance Verification Commands

```bash
# AC1: workspace install works
npm install                       # no errors expected

# AC2: dev servers start
npm run dev                       # frontend on :5173, backend :3000 (backend dev script added Story 1.2)

# AC3: scripts exist
cat package.json | grep -A6 '"scripts"'   # must show dev, test, test:e2e, build

# AC4: env example complete
cat .env.example                  # must show VITE_API_URL, PORT, ALLOWED_ORIGIN, DATABASE_URL

# AC5: gitignore complete
cat .gitignore | grep -E "node_modules|\.env|backend/dist|frontend/dist|prisma"
```

### Project Structure Notes

- The project root is at `bmad-todo/` — this is the git repository root and npm workspace root.
- `frontend/` was already scaffolded with `npm create vite@latest frontend -- --template react-ts` per ARCH1. Do not re-run the vite scaffolding command; only verify it exists and has the correct `package.json` name.
- `backend/` needs only `npm init -y` followed by renaming the `name` field to `"backend"` in the generated `package.json`. All Fastify dependencies and source files are added in Story 1.2.
- npm workspaces requires both sub-packages to have a `package.json` present at time of root `npm install`. The `e2e/` directory does not need to be a workspace package — it is not listed in `workspaces`.

### References

- [Source: architecture.md#Starter Template Evaluation] — Initialization commands
- [Source: architecture.md#ARCH1] — `create-vite` already scaffolded; backend manual scaffold
- [Source: architecture.md#ARCH2] — Root `package.json` must include `dev`, `test`, `test:e2e`, `build`
- [Source: architecture.md#ARCH3] — Node.js 24 LTS
- [Source: architecture.md#Decision 2.3] — `ALLOWED_ORIGIN` env var
- [Source: architecture.md#Decision 3.3] — `VITE_API_URL` env var
- [Source: architecture.md#Decision 4.3] — `DATABASE_URL` env var
- [Source: epics.md#Story 1.1] — Full acceptance criteria

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

- Story created by SM (create-story workflow). No previous story learnings available (first story).
- Architecture confirms `frontend/` is already scaffolded — verify before touching.
- `backend/` stub only in this story; full Fastify setup deferred to Story 1.2.

### File List

- `package.json` — root workspace config (created)
- `package-lock.json` — lockfile (created)
- `frontend/` — Vite React TS scaffold (created via `npm create vite@latest`)
- `frontend/package.json`
- `frontend/vite.config.ts` — added explicit `server: { port: 5173 }` (modified in CR)
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/App.css`
- `frontend/src/index.css`
- `frontend/src/assets/react.svg`
- `frontend/index.html`
- `frontend/tsconfig.json`
- `frontend/tsconfig.app.json`
- `frontend/tsconfig.node.json`
- `frontend/eslint.config.js`
- `frontend/public/vite.svg`
- `frontend/.gitignore`
- `frontend/README.md`
- `backend/package.json` — stub with name, version, test script (created; `main` field removed in CR)
- `backend/tests/workspace.test.mjs` — 26 workspace integrity tests via `node:test` (created in QA)
- `e2e/.gitkeep` — ensures empty e2e/ directory is git-tracked (added in CR)
- `.env.example` — all 4 env vars with layered comments (created)
- `.gitignore` — project-specific entries appended (modified)
- `.nvmrc` — Node 24 pin (created)

### Senior Developer Review (AI)

**Reviewer:** GitHub Copilot (Claude Sonnet 4.6) — 2026-02-24
**Outcome:** ✅ APPROVED (after fixes)

| # | Severity | Finding | Fix Applied |
|---|---|---|---|
| H1 | 🔴 HIGH | `workspace.test.mjs` untracked by git (renamed from .js, new file never staged) | Staged `.mjs`, removed `.js` from index |
| H2 | 🔴 HIGH | Dev Agent Record → File List empty — no evidence of changes documented | Populated (this section) |
| H3 | 🔴 HIGH | `e2e/` empty directory not tracked by git — disappears on clone | Added `e2e/.gitkeep` |
| M2 | 🟡 MEDIUM | `backend/package.json` has `"main": "index.js"` pointing to non-existent file | Removed `main` field |
| L1 | 🟢 LOW | `frontend/vite.config.ts` no explicit port — relied on Vite default silently | Added `server: { port: 5173 }` |
| L2 | 🟢 LOW | `package.json` script values had extra alignment whitespace | Normalised spacing |

All ACs confirmed implemented. 26/26 tests pass post-fix.

### Change Log

| Date | Agent | Change |
|---|---|---|
| 2026-02-24 | Dev (DS) | Initial implementation — all 9 tasks completed |
| 2026-02-24 | QA | Added `backend/tests/workspace.test.mjs` — 26 integrity tests, all pass |
| 2026-02-24 | CR | Fixed 5 review findings; 26/26 tests still pass; story approved → done |