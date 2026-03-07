interface AppHeaderProps {
  onAddTask: () => void
}

export function AppHeader({ onAddTask }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between py-6">
      <h1 className="text-xl font-semibold text-text-primary">My Tasks</h1>
      <button
        onClick={onAddTask}
        className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-2 min-h-11 text-sm font-medium text-white hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 motion-safe:transition-colors"
      >
        + Add task
      </button>
    </header>
  )
}
