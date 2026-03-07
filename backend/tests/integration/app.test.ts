import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { buildApp } from '../../src/app.js'

describe('App factory (buildApp)', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns a Fastify instance', () => {
    expect(app).toBeTruthy()
    expect(typeof app.inject).toBe('function')
    expect(typeof app.close).toBe('function')
  })

  it('has error handler registered (not the default)', async () => {
    // Create a fresh app to register test route before ready()
    const testApp = await buildApp()
    testApp.get('/test/app-error', async () => {
      throw new Error('test')
    })
    await testApp.ready()

    const response = await testApp.inject({ method: 'GET', url: '/test/app-error' })
    const body = response.json() as { error: string; code: string }

    // Custom error handler returns 'INTERNAL_ERROR', default would return different shape
    expect(body.code).toBe('INTERNAL_ERROR')

    await testApp.close()
  })
})

describe('Zod type provider wiring', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()

    // Register a test route that uses Zod schema for validation
    app.post('/test/zod-validation', {
      schema: {
        body: z.object({
          name: z.string().min(1),
          age: z.number().int().positive(),
        }),
      },
      handler: async (request, reply) => {
        return reply.status(200).send({ received: true })
      },
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('validates request body via Zod schema — valid input passes', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/test/zod-validation',
      payload: { name: 'Salmen', age: 30 },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json() as { received: boolean }
    expect(body.received).toBe(true)
  })

  it('validates request body via Zod schema — invalid input returns 400', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/test/zod-validation',
      payload: { name: '', age: -1 },
    })

    expect(response.statusCode).toBe(400)
    const body = response.json() as { error: string; code: string }
    expect(typeof body.error).toBe('string')
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('validates request body via Zod schema — missing fields returns 400', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/test/zod-validation',
      payload: {},
    })

    expect(response.statusCode).toBe(400)
  })
})
