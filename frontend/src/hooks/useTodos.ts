import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import type { Todo } from '../types/todo'

export function useTodos() {
  return useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: () => apiClient.get<Todo[]>('/todos'),
  })
}
