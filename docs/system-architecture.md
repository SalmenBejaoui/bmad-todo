# System Architecture

## Runtime Topology

The production deployment runs as three containers:

1. PostgreSQL 16 for persistent storage
2. Fastify backend for the REST API
3. Nginx serving the built React SPA

At runtime, the browser talks only to the backend API. The backend owns validation, business logic, persistence, and operational logging.

```text
Browser
  -> React SPA served by nginx
  -> HTTP requests to Fastify API
  -> Prisma data access
  -> PostgreSQL
```

## Frontend Architecture

The frontend is a client-rendered SPA.

- React Router defines the application shell and the nested `/todos/:id` detail route.
- TanStack Query manages server-backed state and cache invalidation.
- The main application shell fetches the todo list and delegates task rendering to UI components.
- Deletion is handled optimistically: the item is removed from cache immediately, and the actual DELETE request is delayed for 5 seconds to support undo.

Current frontend responsibilities:

- fetch and render the todo list
- open the add-task modal
- navigate to task detail routes
- optimistically toggle completion state
- optimistically remove deleted items and restore them if the user cancels or the request fails

## Backend Architecture

The backend follows a layered design:

- route layer: Fastify route registration, HTTP status codes, schema binding
- service layer: business rules and orchestration
- repository layer: Prisma access to the database

This separation keeps Fastify handlers thin and makes service logic easy to test without direct framework coupling.

### Application Bootstrap

`buildApp()` configures the Fastify instance and registers:

- CORS with `ALLOWED_ORIGIN`
- `@fastify/sensible`
- a global error handler plugin
- a health plugin exposing `/health`
- todo routes with an injected `TodoService`

The server entrypoint listens on `0.0.0.0` and uses `PORT` from the environment, defaulting to `3000`.

## Data Model

The application uses a single Prisma model mapped to the `todos` table.

Fields:

- `id`: UUID primary key
- `title`: required task title
- `description`: optional text
- `completed`: boolean state
- `userId`: nullable reserved field for future auth support
- `createdAt`: creation timestamp
- `doneAt`: nullable completion timestamp
- `updatedAt`: auto-updated modification timestamp
- `deletedAt`: nullable soft-delete timestamp

Soft-delete is a core design decision. Records remain in the database, and active queries operate only on non-deleted rows.

## Request and Validation Flow

The backend uses Zod schemas for request validation and response serialization.

Flow:

1. Fastify route receives the request.
2. Zod validates params and request bodies.
3. Route delegates to the service layer.
4. Service calls the repository.
5. Prisma executes the database operation.
6. Route returns a typed response or a structured error.

This ensures the API contract is explicit and consistently enforced.

## Error Handling and Logging

The public error contract is intentionally small:

```json
{ "error": "message", "code": "OPTIONAL_CODE" }
```

Known domain case:

- missing todo returns `404` with `code: "TODO_NOT_FOUND"`

Operational logging is emitted from the route layer for create, update, and delete events. This keeps runtime diagnostics available without exposing internal errors to clients.

## Testing Strategy

The repository uses three testing levels:

- backend unit and integration tests with Vitest
- frontend component and hook tests with Vitest and Testing Library
- end-to-end tests with Playwright in the `e2e` workspace

Backend integration tests rely on an isolated PostgreSQL test database and Prisma migrations applied through the backend `pretest` hook.