import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TaskList } from './TaskList'
import type { Todo } from '../types/todo'

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: '1',
  title: 'Test task',
  description: null,
  completed: false,
  userId: null,
  createdAt: new Date().toISOString(),
  doneAt: null,
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  ...overrides,
})

describe('TaskList', () => {
  it('renders 3 skeleton rows while loading', () => {
    renderWithClient(<TaskList todos={undefined} isLoading={true} isError={false} />)
    // Skeleton rows: check that the animate-pulse elements are there
    const list = screen.getByRole('list', { name: 'Loading tasks' })
    expect(list).toBeInTheDocument()
    expect(list.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(3)
  })

  it('renders empty state when todos array is empty', () => {
    renderWithClient(<TaskList todos={[]} isLoading={false} isError={false} />)
    expect(screen.getByText('No tasks yet.')).toBeInTheDocument()
    expect(screen.getByText(/Tap .\+ Add task./)).toBeInTheDocument()
  })

  it('renders active section and done section with correct counts', () => {
    const todos = [
      makeTodo({ id: '1', title: 'Active task', completed: false }),
      makeTodo({ id: '2', title: 'Done task', completed: true }),
    ]
    renderWithClient(<TaskList todos={todos} isLoading={false} isError={false} />)
    expect(screen.getByText('Active · 1')).toBeInTheDocument()
    expect(screen.getByText('Done · 1')).toBeInTheDocument()
    expect(screen.getByText('Active task')).toBeInTheDocument()
    expect(screen.getByText('Done task')).toBeInTheDocument()
  })

  it('renders only active section when no done todos', () => {
    const todos = [makeTodo({ id: '1', title: 'Only active', completed: false })]
    renderWithClient(<TaskList todos={todos} isLoading={false} isError={false} />)
    expect(screen.getByText('Active · 1')).toBeInTheDocument()
    expect(screen.queryByText(/Done · /)).not.toBeInTheDocument()
  })

  it('renders error message when isError is true', () => {
    renderWithClient(<TaskList todos={undefined} isLoading={false} isError={true} />)
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load your tasks. Please try again.")
  })
})
