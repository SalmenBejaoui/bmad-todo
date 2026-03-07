import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../hooks/useToggleTodo', () => ({
  useToggleTodo: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

import { useToggleTodo } from '../hooks/useToggleTodo'
import type { Todo } from '../types/todo'
import { TaskDetailModal } from './TaskDetailModal'

const mockToggleMutate = vi.fn()

const activeTodo: Todo = {
  id: '1',
  title: 'Buy groceries',
  description: 'Milk, eggs, bread',
  completed: false,
  userId: null,
  createdAt: '2024-01-15T10:00:00.000Z',
  doneAt: null,
  updatedAt: '2024-01-15T10:00:00.000Z',
  deletedAt: null,
}

const completedTodo: Todo = {
  ...activeTodo,
  completed: true,
  doneAt: '2024-01-15T12:00:00.000Z',
  updatedAt: '2024-01-15T12:00:00.000Z',
}

const noDescTodo: Todo = {
  ...activeTodo,
  description: null,
}

function renderModal(todo: Todo, onDelete = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return {
    onDelete,
    ...render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          MemoryRouter,
          null,
          createElement(TaskDetailModal, { todo, onDelete }),
        ),
      ),
    ),
  }
}

describe('TaskDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useToggleTodo).mockReturnValue({
      mutate: mockToggleMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useToggleTodo>)
  })

  it('renders title and description', () => {
    renderModal(activeTodo)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    expect(screen.getByText('Milk, eggs, bread')).toBeInTheDocument()
  })

  it('renders "No description added." when description is null', () => {
    renderModal(noDescTodo)
    expect(screen.getByText('No description added.')).toBeInTheDocument()
  })

  it('renders formatted creation timestamp with <time> element', () => {
    renderModal(activeTodo)
    const timeEls = screen.getAllByRole('time', { hidden: true })
    expect(timeEls.length).toBeGreaterThan(0)
  })

  it('shows "Mark as done" and "Delete" for active task', () => {
    renderModal(activeTodo)
    expect(screen.getByRole('button', { name: 'Mark as done' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mark as active' })).not.toBeInTheDocument()
  })

  it('shows "Mark as active" and "Delete" for completed task', () => {
    renderModal(completedTodo)
    expect(screen.getByRole('button', { name: 'Mark as active' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mark as done' })).not.toBeInTheDocument()
  })

  it('shows "Completed" timestamp for completed task', () => {
    renderModal(completedTodo)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('does not show "Completed" timestamp for active task', () => {
    renderModal(activeTodo)
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })

  it('calls toggleTodo when "Mark as done" is clicked', async () => {
    renderModal(activeTodo)
    await userEvent.click(screen.getByRole('button', { name: 'Mark as done' }))
    expect(mockToggleMutate).toHaveBeenCalledWith({ id: '1', completed: true })
  })

  it('calls toggleTodo when "Mark as active" is clicked', async () => {
    renderModal(completedTodo)
    await userEvent.click(screen.getByRole('button', { name: 'Mark as active' }))
    expect(mockToggleMutate).toHaveBeenCalledWith({ id: '1', completed: false })
  })

  it('calls onDelete with todo id when "Delete" is clicked', async () => {
    const onDelete = vi.fn()
    renderModal(activeTodo, onDelete)
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith('1')
  })
})
