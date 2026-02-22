import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient, ApiError } from './api-client'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockReset()
})

describe('ApiError', () => {
  it('carries status and message', () => {
    const err = new ApiError(404, 'Not Found')
    expect(err.status).toBe(404)
    expect(err.message).toBe('Not Found')
    expect(err.name).toBe('ApiError')
  })

  it('carries optional code', () => {
    const err = new ApiError(422, 'Unprocessable', 'VALIDATION_ERROR')
    expect(err.code).toBe('VALIDATION_ERROR')
  })
})

describe('apiClient', () => {
  it('GET sends Content-Type header', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ id: '1' }), { status: 200 }),
    )
    await apiClient.get('/todos')
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['Content-Type']).toBe(
      'application/json',
    )
  })

  it('POST sends method, body, and Content-Type header', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ id: '2' }), { status: 201 }),
    )
    await apiClient.post('/todos', { title: 'test' })
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ title: 'test' }))
    expect((init.headers as Record<string, string>)['Content-Type']).toBe(
      'application/json',
    )
  })

  it('DELETE sends no body', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 204 }))
    await apiClient.del('/todos/1')
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(init.method).toBe('DELETE')
    expect(init.body).toBeUndefined()
  })

  it('throws ApiError on non-2xx response', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 }),
    )
    await expect(apiClient.get('/todos/missing')).rejects.toBeInstanceOf(ApiError)
  })

  it('includes error code from response body', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ error: 'Conflict', code: 'DUPLICATE' }),
        { status: 409 },
      ),
    )
    try {
      await apiClient.get('/todos')
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      expect((e as ApiError).code).toBe('DUPLICATE')
    }
  })

  it('returns undefined for 204 No Content', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 204 }))
    const result = await apiClient.del('/todos/1')
    expect(result).toBeUndefined()
  })
})
