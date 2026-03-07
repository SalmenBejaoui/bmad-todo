import { useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateTodo } from '../hooks/useCreateTodo'

interface AddTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTaskModal({ open, onOpenChange }: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const skipReset = useRef(false)

  const { mutate, isPending } = useCreateTodo({
    onError: () => {
      skipReset.current = true
      onOpenChange(true)
      toast.error("Couldn't save your task. Try again.")
    },
  })

  const handleSubmit = () => {
    if (!title.trim()) return
    mutate({ title: title.trim(), description: description.trim() || undefined })
    onOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && title.trim()) {
      handleSubmit()
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      if (skipReset.current) {
        skipReset.current = false
      } else {
        setTitle('')
        setDescription('')
      }
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface rounded-lg p-6 shadow-xl w-full max-w-md z-50 focus:outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-base font-semibold text-text-primary">
              Add task
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="p-2 min-h-11 min-w-11 flex items-center justify-center rounded text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-safe:transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="task-title" className="sr-only">
                Task title
              </label>
              <input
                id="task-title"
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                required
                className="w-full rounded-md border border-border px-3 py-2 text-base text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 bg-surface"
              />
            </div>
            <div>
              <label htmlFor="task-description" className="sr-only">
                Task description (optional)
              </label>
              <textarea
                id="task-description"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 bg-surface resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <Dialog.Close asChild>
              <button className="rounded-md px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || isPending}
              className="inline-flex items-center rounded-md bg-accent px-3 py-2 min-h-11 text-sm font-medium text-white hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed motion-safe:transition-colors"
            >
              Add task
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
