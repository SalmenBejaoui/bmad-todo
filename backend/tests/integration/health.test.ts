import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../../src/app.js'

describe('Health endpoint', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /health → 200 with status ok and ISO-8601 timestamp', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)

    const body = response.json() as { status: string; timestamp: string }
    expect(body.status).toBe('ok')
    expect(typeof body.timestamp).toBe('string')

    // Validate ISO-8601: Date.parse returns NaN for invalid strings
    const parsed = Date.parse(body.timestamp)
    expect(Number.isNaN(parsed)).toBe(false)
  })

  it('GET /health → Content-Type is application/json', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.headers['content-type']).toMatch(/application\/json/)
  })
})

describe('Unknown route', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /unknown-route → 404 with architecture-compliant error envelope', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/this-route-does-not-exist',
    })

    expect(response.statusCode).toBe(404)

    const body = response.json() as { error: string; code: string }
    expect(body.error).toBe('Not Found')
    expect(body.code).toBe('NOT_FOUND')
  })
})

describe('Error handler', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()

    // Register a test-only route that throws a 5xx error
    app.get('/test/error/500', async () => {
      throw new Error('Simulated internal error')
    })

    // Register a test-only route that throws a 4xx error
    app.get('/test/error/400', async () => {
      const err = Object.assign(new Error('Bad request simulation'), { statusCode: 400 })
      throw err
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('5xx error → { error: "Internal server error", code: "INTERNAL_ERROR" } with no stack trace', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test/error/500',
    })

    expect(response.statusCode).toBe(500)

    const body = response.json() as { error: string; code: string }
    expect(body.error).toBe('Internal server error')
    expect(body.code).toBe('INTERNAL_ERROR')
    // Ensure no stack trace or internal details are exposed
    expect(JSON.stringify(body)).not.toContain('stack')
    expect(JSON.stringify(body)).not.toContain('Simulated internal error')
  })

  it('4xx error → { error: string, code: string }', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test/error/400',
    })

    expect(response.statusCode).toBe(400)

    const body = response.json() as { error: string; code: string }
    expect(typeof body.error).toBe('string')
    expect(typeof body.code).toBe('string')
    expect(JSON.stringify(body)).not.toContain('stack')
  })
})
