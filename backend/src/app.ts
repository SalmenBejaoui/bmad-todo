import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import sensible from '@fastify/sensible'
import { errorHandlerPlugin } from './plugins/error-handler.js'
import { healthRoutes } from './routes/health.routes.js'

export async function buildApp(opts: Record<string, unknown> = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
    ...opts
  })

  await app.register(cors, {
    origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173'
  })

  await app.register(sensible)

  await app.register(errorHandlerPlugin)

  await app.register(healthRoutes)

  return app
}
