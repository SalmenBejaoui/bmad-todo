export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm font-medium text-text-secondary">No tasks yet.</p>
      <p className="text-sm text-text-muted mt-1">
        Tap '+ Add task' to capture your first task.
      </p>
    </div>
  )
}
