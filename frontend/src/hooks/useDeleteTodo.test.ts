import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
  }),
}))

import { apiClient } from '../lib/api-client'
import { toast } from 'sonner'
import type { Todo } from '../types/todo'
import { useDeleteTodo } from './useDeleteTodo'

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

describe('useDeleteTodo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('optimistically removes the todo from the cache', () => {
    const { queryClient, wrapper } = makeWrapper()
    queryClient.setQueryData<Todo[]>(['todos'], [baseTodo])

    const { result } = renderHook(() => useDeleteTodo(), { wrapper })

    act(() => {
      result.current.deleteTodo('1')
    })

    const cached = queryClient.getQueryData<Todo[]>(['todos'])
    expect(cached).toHaveLength(0)
  })

  it('shows a toast with Undo action', () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useDeleteTodo(), { wrapper })

    act(() => {
      result.current.deleteTodo('1')
    })

    expect(toast).toHaveBeenCalledWith(
      'Task deleted.',
      expect.objectContaining({
        duration: 5000,
        action: expect.objectContaining({ label: 'Undo' }),
      }),
    )
  })

  it('fires DELETE API call after 5 seconds', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(undefined)
    const { queryClient, wrapper } = makeWrapper()
    queryClient.setQueryData<Todo[]>(['todos'], [baseTodo])

    const { result } = renderHook(() => useDeleteTodo(), { wrapper })

    act(() => {
      result.current.deleteTodo('1')
    })

    expect(apiClient.delete).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    expect(apiClient.delete).toHaveBeenCalledWith('/todos/1')
  })

  it('restores the todo and shows error toast when DELETE fails', async () => {
    vi.mocked(apiClient.delete).mockRejectedValue(new Error('Network error'))
    const { queryClient, wrapper } = makeWrapper()
    queryClient.setQueryData<Todo[]>(['todos'], [baseTodo])

    const { result } = renderHook(() => useDeleteTodo(), { wrapper })

    act(() => {
      result.current.deleteTodo('1')
    })

    // Todo removed optimistically
    expect(queryClient.getQueryData<Todo[]>(['todos'])).toHaveLength(0)

    // Advance timer and flush the rejected promise
    await act(async () => {
      vi.advanceTimersByTime(5000)
      // Flush microtasks so the rejected promise resolves
      await Promise.resolve()
      await Promise.resolve()
    })

    const cached = queryClient.getQueryData<Todo[]>(['todos'])
    expect(cached).toBeDefined()
    expect(cached!.length).toBeGreaterThan(0)
    expect(cached![0].id).toBe('1')
    expect(toast.error).toHaveBeenCalledWith("Couldn't delete. Try again.")
  })

  it('does not call DELETE if undo is triggered before 5 seconds', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(undefined)
    const { queryClient, wrapper } = makeWrapper()
    queryClient.setQueryData<Todo[]>(['todos'], [baseTodo])

    const { result } = renderHook(() => useDeleteTodo(), { wrapper })

    act(() => {
      result.current.deleteTodo('1')
    })

    // Simulate undo click — get the action onClick from the toast call
    const toastCall = vi.mocked(toast).mock.calls[0]
    const toastOptions = toastCall[1] as unknown as { action: { onClick: (e: unknown) => void } }

    act(() => {
      toastOptions.action.onClick({})
    })

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    expect(apiClient.delete).not.toHaveBeenCalled()

    // Snapshot restored
    const cached = queryClient.getQueryData<Todo[]>(['todos'])
    expect(cached![0].id).toBe('1')
  })
})
