import { describe, it, beforeAll, afterAll, vi, expect } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../../src/app.js'
import type { Todo } from '../../src/generated/prisma/index.js'

// Base todo fixture — matches all 9 Prisma schema fields
const baseTodo: Todo = {
  id: 'aaaaaaaa-0000-0000-0000-000000000001',
  title: 'Buy milk',
  description: null,
  completed: false,
  userId: null,
  createdAt: new Date('2026-01-01T10:00:00.000Z'),
  doneAt: null,
  updatedAt: new Date('2026-01-01T10:00:00.000Z'),
  deletedAt: null,
}

const completedTodo: Todo = {
  id: 'aaaaaaaa-0000-0000-0000-000000000002',
  title: 'Read book',
  description: 'Chapter 3',
  completed: true,
  userId: null,
  createdAt: new Date('2026-01-02T08:00:00.000Z'),
  doneAt: new Date('2026-01-02T09:00:00.000Z'),
  updatedAt: new Date('2026-01-02T09:00:00.000Z'),
  deletedAt: null,
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

describe('GET /todos', () => {
  let app: FastifyInstance

  afterAll(async () => {
    await app?.close()
  })

  it('returns 200 with empty array when no todos exist', async () => {
    const service = makeService({ getAllTodos: vi.fn().mockResolvedValue([]) })
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({ method: 'GET', url: '/todos' })
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body).toHaveLength(0)
  })

  it('returns 200 with array of todos', async () => {
    const service = makeService({
      getAllTodos: vi.fn().mockResolvedValue([baseTodo, completedTodo]),
    })
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({ method: 'GET', url: '/todos' })
    expect(res.statusCode).toBe(200)
    const body = res.json() as any[]
    expect(body).toHaveLength(2)
    expect(body[0].id).toBe(baseTodo.id)
    expect(body[0].title).toBe('Buy milk')
    expect(body[1].id).toBe(completedTodo.id)
  })

  it('serialises timestamps as ISO 8601 strings (not numbers)', async () => {
    const service = makeService({
      getAllTodos: vi.fn().mockResolvedValue([baseTodo]),
    })
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({ method: 'GET', url: '/todos' })
    const body = res.json() as any[]
    const createdAt = body[0].createdAt
    // Must be a string
    expect(typeof createdAt).toBe('string')
    // Must parse as a valid date
    expect(Number.isNaN(Date.parse(createdAt))).toBe(false)
  })
})

describe('GET /todos/:id', () => {
  let app: FastifyInstance

  afterAll(async () => {
    await app?.close()
  })

  it('returns 200 with full todo object for a valid ID', async () => {
    const service = makeService({
      getTodoById: vi.fn().mockResolvedValue(completedTodo),
    })
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({
      method: 'GET',
      url: `/todos/${completedTodo.id}`,
    })
    expect(res.statusCode).toBe(200)
    const body = res.json() as any
    expect(body.id).toBe(completedTodo.id)
    expect(body.title).toBe('Read book')
    expect(body.description).toBe('Chapter 3')
    expect(body.completed).toBe(true)
    expect(typeof body.doneAt).toBe('string')
  })

  it('returns 404 with TODO_NOT_FOUND code for a nonexistent ID', async () => {
    const { NotFoundError } = await import('../../src/lib/errors.js')
    const service = makeService({
      getTodoById: vi.fn().mockRejectedValue(new NotFoundError('Todo not found')),
    })
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({ method: 'GET', url: '/todos/nonexistent-id' })
    expect(res.statusCode).toBe(404)
    const body = res.json() as { error: string; code: string }
    expect(body.error).toBe('Todo not found')
    expect(body.code).toBe('TODO_NOT_FOUND')
  })

  it('returns all 9 fields in the response', async () => {
    const service = makeService({
      getTodoById: vi.fn().mockResolvedValue(baseTodo),
    })
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({ method: 'GET', url: `/todos/${baseTodo.id}` })
    const body = res.json() as any
    const fields = ['id', 'title', 'description', 'completed', 'userId', 'createdAt', 'doneAt', 'updatedAt', 'deletedAt']
    for (const field of fields) {
      expect(body).toHaveProperty(field)
    }
  })
})
