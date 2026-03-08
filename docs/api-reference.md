# API Reference

## Base URL

In development, the frontend expects the backend base URL in `VITE_API_URL`.

Typical local values:

- development: `http://localhost:3000`
- Docker Compose: `http://localhost:3000`

## Conventions

- Content type for writes: `application/json`
- Error envelope: `{ error: string, code?: string }`
- Timestamps serialize as ISO 8601 strings
- Deleted todos are not returned from normal reads

## Todo Resource

Todo response shape:

```json
{
  "id": "uuid",
  "title": "Call client",
  "description": "Optional note",
  "completed": false,
  "userId": null,
  "createdAt": "2026-03-08T10:00:00.000Z",
  "doneAt": null,
  "updatedAt": "2026-03-08T10:00:00.000Z",
  "deletedAt": null
}
```

## Endpoints

### GET /health

Returns service liveness information.

Response `200`:

```json
{
  "status": "ok",
  "timestamp": "2026-03-08T10:00:00.000Z"
}
```

### GET /todos

Returns all non-deleted todos.

Response `200`:

```json
[
  {
    "id": "uuid",
    "title": "Call client",
    "description": null,
    "completed": false,
    "userId": null,
    "createdAt": "2026-03-08T10:00:00.000Z",
    "doneAt": null,
    "updatedAt": "2026-03-08T10:00:00.000Z",
    "deletedAt": null
  }
]
```

### GET /todos/:id

Returns a single todo.

Path params:

- `id`: todo identifier

Response `200`: todo object

Response `404`:

```json
{
  "error": "Todo not found",
  "code": "TODO_NOT_FOUND"
}
```

### POST /todos

Creates a new todo.

Request body:

```json
{
  "title": "Buy milk",
  "description": "Optional"
}
```

Validation rules:

- `title` is required and must be at least 1 character
- `description` is optional and may be `null`

Response `201`: created todo object

### PATCH /todos/:id

Updates only the completion state.

Request body:

```json
{
  "completed": true
}
```

Behavior:

- when `completed` is `true`, the backend sets completion metadata
- when `completed` is `false`, completion metadata is cleared

Response `200`: updated todo object

Response `404`:

```json
{
  "error": "Todo not found",
  "code": "TODO_NOT_FOUND"
}
```

### DELETE /todos/:id

Soft-deletes a todo.

Behavior:

- the record is not physically removed
- `deletedAt` is populated in storage
- the endpoint returns no body on success

Response `204`: no content

Response `404`:

```json
{
  "error": "Todo not found",
  "code": "TODO_NOT_FOUND"
}
```

## Frontend Integration Notes

The frontend API client is a small wrapper around `fetch`.

- non-2xx responses are parsed as JSON and thrown as typed API errors
- `204` responses resolve as `undefined`
- the client requires `VITE_API_URL` to be present at startup

The delete UX intentionally delays the actual DELETE request by 5 seconds to support the undo action shown in the toast.