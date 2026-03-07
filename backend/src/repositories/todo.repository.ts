import type { PrismaClient, Todo } from '../generated/prisma/index.js'

export type CreateTodoData = Pick<Todo, 'title' | 'description'>
export type UpdateTodoData = Partial<Pick<Todo, 'completed' | 'doneAt'>>

export class TodoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(): Promise<Todo[]> {
    return this.prisma.todo.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
  }

  findById(id: string): Promise<Todo | null> {
    return this.prisma.todo.findFirst({
      where: { id, deletedAt: null },
    })
  }

  create(data: CreateTodoData): Promise<Todo> {
    return this.prisma.todo.create({
      data: {
        title: data.title,
        description: data.description ?? null,
      },
    })
  }

  update(id: string, data: UpdateTodoData): Promise<Todo> {
    return this.prisma.todo.update({
      where: { id },
      data,
    })
  }

  softDelete(id: string): Promise<Todo> {
    return this.prisma.todo.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}
