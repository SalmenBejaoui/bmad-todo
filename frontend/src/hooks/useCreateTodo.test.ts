import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '../lib/api-client'
import type { Todo } from '../types/todo'
import { useCreateTodo } from './useCreateTodo'

const mockTodo: Todo = {
  id: '1',
  title: 'Test task',
  description: null,
  completed: false,
  userId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  doneAt: null,
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  }
}

describe('useCreateTodo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls apiClient.post with the correct payload', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(mockTodo)
    const { queryClient, wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateTodo(), { wrapper })

    await act(async () => {
      result.current.mutate({ title: 'Test task' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.post).toHaveBeenCalledWith('/todos', { title: 'Test task' })
    await act(async () => {
      await queryClient.cancelQueries()
    })
  })

  it('adds an optimistic todo to the cache before the request resolves', async () => {
    let resolvePost!: (value: Todo) => void
    vi.mocked(apiClient.post).mockReturnValue(new Promise((res) => { resolvePost = res }))

    const { queryClient, wrapper } = makeWrapper()
    queryClient.setQueryData<Todo[]>(['todos'], [])

    const { result } = renderHook(() => useCreateTodo(), { wrapper })

    act(() => {
      result.current.mutate({ title: 'New task' })
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<Todo[]>(['todos'])
      return cached !== undefined && cached.length > 0
    })

    const cached = queryClient.getQueryData<Todo[]>(['todos'])
    expect(cached).toHaveLength(1)
    expect(cached![0].title).toBe('New task')
    expect(cached![0].id).toMatch(/^pending-/)

    resolvePost(mockTodo)

    await act(async () => {
      await queryClient.cancelQueries()
    })
  })

  it('rolls back the optimistic update on error', async () => {
    const existingTodo: Todo = { ...mockTodo, id: '99', title: 'Existing' }
    vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'))

    const { queryClient, wrapper } = makeWrapper()
    queryClient.setQueryData<Todo[]>(['todos'], [existingTodo])

    const { result } = renderHook(() => useCreateTodo(), { wrapper })

    await act(async () => {
      result.current.mutate({ title: 'Will fail' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    const cached = queryClient.getQueryData<Todo[]>(['todos'])
    expect(cached).toHaveLength(1)
    expect(cached![0].id).toBe('99')
  })

  it('calls the onError callback when mutation fails', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new Error('fail'))
    const onError = vi.fn()
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateTodo({ onError }), { wrapper })

    await act(async () => {
      result.current.mutate({ title: 'Will fail' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(onError).toHaveBeenCalledOnce()
  })
})
