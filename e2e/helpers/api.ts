/**
 * API utilities for Playwright E2E test setup and teardown.
 * Calls the backend directly (bypassing the frontend) to set up test state.
 */

const API_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000'

interface Todo {
  id: string
  title: string
  description?: string | null
  completed: boolean
  createdAt: string
  updatedAt: string
  doneAt?: string | null
  deletedAt?: string | null
}

/** Fetch all active todos from the backend. */
export async function getTodos(): Promise<Todo[]> {
  const res = await fetch(`${API_URL}/todos`)
  if (!res.ok) throw new Error(`GET /todos failed: ${res.status}`)
  return res.json() as Promise<Todo[]>
}

/** Delete all active todos via the API to ensure a clean test slate. */
export async function deleteAllTodos(): Promise<void> {
  const todos = await getTodos()
  await Promise.all(
    todos.map((t) =>
      fetch(`${API_URL}/todos/${t.id}`, { method: 'DELETE' })
    )
  )
}

/** Create a todo via the API. Returns the created Todo. */
export async function createTodo(
  title: string,
  description?: string
): Promise<Todo> {
  const res = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  })
  if (!res.ok) throw new Error(`POST /todos failed: ${res.status}`)
  return res.json() as Promise<Todo>
}
