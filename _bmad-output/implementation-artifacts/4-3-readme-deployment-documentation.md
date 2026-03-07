# Story 4.3: README & Deployment Documentation

## Status: done

## Story

As a DevOps engineer or new developer,
I want a README that fully documents the project architecture, setup, and deployment steps,
So that I can get the application running in any environment and diagnose operational issues without reverse-engineering the codebase.

## Acceptance Criteria

1. Root `README.md` contains: project overview, architecture summary (frontend/backend/database separation, key tech decisions), prerequisites, local development setup, running tests, production deployment via Docker Compose, and environment variables reference.
2. Every variable in `.env.example` is documented with purpose, accepted values, and default.
3. A developer with Node.js 24 + Docker can follow the README from clone to running app using `npm run dev` with no undocumented steps.
4. `npm test` and `npm run test:e2e` are documented in the README test section.
5. README architecture section conveys: the 3-layer backend pattern, soft-delete strategy, optimistic UI approach, and Docker Compose service topology.

## Tasks / Subtasks

- [ ] Task 1: Create root `README.md` (AC: #1 - #5)
  - [ ] Project overview section
  - [ ] Architecture summary section
  - [ ] Prerequisites section
  - [ ] Local development setup (step-by-step)
  - [ ] Running tests section
  - [ ] Production deployment via Docker Compose
  - [ ] Environment variables reference

## Dev Notes

The README should be comprehensive but concise. Reference existing files (architecture.md, .env.example) for technical accuracy. All commands must be verified against actual package.json scripts.

### References
- Architecture decisions [planning-artifacts/architecture.md]
- Epic 4 Story 4.3 ACs [epics.md#910]
- .env.example for env var documentation

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

- README.md created at repo root with all 7 required sections
- Architecture section: 3-layer pattern, soft-delete, optimistic UI, Docker topology
- Prerequisites: Node 24 + Docker
- Local dev: step-by-step from clone to npm run dev
- Test section: npm test (backend+frontend) + npm run test:e2e with Playwright setup instructions
- Production deployment: docker compose up --build, prisma migrate deploy command
- Env vars table: all variables from .env.example documented with purpose and defaults
- Project structure tree included
- API endpoints table included

### File List

- README.md (created at project root)

**Code review fixes (applied automatically):**
- Fixed README local dev instructions: `backend/.env.development` is gitignored, added `cat > backend/.env.development` command so users can create it from scratch
- Fixed `db:migrate:test` script: replaced broken `node node_modules/.bin/prisma` (not found due to workspace hoisting) with `node scripts/db-migrate-test.mjs` wrapper
- Created `backend/scripts/db-migrate-test.mjs`: reads `.env.test`, passes DATABASE_URL to child process, runs `npx prisma migrate deploy`
- Fixed `prisma.config.ts`: changed `datasource.url` from function to static `process.env.DATABASE_URL ?? ''` — required by Prisma 7 `migrate deploy` (function syntax not supported for migrations)
- Updated `backend/tests/workspace.test.ts`: updated workspaces assertion to include `e2e`
- All 123 tests (78 backend + 45 frontend) pass after fixes
