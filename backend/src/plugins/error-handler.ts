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
    if (err.validation) {
      // Validation errors are client mistakes — log at warn, not error
      request.log.warn({ err }, 'Request validation failed')
      return reply.status(400).send({ error: err.message, code: 'VALIDATION_ERROR' })
    }

    const statusCode = err.statusCode ?? 500
    if (statusCode < 500) {
      // 4xx are client errors — log at info to avoid polluting error logs
      request.log.info({ err }, 'Client error')
      return reply.status(statusCode).send({
        error: err.message,
        code: 'CLIENT_ERROR',
      })
    }

    // 5xx — log at error level and never expose internals (NFR15)
    request.log.error({ err }, 'Unhandled server error')
    return reply.status(500).send({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
  })
})
