import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Trash2 } from 'lucide-react'
import type { Todo } from '../types/todo'

interface TaskRowProps {
  todo: Todo
  onToggle?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (id: string) => void
}

export function TaskRow({ todo, onToggle, onDelete, onClick }: TaskRowProps) {
  return (
    <li className="group flex items-center gap-3 py-3 px-1">
      <CheckboxPrimitive.Root
        checked={todo.completed}
        onCheckedChange={() => onToggle?.(todo.id)}
        aria-label={`Mark '${todo.title}' as ${todo.completed ? 'incomplete' : 'complete'}`}
        className="h-5 w-5 shrink-0 rounded border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 data-[state=checked]:bg-accent data-[state=checked]:border-accent motion-safe:transition-colors"
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      <button
        onClick={() => onClick?.(todo.id)}
        className="flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
      >
        <span
          className={`text-sm motion-safe:transition-all motion-safe:duration-150 motion-safe:ease-in-out ${
            todo.completed
              ? 'line-through text-text-muted'
              : 'text-text-primary'
          }`}
        >
          {todo.title}
        </span>
      </button>

      <button
        onClick={() => onDelete?.(todo.id)}
        aria-label={`Delete '${todo.title}'`}
        className="shrink-0 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 p-2 min-h-11 min-w-11 flex items-center justify-center rounded text-text-muted hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 motion-safe:transition-opacity"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  )
}
