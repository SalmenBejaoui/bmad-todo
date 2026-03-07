import { describe, it, afterAll, vi, expect } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../../src/app.js'
import type { Todo } from '../../src/generated/prisma/index.js'

const createdTodo: Todo = {
  id: 'bbbbbbbb-0000-0000-0000-000000000001',
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
    createTodo: vi.fn().mockResolvedValue(createdTodo),
    toggleCompletion: vi.fn(),
    deleteTodo: vi.fn(),
    ...overrides,
  } as any
}

describe('POST /todos', () => {
  let app: FastifyInstance

  afterAll(async () => {
    await app?.close()
  })

  it('returns 201 with created todo when given a valid title only', async () => {
    const service = makeService()
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({
      method: 'POST',
      url: '/todos',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Buy milk' }),
    })
    expect(res.statusCode).toBe(201)
    const body = res.json() as any
    expect(body.id).toBe(createdTodo.id)
    expect(body.title).toBe('Buy milk')
    expect(body.description).toBeNull()
    expect(body.completed).toBe(false)
    expect(body.userId).toBeNull()
    expect(body.doneAt).toBeNull()
    expect(body.deletedAt).toBeNull()
    expect(typeof body.createdAt).toBe('string')
    expect(Number.isNaN(Date.parse(body.createdAt))).toBe(false)
  })

  it('returns 201 with description when title and description are provided', async () => {
    const withDesc: Todo = { ...createdTodo, description: '2% please' }
    const service = makeService({ createTodo: vi.fn().mockResolvedValue(withDesc) })
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({
      method: 'POST',
      url: '/todos',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Buy milk', description: '2% please' }),
    })
    expect(res.statusCode).toBe(201)
    const body = res.json() as any
    expect(body.description).toBe('2% please')
  })

  it('returns 400 VALIDATION_ERROR when title is missing', async () => {
    const service = makeService()
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({
      method: 'POST',
      url: '/todos',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(res.statusCode).toBe(400)
    const body = res.json() as { error: string; code: string }
    expect(body.code).toBe('VALIDATION_ERROR')
    expect(service.createTodo).not.toHaveBeenCalled()
  })

  it('returns 400 VALIDATION_ERROR when title is an empty string', async () => {
    const service = makeService()
    app = await buildApp({ todoService: service })
    await app.ready()

    const res = await app.inject({
      method: 'POST',
      url: '/todos',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: '' }),
    })
    expect(res.statusCode).toBe(400)
    const body = res.json() as { error: string; code: string }
    expect(body.code).toBe('VALIDATION_ERROR')
    expect(service.createTodo).not.toHaveBeenCalled()
  })

  it('calls service.createTodo with correct args', async () => {
    const service = makeService()
    app = await buildApp({ todoService: service })
    await app.ready()

    await app.inject({
      method: 'POST',
      url: '/todos',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Walk dog', description: 'Morning walk' }),
    })

    expect(service.createTodo).toHaveBeenCalledWith({
      title: 'Walk dog',
      description: 'Morning walk',
    })
  })
})
