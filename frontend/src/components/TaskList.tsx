import type { Todo } from '../types/todo'
import { SectionHeader } from './SectionHeader'
import { TaskRow } from './TaskRow'
import { EmptyState } from './EmptyState'

interface TaskListProps {
  todos: Todo[] | undefined
  isLoading: boolean
  isError: boolean
  onToggle?: (id: string) => void
  onDelete?: (id: string) => void
  onClickTodo?: (id: string) => void
}

function SkeletonRow() {
  return (
    <li className="flex items-center gap-3 py-3 px-1">
      <div className="h-5 w-5 shrink-0 rounded bg-border animate-pulse" />
      <div className="h-4 flex-1 rounded bg-border animate-pulse" />
    </li>
  )
}

export function TaskList({ todos, isLoading, isError, onToggle, onDelete, onClickTodo }: TaskListProps) {
  if (isLoading) {
    return (
      <ul role="list" aria-label="Loading tasks">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </ul>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-error py-4" role="alert">
        Couldn't load your tasks. Please try again.
      </p>
    )
  }

  const activeTodos = (todos ?? []).filter((t) => !t.completed)
  const doneTodos = (todos ?? []).filter((t) => t.completed)

  if (activeTodos.length === 0 && doneTodos.length === 0) {
    return <EmptyState />
  }

  return (
    <div aria-live="polite">
      {activeTodos.length > 0 && (
        <section aria-label={`Active tasks, ${activeTodos.length} total`}>
          <SectionHeader label="Active" count={activeTodos.length} />
          <ul role="list">
            {activeTodos.map((todo) => (
              <TaskRow
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onClick={onClickTodo}
              />
            ))}
          </ul>
        </section>
      )}
      {doneTodos.length > 0 && (
        <section aria-label={`Done tasks, ${doneTodos.length} total`} className="mt-4">
          <SectionHeader label="Done" count={doneTodos.length} />
          <ul role="list">
            {doneTodos.map((todo) => (
              <TaskRow
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onClick={onClickTodo}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
