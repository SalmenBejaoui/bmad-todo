import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TodoService } from '../../src/services/todo.service.js'
import { NotFoundError } from '../../src/lib/errors.js'
import type { Todo } from '../../src/generated/prisma/index.js'

const baseTodo: Todo = {
  id: 'todo-1',
  title: 'Test todo',
  description: null,
  completed: false,
  userId: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  doneAt: null,
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  deletedAt: null,
}

const makeRepo = (overrides: Record<string, any> = {}) => ({
  findAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockResolvedValue(baseTodo),
  update: vi.fn().mockResolvedValue(baseTodo),
  softDelete: vi.fn().mockResolvedValue({ ...baseTodo, deletedAt: new Date() }),
  ...overrides,
})

describe('TodoService.getAllTodos', () => {
  it('delegates to repository.findAll', async () => {
    const repo = makeRepo({ findAll: vi.fn().mockResolvedValue([baseTodo]) })
    const service = new TodoService(repo as any)
    const result = await service.getAllTodos()
    expect(repo.findAll).toHaveBeenCalledOnce()
    expect(result).toEqual([baseTodo])
  })
})

describe('TodoService.getTodoById', () => {
  it('returns the todo when found', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(baseTodo) })
    const service = new TodoService(repo as any)
    const result = await service.getTodoById('todo-1')
    expect(repo.findById).toHaveBeenCalledWith('todo-1')
    expect(result).toEqual(baseTodo)
  })

  it('throws NotFoundError when todo does not exist', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) })
    const service = new TodoService(repo as any)
    await expect(service.getTodoById('nonexistent')).rejects.toThrow(NotFoundError)
    await expect(service.getTodoById('nonexistent')).rejects.toThrow('Todo not found')
  })
})

describe('TodoService.createTodo', () => {
  it('delegates to repository.create', async () => {
    const created = { ...baseTodo }
    const repo = makeRepo({ create: vi.fn().mockResolvedValue(created) })
    const service = new TodoService(repo as any)
    await service.createTodo({ title: 'Test todo', description: null })
    expect(repo.create).toHaveBeenCalledWith({ title: 'Test todo', description: null })
  })
})

describe('TodoService.toggleCompletion', () => {
  it('sets doneAt to a Date when marking complete (false → true)', async () => {
    const activeTodo = { ...baseTodo, completed: false, doneAt: null }
    const completedTodo = { ...baseTodo, completed: true, doneAt: new Date() }
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(activeTodo),
      update: vi.fn().mockResolvedValue(completedTodo),
    })
    const service = new TodoService(repo as any)
    await service.toggleCompletion('todo-1', true)
    expect(repo.update).toHaveBeenCalledOnce()
    const updateCall = repo.update.mock.calls[0]
    expect(updateCall[0]).toBe('todo-1')
    expect(updateCall[1].completed).toBe(true)
    expect(updateCall[1].doneAt).toBeInstanceOf(Date)
  })

  it('sets doneAt to null when marking active (true → false)', async () => {
    const completedTodo = { ...baseTodo, completed: true, doneAt: new Date() }
    const activeTodo = { ...baseTodo, completed: false, doneAt: null }
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(completedTodo),
      update: vi.fn().mockResolvedValue(activeTodo),
    })
    const service = new TodoService(repo as any)
    await service.toggleCompletion('todo-1', false)
    const updateCall = repo.update.mock.calls[0]
    expect(updateCall[1].completed).toBe(false)
    expect(updateCall[1].doneAt).toBeNull()
  })

  it('throws NotFoundError when todo does not exist', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) })
    const service = new TodoService(repo as any)
    await expect(service.toggleCompletion('nonexistent', true)).rejects.toThrow(NotFoundError)
  })
})

describe('TodoService.deleteTodo', () => {
  it('delegates to repository.softDelete after verifying existence', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(baseTodo) })
    const service = new TodoService(repo as any)
    await service.deleteTodo('todo-1')
    expect(repo.findById).toHaveBeenCalledWith('todo-1')
    expect(repo.softDelete).toHaveBeenCalledWith('todo-1')
  })

  it('throws NotFoundError when todo does not exist', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) })
    const service = new TodoService(repo as any)
    await expect(service.deleteTodo('nonexistent')).rejects.toThrow(NotFoundError)
  })

  it('never calls physically delete — only softDelete', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(baseTodo) })
    const service = new TodoService(repo as any)
    await service.deleteTodo('todo-1')
    // softDelete called, no physical delete method exists
    expect(repo.softDelete).toHaveBeenCalledWith('todo-1')
  })
})
