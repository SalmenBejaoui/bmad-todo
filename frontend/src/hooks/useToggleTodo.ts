import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import type { Todo } from '../types/todo'

interface ToggleTodoInput {
  id: string
  completed: boolean
}

interface UseToggleTodoOptions {
  onError?: () => void
}

export function useToggleTodo(options?: UseToggleTodoOptions) {
  const queryClient = useQueryClient()

  return useMutation<Todo, Error, ToggleTodoInput>({
    mutationFn: ({ id, completed }) =>
      apiClient.patch<Todo>(`/todos/${id}`, { completed }),

    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])

      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        (old ?? []).map((todo) =>
          todo.id === id
            ? {
                ...todo,
                completed,
                doneAt: completed ? new Date().toISOString() : null,
                updatedAt: new Date().toISOString(),
              }
            : todo,
        ),
      )

      return { previousTodos }
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(
        ['todos'],
        (context as { previousTodos?: Todo[] } | undefined)?.previousTodos,
      )
      options?.onError?.()
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
