import { useNavigate, useOutletContext, useParams } from 'react-router'
import { useTodo } from '../hooks/useTodo'
import { TaskDetailModal } from './TaskDetailModal'

interface OutletContext {
  onDelete: (id: string) => void
}

export function TodoDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { onDelete } = useOutletContext<OutletContext>()
  const { data: todo, isLoading } = useTodo(id ?? '')

  if (!id) {
    navigate('/')
    return null
  }

  if (isLoading || !todo) {
    return null
  }

  return <TaskDetailModal todo={todo} onDelete={onDelete} />
}
