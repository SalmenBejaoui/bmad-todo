import { createBrowserRouter } from 'react-router'

function TaskListPlaceholder() {
  return <div>Task List — Epic 3</div>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <TaskListPlaceholder />,
  },
  {
    path: '/todos/:id',
    element: <TaskListPlaceholder />,
  },
])
