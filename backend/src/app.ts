import Fastify from 'fastify'
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import cors from '@fastify/cors'
import sensible from '@fastify/sensible'
import errorHandlerPlugin from './plugins/error-handler.js'
import healthPlugin from './plugins/health.js'
import todoRoutes from './routes/todo.routes.js'
import { TodoRepository } from './repositories/todo.repository.js'
import { TodoService } from './services/todo.service.js'
import { prisma } from './lib/prisma.js'

export interface BuildAppOptions {
  /** Override the TodoService instance (used in tests for isolation) */
  todoService?: TodoService
}

export async function buildApp(opts: BuildAppOptions = {}) {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
  }).withTypeProvider<ZodTypeProvider>()

  // REQUIRED: wire Zod compilers so Fastify uses Zod for validation/serialization
  // Without these, Zod schemas in route definitions are silently ignored (falls back to AJV)
  app.setSerializerCompiler(serializerCompiler)
  app.setValidatorCompiler(validatorCompiler)

  await app.register(cors, {
    origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
  await app.register(sensible)
  await app.register(errorHandlerPlugin)
  await app.register(healthPlugin)

  // Wire up dependency injection for todo routes
  const service = opts.todoService ?? new TodoService(new TodoRepository(prisma))
  await app.register(todoRoutes, { service })

  return app
}
