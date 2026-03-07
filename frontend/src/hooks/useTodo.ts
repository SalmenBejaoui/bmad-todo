import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import type { Todo } from '../types/todo'

export function useTodo(id: string) {
  const queryClient = useQueryClient()

  return useQuery<Todo>({
    queryKey: ['todos', id],
    queryFn: () => apiClient.get<Todo>(`/todos/${id}`),
    initialData: () => {
      const todos = queryClient.getQueryData<Todo[]>(['todos'])
      return todos?.find((t) => t.id === id)
    },
  })
}
