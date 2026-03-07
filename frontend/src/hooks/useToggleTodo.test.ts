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
import { useToggleTodo } from './useToggleTodo'

const baseTodo: Todo = {
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

describe('useToggleTodo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls apiClient.patch with correct id and completed value', async () => {
    const updatedTodo = { ...baseTodo, completed: true, doneAt: new Date().toISOString() }
    vi.mocked(apiClient.patch).mockResolvedValue(updatedTodo)
    const { queryClient, wrapper } = makeWrapper()

    const { result } = renderHook(() => useToggleTodo(), { wrapper })

    await act(async () => {
      result.current.mutate({ id: '1', completed: true })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.patch).toHaveBeenCalledWith('/todos/1', { completed: true })

    await act(async () => {
      await queryClient.cancelQueries()
    })
  })

  it('optimistically updates the todo to completed in the cache', async () => {
    let resolvePost!: (value: Todo) => void
    vi.mocked(apiClient.patch).mockReturnValue(new Promise((res) => { resolvePost = res }))

    const { queryClient, wrapper } = makeWrapper()
    queryClient.setQueryData<Todo[]>(['todos'], [baseTodo])

    const { result } = renderHook(() => useToggleTodo(), { wrapper })

    act(() => {
      result.current.mutate({ id: '1', completed: true })
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<Todo[]>(['todos'])
      return cached?.[0]?.completed === true
    })

    const cached = queryClient.getQueryData<Todo[]>(['todos'])
    expect(cached![0].completed).toBe(true)
    expect(cached![0].doneAt).not.toBeNull()

    resolvePost({ ...baseTodo, completed: true })
    await act(async () => { await queryClient.cancelQueries() })
  })

  it('optimistically reverts a completed todo back to active', async () => {
    const completedTodo = { ...baseTodo, completed: true, doneAt: '2024-01-01T00:00:00.000Z' }
    let resolvePost!: (value: Todo) => void
    vi.mocked(apiClient.patch).mockReturnValue(new Promise((res) => { resolvePost = res }))

    const { queryClient, wrapper } = makeWrapper()
    queryClient.setQueryData<Todo[]>(['todos'], [completedTodo])

    const { result } = renderHook(() => useToggleTodo(), { wrapper })

    act(() => {
      result.current.mutate({ id: '1', completed: false })
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<Todo[]>(['todos'])
      return cached?.[0]?.completed === false
    })

    const cached = queryClient.getQueryData<Todo[]>(['todos'])
    expect(cached![0].completed).toBe(false)
    expect(cached![0].doneAt).toBeNull()

    resolvePost({ ...completedTodo, completed: false, doneAt: null })
    await act(async () => { await queryClient.cancelQueries() })
  })

  it('rolls back the cache on error', async () => {
    vi.mocked(apiClient.patch).mockRejectedValue(new Error('Network error'))

    const { queryClient, wrapper } = makeWrapper()
    queryClient.setQueryData<Todo[]>(['todos'], [baseTodo])

    const { result } = renderHook(() => useToggleTodo(), { wrapper })

    await act(async () => {
      result.current.mutate({ id: '1', completed: true })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    const cached = queryClient.getQueryData<Todo[]>(['todos'])
    expect(cached![0].completed).toBe(false)
  })

  it('calls onError callback when mutation fails', async () => {
    vi.mocked(apiClient.patch).mockRejectedValue(new Error('fail'))
    const onError = vi.fn()
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useToggleTodo({ onError }), { wrapper })

    await act(async () => {
      result.current.mutate({ id: '1', completed: true })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(onError).toHaveBeenCalledOnce()
  })
})
