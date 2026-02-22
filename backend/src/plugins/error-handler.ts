import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyError } from 'fastify'
import { ZodError } from 'zod'

async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, userId: null }, 'Request error')

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'Validation error',
        code: 'VALIDATION_ERROR'
      })
    }

    const statusCode = (error as FastifyError).statusCode ?? 500
    const message = statusCode < 500 ? (error as Error).message : 'Internal server error'
    const code = statusCode < 500 ? 'CLIENT_ERROR' : 'INTERNAL_ERROR'

    return reply.status(statusCode).send({ error: message, code })
  })
}

export const errorHandlerPlugin = fp(errorHandler)
