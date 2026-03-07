import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useToggleTodo } from '../hooks/useToggleTodo'
import type { Todo } from '../types/todo'

interface TaskDetailModalProps {
  todo: Todo
  onDelete: (id: string) => void
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function TaskDetailModal({ todo, onDelete }: TaskDetailModalProps) {
  const navigate = useNavigate()
  const { mutate: toggleTodo } = useToggleTodo({
    onError: () => toast.error("Couldn't update. Try again."),
  })

  const handleClose = () => {
    navigate('/')
  }

  const handleToggle = () => {
    toggleTodo({ id: todo.id, completed: !todo.completed })
    navigate('/')
  }

  const handleDelete = () => {
    navigate('/')
    onDelete(todo.id)
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface rounded-lg shadow-xl w-full max-w-md z-50 focus:outline-none flex flex-col max-h-[90vh]"
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <Dialog.Title className="text-base font-semibold text-text-primary pr-4 leading-snug">
              {todo.title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="shrink-0 p-2 min-h-11 min-w-11 flex items-center justify-center rounded text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-safe:transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="px-6 pb-4 space-y-4 overflow-y-auto flex-1">
            {/* Description */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                Description
              </p>
              {todo.description ? (
                <p className="text-sm text-text-primary">{todo.description}</p>
              ) : (
                <p className="text-sm italic text-text-muted">No description added.</p>
              )}
            </div>

            {/* Timestamps */}
            <div className="space-y-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-0.5">
                  Created
                </p>
                <time dateTime={todo.createdAt} className="text-sm text-text-primary">
                  {formatDate(todo.createdAt)}
                </time>
              </div>

              {todo.doneAt && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-0.5">
                    Completed
                  </p>
                  <time dateTime={todo.doneAt} className="text-sm text-text-primary">
                    {formatDate(todo.doneAt)}
                  </time>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-0.5">
                  Last modified
                </p>
                <time dateTime={todo.updatedAt} className="text-sm text-text-primary">
                  {formatDate(todo.updatedAt)}
                </time>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border">
            <button
              onClick={handleToggle}
              className="flex-1 rounded-md bg-accent px-3 py-2 min-h-11 text-sm font-medium text-white hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 motion-safe:transition-colors"
            >
              {todo.completed ? 'Mark as active' : 'Mark as done'}
            </button>
            <button
              onClick={handleDelete}
              className="rounded-md border border-error px-3 py-2 min-h-11 text-sm font-medium text-error hover:bg-error hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 motion-safe:transition-colors"
            >
              Delete
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
