import { describe, it, afterAll, vi, expect } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../../src/app.js'
import type { Todo } from '../../src/generated/prisma/index.js'

const activeTodo: Todo = {
  id: 'cccccccc-0000-0000-0000-000000000001',
  title: 'Buy milk',
  description: null,
  completed: false,
  userId: null,
  createdAt: new Date('2026-03-07T10:00:00.000Z'),
  doneAt: null,
  updatedAt: new Date('2026-03-07T10:00:00.000Z'),
  deletedAt: null,
}

const completedTodo: Todo = {
  ...activeTodo,
  completed: true,
  doneAt: new Date('2026-03-07T11:00:00.000Z'),
  updatedAt: new Date('2026-03-07T11:00:00.000Z'),
}

function makeService(overrides: Record<string, any> = {}) {
  return {
    getAllTodos: vi.fn().mockResolvedValue([]),
    getTodoById: vi.fn().mockResolvedValue(null),
    createTodo: vi.fn(),
    toggleCompletion: vi.fn(),
    deleteTodo: vi.fn(),
    ...overrides,
  } as any
}

describe('PATCH /todos/:id', () => {
  let app: FastifyInstance

  afterAll(async () => {
    await app?.close()
  })

  it('returns 200 with completed:true and doneAt set when toggling to complete', async () => {
    const service = makeService({
      toggleCompletion: vi.fn().mockResolvedValue(completedTodo),
    })
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({
      method: 'PATCH',
      url: `/todos/${activeTodo.id}`,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    })

    expect(res.statusCode).toBe(200)
    const body = res.json() as any
    expect(body.completed).toBe(true)
    expect(typeof body.doneAt).toBe('string')
    expect(Number.isNaN(Date.parse(body.doneAt))).toBe(false)
    expect(service.toggleCompletion).toHaveBeenCalledWith(activeTodo.id, true)
  })

  it('returns 200 with completed:false and doneAt:null when toggling to active', async () => {
    const service = makeService({
      toggleCompletion: vi.fn().mockResolvedValue(activeTodo),
    })
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({
      method: 'PATCH',
      url: `/todos/${activeTodo.id}`,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ completed: false }),
    })

    expect(res.statusCode).toBe(200)
    const body = res.json() as any
    expect(body.completed).toBe(false)
    expect(body.doneAt).toBeNull()
    expect(service.toggleCompletion).toHaveBeenCalledWith(activeTodo.id, false)
  })

  it('returns 404 TODO_NOT_FOUND for a non-existent todo', async () => {
    const { NotFoundError } = await import('../../src/lib/errors.js')
    const service = makeService({
      toggleCompletion: vi.fn().mockRejectedValue(new NotFoundError('Todo not found')),
    })
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({
      method: 'PATCH',
      url: '/todos/nonexistent-id',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    })

    expect(res.statusCode).toBe(404)
    const body = res.json() as { error: string; code: string }
    expect(body.error).toBe('Todo not found')
    expect(body.code).toBe('TODO_NOT_FOUND')
  })

  it('returns 400 VALIDATION_ERROR when completed field is missing', async () => {
    const service = makeService()
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({
      method: 'PATCH',
      url: `/todos/${activeTodo.id}`,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })

    expect(res.statusCode).toBe(400)
    expect(res.json<any>().code).toBe('VALIDATION_ERROR')
    expect(service.toggleCompletion).not.toHaveBeenCalled()
  })

  it('returns 400 VALIDATION_ERROR when completed is not a boolean', async () => {
    const service = makeService()
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({
      method: 'PATCH',
      url: `/todos/${activeTodo.id}`,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ completed: 'yes' }),
    })

    expect(res.statusCode).toBe(400)
    expect(res.json<any>().code).toBe('VALIDATION_ERROR')
  })
})
