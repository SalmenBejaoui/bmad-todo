import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import type { TodoService } from '../services/todo.service.js'
import { NotFoundError } from '../lib/errors.js'
import {
  TodoSchema,
  TodoListResponseSchema,
  TodoParamsSchema,
  CreateTodoBodySchema,
  ToggleTodoBodySchema,
  ErrorResponseSchema,
  type CreateTodoBody,
  type ToggleTodoBody,
  type TodoParams,
} from '../schemas/todo.schemas.js'

export default fp(
  async function todoRoutes(app: FastifyInstance, options: { service: TodoService }) {
    const { service } = options

    // GET /todos — list all non-deleted todos
    app.get(
      '/todos',
      {
        schema: {
          response: {
            200: TodoListResponseSchema,
          },
        },
      },
      async (_request, reply) => {
        const todos = await service.getAllTodos()
        return reply.status(200).send(todos)
      },
    )

    // GET /todos/:id — retrieve a single todo by ID
    app.get<{ Params: TodoParams }>(
      '/todos/:id',
      {
        schema: {
          params: TodoParamsSchema,
          response: {
            200: TodoSchema,
            404: ErrorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        try {
          const todo = await service.getTodoById(request.params.id)
          return reply.status(200).send(todo)
        } catch (err) {
          if (err instanceof NotFoundError) {
            return reply.status(404).send({ error: 'Todo not found', code: 'TODO_NOT_FOUND' })
          }
          throw err
        }
      },
    )

    // POST /todos — create a new todo
    app.post<{ Body: CreateTodoBody }>(
      '/todos',
      {
        schema: {
          body: CreateTodoBodySchema,
          response: {
            201: TodoSchema,
          },
        },
      },
      async (request, reply) => {
        const { title, description } = request.body
        const todo = await service.createTodo({ title, description: description ?? null })
        request.log.info({ todoId: todo.id, userId: null }, 'Todo created')
        return reply.status(201).send(todo)
      },
    )

    // PATCH /todos/:id — toggle completion status
    app.patch<{ Params: TodoParams; Body: ToggleTodoBody }>(
      '/todos/:id',
      {
        schema: {
          params: TodoParamsSchema,
          body: ToggleTodoBodySchema,
          response: {
            200: TodoSchema,
            404: ErrorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const { id } = request.params
        const { completed } = request.body
        try {
          const todo = await service.toggleCompletion(id, completed)
          request.log.info({ todoId: id, userId: null, completed }, 'Todo completion updated')
          return reply.status(200).send(todo)
        } catch (err) {
          if (err instanceof NotFoundError) {
            return reply.status(404).send({ error: 'Todo not found', code: 'TODO_NOT_FOUND' })
          }
          throw err
        }
      },
    )
    // DELETE /todos/:id — soft-delete a todo
    app.delete<{ Params: TodoParams }>(
      '/todos/:id',
      {
        schema: {
          params: TodoParamsSchema,
          response: {
            404: ErrorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const { id } = request.params
        try {
          await service.deleteTodo(id)
          request.log.info({ todoId: id, userId: null }, 'Todo soft-deleted')
          return reply.status(204).send()
        } catch (err) {
          if (err instanceof NotFoundError) {
            return reply.status(404).send({ error: 'Todo not found', code: 'TODO_NOT_FOUND' })
          }
          request.log.error({ err, todoId: id, userId: null }, 'Todo operation failed')
          throw err
        }
      },
    )
  },
  { name: 'todo-routes' },
)
