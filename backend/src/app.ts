import Fastify from 'fastify'
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import cors from '@fastify/cors'
import sensible from '@fastify/sensible'
import errorHandlerPlugin from './plugins/error-handler.js'
import healthPlugin from './plugins/health.js'

export async function buildApp() {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
  }).withTypeProvider<ZodTypeProvider>()

  // REQUIRED: wire Zod compilers so Fastify uses Zod for validation/serialization
  // Without these, Zod schemas in route definitions are silently ignored (falls back to AJV)
  app.setSerializerCompiler(serializerCompiler)
  app.setValidatorCompiler(validatorCompiler)

  await app.register(cors, {
    origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173',
  })
  await app.register(sensible)
  await app.register(errorHandlerPlugin)
  await app.register(healthPlugin)

  return app
}
