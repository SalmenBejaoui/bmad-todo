import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify'

export default fp(async function errorHandlerPlugin(app: FastifyInstance) {
  // Custom 404 handler — returns architecture-compliant error envelope
  // Without this, Fastify's default returns { message, error, statusCode } which
  // doesn't match the { error, code } contract (Decision 2.2)
  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    request.log.warn({ req: { method: request.method, url: request.url } }, 'Route not found')
    return reply.status(404).send({
      error: 'Not Found',
      code: 'NOT_FOUND',
    })
  })

  app.setErrorHandler((err: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error({ err }, 'Unhandled error')

    if (err.validation) {
      return reply.status(400).send({ error: err.message, code: 'VALIDATION_ERROR' })
    }

    const statusCode = err.statusCode ?? 500
    if (statusCode < 500) {
      return reply.status(statusCode).send({
        error: err.message,
        code: 'CLIENT_ERROR',
      })
    }

    // 5xx — never expose internals (NFR15)
    return reply.status(500).send({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
  })
})
