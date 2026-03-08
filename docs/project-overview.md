# Project Overview

## Summary

bmad-todo is a full-stack task management application built as a monorepo with three workspace packages:

- `frontend`: React 19 SPA built with Vite
- `backend`: Fastify 5 REST API with Prisma and PostgreSQL
- `e2e`: Playwright end-to-end test suite

The product focuses on a small, well-defined task loop:

- create a task
- list all active tasks
- open task details
- toggle task completion
- soft-delete a task with an undo window in the client

The codebase is structured for maintainability rather than feature breadth. The backend uses a strict route-service-repository split, while the frontend keeps server state in TanStack Query and routing in React Router.

## Product Scope

Current scope in v1:

- single-user task management
- persistent PostgreSQL storage
- optimistic UI for task creation and completion updates
- delayed delete with a 5-second undo action on the client
- responsive SPA frontend
- Docker Compose production stack
- automated backend, frontend, and Playwright test coverage

Explicitly out of scope in the current implementation:

- authentication and authorization
- multi-user data isolation
- offline support
- realtime sync across clients

The database schema already includes a nullable `userId` field so authentication can be added later without redesigning the core `Todo` model.

## Repository Layout

```text
bmad-todo/
├── backend/                 Fastify API, Prisma schema, backend tests
├── frontend/                React SPA, UI components, frontend tests
├── e2e/                     Playwright suite and test helpers
├── _bmad/                   BMAD runtime configuration, agents, workflows
├── _bmad-output/            Generated planning and implementation artifacts
├── docs/                    Project knowledge and developer documentation
├── docker-compose.yml       Production stack
├── docker-compose.test.yml  Isolated PostgreSQL test stack
└── package.json             Root workspace scripts
```

## Workspace Scripts

The root workspace provides the main entrypoints:

- `npm run dev`: starts frontend and backend development servers concurrently
- `npm test`: runs backend tests, then frontend tests
- `npm run test:e2e`: runs the Playwright suite in the `e2e` workspace
- `npm run build`: builds frontend and backend packages

## Primary Technologies

### Frontend

- React 19
- Vite 7
- React Router 7
- TanStack Query 5
- Tailwind CSS 4
- Radix UI primitives
- Vitest and Testing Library

### Backend

- Node.js 24+
- Fastify 5
- Zod with `fastify-type-provider-zod`
- Prisma 7
- PostgreSQL 16
- Vitest

### Delivery and Testing

- Docker Compose
- Nginx for serving the production SPA
- Playwright for end-to-end coverage

## Key Characteristics

- Thin HTTP handlers with business logic isolated in the service layer
- Soft-delete semantics via `deletedAt` instead of hard deletion
- Shared API error envelope of `{ error: string, code?: string }`
- Optimistic UX with rollback on mutation failure
- Testable boundaries between route, service, repository, and UI state logic