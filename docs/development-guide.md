# Development Guide

## Prerequisites

- Node.js 24 or newer
- npm with workspace support
- Docker Desktop or compatible Docker Compose runtime
- PostgreSQL 16 for local backend development, unless you use the Compose-based test database only

## Install Dependencies

From the repository root:

```bash
npm install
```

## Local Environment

The repository expects environment values in two places:

- root `.env` for Docker Compose
- `backend/.env.development` for local backend development

Typical backend development file:

```dotenv
PORT=3000
ALLOWED_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bmad_todo
```

The frontend also requires `VITE_API_URL` during development. Set it in the frontend environment expected by Vite.

Typical value:

```dotenv
VITE_API_URL=http://localhost:3000
```

## Start the Application

### Local workspace mode

Run both development servers from the repository root:

```bash
npm run dev
```

This starts:

- frontend Vite server on `http://localhost:5173`
- backend Fastify server on `http://localhost:3000`

### Docker Compose mode

Build and start the production-like stack:

```bash
docker compose up --build -d
```

Services:

- frontend at `http://localhost`
- backend at `http://localhost:3000`
- PostgreSQL inside the Compose network

## Database Workflow

### Development migrations

From `backend/`:

```bash
npx prisma migrate dev --name init
```

### Production migrations inside Compose

```bash
docker compose exec backend node node_modules/.bin/prisma migrate deploy
```

### Test database setup

Bring up the isolated test database:

```bash
docker compose -f docker-compose.test.yml up -d
```

The backend `pretest` hook applies Prisma migrations to the configured test database automatically.

## Testing Commands

From the repository root:

- `npm test` runs backend then frontend tests
- `npm run test:e2e` runs Playwright

From individual workspaces:

- `npm -w backend test`
- `npm -w frontend test`
- `npm -w frontend run test:coverage`
- `npm -w e2e test`

Install the Playwright browser when needed:

```bash
npm -w e2e run install:browsers
```

## Build Commands

From the repository root:

```bash
npm run build
```

Workspace-specific builds:

- backend: `npm -w backend run build`
- frontend: `npm -w frontend run build`

## Operational Checks

Verify backend health locally or in Compose:

```bash
curl http://localhost:3000/health
```

Expected response shape:

```json
{ "status": "ok", "timestamp": "..." }
```

## Common Implementation Conventions

- keep Fastify handlers thin and move business rules into services
- keep Prisma access inside repositories
- preserve the public API error envelope
- prefer optimistic UI updates with rollback behavior that matches current hooks
- treat `deletedAt` as the deletion mechanism rather than hard-deleting records