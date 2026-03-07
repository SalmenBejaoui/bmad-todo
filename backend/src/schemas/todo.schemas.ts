import { z } from 'zod'

// Represents a single Todo record — all 9 fields
// z.date() serialises to ISO 8601 strings via fastify-type-provider-zod serializerCompiler
export const TodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  userId: z.string().nullable(),
  createdAt: z.date(),
  doneAt: z.date().nullable(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const TodoListResponseSchema = z.array(TodoSchema)

export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
})

// Request schemas
export const CreateTodoBodySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
})

export const ToggleTodoBodySchema = z.object({
  completed: z.boolean({ required_error: 'completed is required' }),
})

export const TodoParamsSchema = z.object({
  id: z.string(),
})

export type TodoResponse = z.infer<typeof TodoSchema>
export type CreateTodoBody = z.infer<typeof CreateTodoBodySchema>
export type ToggleTodoBody = z.infer<typeof ToggleTodoBodySchema>
export type TodoParams = z.infer<typeof TodoParamsSchema>
