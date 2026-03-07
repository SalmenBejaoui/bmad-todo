import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../../src/app.js'

describe('CORS', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns Access-Control-Allow-Origin header on simple requests', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'http://localhost:5173' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  })

  it('handles OPTIONS preflight requests', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/health',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'GET',
      },
    })

    // Preflight returns 204 with CORS headers
    expect(response.statusCode).toBe(204)
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    expect(response.headers['access-control-allow-methods']).toBeTruthy()
  })

  it('does not set Access-Control-Allow-Origin for disallowed origins', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'http://evil.com' },
    })

    expect(response.statusCode).toBe(200)
    // The origin header must NOT echo back the disallowed origin
    const allowOrigin = response.headers['access-control-allow-origin']
    expect(allowOrigin).not.toBe('http://evil.com')
    expect(allowOrigin).not.toBe('*')
  })
})
