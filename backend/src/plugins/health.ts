import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'

export default fp(async function healthPlugin(app: FastifyInstance) {
  app.get('/health', async (_request, reply) => {
    return reply.status(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  })
})
