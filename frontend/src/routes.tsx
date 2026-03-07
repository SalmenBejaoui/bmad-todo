import { createBrowserRouter } from 'react-router'
import App from './App'
import { TodoDetailRoute } from './components/TodoDetailRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'todos/:id',
        element: <TodoDetailRoute />,
      },
    ],
  },
])
