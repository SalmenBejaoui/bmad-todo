import { useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { toast } from 'sonner'
import { apiClient } from '../lib/api-client'
import type { Todo } from '../types/todo'

const UNDO_DELAY_MS = 5000

export function useDeleteTodo() {
  const queryClient = useQueryClient()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const deleteTodo = (id: string) => {
    // Snapshot and optimistically remove
    const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])
    queryClient.setQueryData<Todo[]>(['todos'], (old) =>
      (old ?? []).filter((t) => t.id !== id),
    )

    const restore = () => {
      queryClient.setQueryData(['todos'], previousTodos)
    }

    // Cancel any existing pending timer
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // Show undo toast
    toast('Task deleted.', {
      duration: UNDO_DELAY_MS,
      action: {
        label: 'Undo',
        onClick: () => {
          if (timerRef.current !== null) {
            clearTimeout(timerRef.current)
            timerRef.current = null
          }
          restore()
        },
      },
    })

    // Schedule the actual DELETE
    timerRef.current = setTimeout(async () => {
      timerRef.current = null
      try {
        await apiClient.delete(`/todos/${id}`)
        queryClient.invalidateQueries({ queryKey: ['todos'] })
      } catch {
        restore()
        toast.error("Couldn't delete. Try again.")
      }
    }, UNDO_DELAY_MS)
  }

  return { deleteTodo }
}
