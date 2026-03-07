import type { Todo } from '../generated/prisma/index.js'
import type { CreateTodoData, TodoRepository } from '../repositories/todo.repository.js'
import { NotFoundError } from '../lib/errors.js'

export class TodoService {
  constructor(private readonly repository: TodoRepository) {}

  getAllTodos(): Promise<Todo[]> {
    return this.repository.findAll()
  }

  async getTodoById(id: string): Promise<Todo> {
    const todo = await this.repository.findById(id)
    if (!todo) {
      throw new NotFoundError('Todo not found')
    }
    return todo
  }

  createTodo(data: CreateTodoData): Promise<Todo> {
    return this.repository.create(data)
  }

  async toggleCompletion(id: string, completed: boolean): Promise<Todo> {
    const todo = await this.repository.findById(id)
    if (!todo) {
      throw new NotFoundError('Todo not found')
    }
    return this.repository.update(id, {
      completed,
      doneAt: completed ? new Date() : null,
    })
  }

  async deleteTodo(id: string): Promise<void> {
    const todo = await this.repository.findById(id)
    if (!todo) {
      throw new NotFoundError('Todo not found')
    }
    await this.repository.softDelete(id)
  }
}
