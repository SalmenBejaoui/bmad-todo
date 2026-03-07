import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import type { Todo } from '../types/todo'

interface CreateTodoInput {
  title: string
  description?: string
}

interface UseCreateTodoOptions {
  onError?: () => void
}

export function useCreateTodo(options?: UseCreateTodoOptions) {
  const queryClient = useQueryClient()

  return useMutation<Todo, Error, CreateTodoInput>({
    mutationFn: (data) => apiClient.post<Todo>('/todos', data),

    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])
      const optimisticTodo: Todo = {
        id: `pending-${Date.now()}`,
        title: newTodo.title,
        description: newTodo.description ?? null,
        completed: false,
        userId: null,
        createdAt: new Date().toISOString(),
        doneAt: null,
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      }
      queryClient.setQueryData<Todo[]>(['todos'], (old) => [optimisticTodo, ...(old ?? [])])
      return { previousTodos, optimisticTodo }
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['todos'], (context as { previousTodos?: Todo[] } | undefined)?.previousTodos)
      options?.onError?.()
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
