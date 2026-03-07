import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TodoRepository } from '../../src/repositories/todo.repository.js'
import type { Todo } from '../../src/generated/prisma/index.js'

// Minimal mock of Prisma client's todo operations
const mockPrisma = {
  todo: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}

const repo = new TodoRepository(mockPrisma as any)

const baseTodo: Todo = {
  id: 'test-id',
  title: 'Test todo',
  description: null,
  completed: false,
  userId: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  doneAt: null,
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  deletedAt: null,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TodoRepository.findAll', () => {
  it('calls findMany with deletedAt: null filter', async () => {
    mockPrisma.todo.findMany.mockResolvedValue([baseTodo])
    const result = await repo.findAll()
    expect(mockPrisma.todo.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
    expect(result).toEqual([baseTodo])
  })

  it('returns empty array when no todos exist', async () => {
    mockPrisma.todo.findMany.mockResolvedValue([])
    const result = await repo.findAll()
    expect(result).toEqual([])
  })
})

describe('TodoRepository.findById', () => {
  it('calls findFirst with id and deletedAt: null filter', async () => {
    mockPrisma.todo.findFirst.mockResolvedValue(baseTodo)
    const result = await repo.findById('test-id')
    expect(mockPrisma.todo.findFirst).toHaveBeenCalledWith({
      where: { id: 'test-id', deletedAt: null },
    })
    expect(result).toEqual(baseTodo)
  })

  it('returns null when todo does not exist or is deleted', async () => {
    mockPrisma.todo.findFirst.mockResolvedValue(null)
    const result = await repo.findById('nonexistent')
    expect(result).toBeNull()
  })
})

describe('TodoRepository.create', () => {
  it('creates a todo with title and null description by default', async () => {
    const created = { ...baseTodo }
    mockPrisma.todo.create.mockResolvedValue(created)
    const result = await repo.create({ title: 'Test todo', description: null })
    expect(mockPrisma.todo.create).toHaveBeenCalledWith({
      data: { title: 'Test todo', description: null },
    })
    expect(result).toEqual(created)
  })

  it('creates a todo with a description when provided', async () => {
    const created = { ...baseTodo, description: 'Details here' }
    mockPrisma.todo.create.mockResolvedValue(created)
    await repo.create({ title: 'Test todo', description: 'Details here' })
    expect(mockPrisma.todo.create).toHaveBeenCalledWith({
      data: { title: 'Test todo', description: 'Details here' },
    })
  })
})

describe('TodoRepository.update', () => {
  it('calls prisma.todo.update with the given id and data', async () => {
    const updated = { ...baseTodo, completed: true }
    mockPrisma.todo.update.mockResolvedValue(updated)
    const result = await repo.update('test-id', { completed: true })
    expect(mockPrisma.todo.update).toHaveBeenCalledWith({
      where: { id: 'test-id' },
      data: { completed: true },
    })
    expect(result).toEqual(updated)
  })
})

describe('TodoRepository.softDelete', () => {
  it('updates deletedAt to a Date, never physically removes the record', async () => {
    mockPrisma.todo.update.mockResolvedValue({ ...baseTodo, deletedAt: new Date() })
    await repo.softDelete('test-id')
    expect(mockPrisma.todo.update).toHaveBeenCalledOnce()
    const call = mockPrisma.todo.update.mock.calls[0][0]
    expect(call.where).toEqual({ id: 'test-id' })
    expect(call.data.deletedAt).toBeInstanceOf(Date)
  })
})
