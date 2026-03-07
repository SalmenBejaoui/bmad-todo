import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { toast } from 'sonner'
import './App.css'
import { AddTaskModal } from './components/AddTaskModal'
import { AppHeader } from './components/AppHeader'
import { TaskList } from './components/TaskList'
import { useDeleteTodo } from './hooks/useDeleteTodo'
import { useTodos } from './hooks/useTodos'
import { useToggleTodo } from './hooks/useToggleTodo'

export default function App() {
  const navigate = useNavigate()
  const { data: todos, isLoading, isError } = useTodos()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { mutate: toggleTodo } = useToggleTodo({
    onError: () => toast.error("Couldn't update. Try again."),
  })
  const { deleteTodo } = useDeleteTodo()

  const handleToggle = (id: string) => {
    const todo = todos?.find((t) => t.id === id)
    if (todo) {
      toggleTodo({ id, completed: !todo.completed })
    }
  }

  const handleClickTodo = (id: string) => {
    navigate(`/todos/${id}`)
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="max-w-xl mx-auto px-4">
        <AppHeader onAddTask={() => setIsAddModalOpen(true)} />
        <TaskList
          todos={todos}
          isLoading={isLoading}
          isError={isError}
          onToggle={handleToggle}
          onDelete={deleteTodo}
          onClickTodo={handleClickTodo}
        />
      </div>
      <AddTaskModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <Outlet context={{ onDelete: deleteTodo }} />
    </main>
  )
}
