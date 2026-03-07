import { describe, it, afterAll, vi, expect } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../../src/app.js'
import type { Todo } from '../../src/generated/prisma/index.js'

const existingTodo: Todo = {
  id: 'dddddddd-0000-0000-0000-000000000001',
  title: 'Buy milk',
  description: null,
  completed: false,
  userId: null,
  createdAt: new Date('2026-03-07T10:00:00.000Z'),
  doneAt: null,
  updatedAt: new Date('2026-03-07T10:00:00.000Z'),
  deletedAt: null,
}

function makeService(overrides: Record<string, any> = {}) {
  return {
    getAllTodos: vi.fn().mockResolvedValue([]),
    getTodoById: vi.fn().mockResolvedValue(null),
    createTodo: vi.fn(),
    toggleCompletion: vi.fn(),
    deleteTodo: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as any
}

describe('DELETE /todos/:id', () => {
  let app: FastifyInstance

  afterAll(async () => {
    await app?.close()
  })

  it('returns 204 with no body on successful soft-delete', async () => {
    const service = makeService({
      deleteTodo: vi.fn().mockResolvedValue(undefined),
    })
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({
      method: 'DELETE',
      url: `/todos/${existingTodo.id}`,
    })

    expect(res.statusCode).toBe(204)
    expect(res.body).toBe('')
    expect(service.deleteTodo).toHaveBeenCalledWith(existingTodo.id)
  })

  it('returns 404 when todo does not exist', async () => {
    const { NotFoundError } = await import('../../src/lib/errors.js')
    const service = makeService({
      deleteTodo: vi.fn().mockRejectedValue(new NotFoundError('Todo not found')),
    })
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({
      method: 'DELETE',
      url: '/todos/nonexistent-id',
    })

    expect(res.statusCode).toBe(404)
    const body = res.json() as { error: string; code: string }
    expect(body.error).toBe('Todo not found')
    expect(body.code).toBe('TODO_NOT_FOUND')
  })

  it('returns 404 on double-delete (already deleted)', async () => {
    const { NotFoundError } = await import('../../src/lib/errors.js')
    const service = makeService({
      deleteTodo: vi.fn().mockRejectedValue(new NotFoundError('Todo not found')),
    })
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({
      method: 'DELETE',
      url: `/todos/${existingTodo.id}`,
    })

    expect(res.statusCode).toBe(404)
    expect(res.json<any>().code).toBe('TODO_NOT_FOUND')
  })

  it('deleted todo is absent from GET /todos (via mocked getAllTodos)', async () => {
    const service = makeService({
      deleteTodo: vi.fn().mockResolvedValue(undefined),
      getAllTodos: vi.fn().mockResolvedValue([]),
    })
    app = await buildApp({ todoService: service })
    await app.ready()

    // Verify the delete succeeds
    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/todos/${existingTodo.id}`,
    })
    expect(deleteRes.statusCode).toBe(204)

    // Verify list no longer includes the deleted todo
    const listRes = await app.inject({ method: 'GET', url: '/todos' })
    expect(listRes.statusCode).toBe(200)
    const todos = listRes.json() as Todo[]
    expect(todos.find((t) => t.id === existingTodo.id)).toBeUndefined()
  })

  it('deleted todo returns 404 on GET /todos/:id (via mocked getTodoById)', async () => {
    const { NotFoundError } = await import('../../src/lib/errors.js')
    const service = makeService({
      deleteTodo: vi.fn().mockResolvedValue(undefined),
      getTodoById: vi.fn().mockRejectedValue(new NotFoundError('Todo not found')),
    })
    app = await buildApp({ todoService: service })
    await app.ready()

    // Delete
    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/todos/${existingTodo.id}`,
    })
    expect(deleteRes.statusCode).toBe(204)

    // GET /:id after delete should return 404
    const getRes = await app.inject({ method: 'GET', url: `/todos/${existingTodo.id}` })
    expect(getRes.statusCode).toBe(404)
    expect(getRes.json<any>().code).toBe('TODO_NOT_FOUND')
  })
})
