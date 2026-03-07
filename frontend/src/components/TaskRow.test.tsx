import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { TaskRow } from './TaskRow'
import type { Todo } from '../types/todo'

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

describe('TaskRow', () => {
  it('renders active task title without strikethrough', () => {
    render(<ul><TaskRow todo={makeTodo({ title: 'Active task', completed: false })} /></ul>)
    const title = screen.getByText('Active task')
    expect(title).not.toHaveClass('line-through')
  })

  it('renders completed task title with line-through class', () => {
    render(<ul><TaskRow todo={makeTodo({ title: 'Done task', completed: true })} /></ul>)
    const title = screen.getByText('Done task')
    expect(title).toHaveClass('line-through')
  })

  it('renders checkbox aria-label for active task', () => {
    render(<ul><TaskRow todo={makeTodo({ title: 'My task', completed: false })} /></ul>)
    expect(screen.getByRole('checkbox', { name: "Mark 'My task' as complete" })).toBeInTheDocument()
  })

  it('renders checkbox aria-label for completed task', () => {
    render(<ul><TaskRow todo={makeTodo({ title: 'My task', completed: true })} /></ul>)
    expect(screen.getByRole('checkbox', { name: "Mark 'My task' as incomplete" })).toBeInTheDocument()
  })

  it('renders delete button with aria-label containing task title', () => {
    render(<ul><TaskRow todo={makeTodo({ title: 'My task' })} /></ul>)
    expect(screen.getByRole('button', { name: "Delete 'My task'" })).toBeInTheDocument()
  })

  it('fires onToggle with todo id when checkbox is clicked', async () => {
    const onToggle = vi.fn()
    render(<ul><TaskRow todo={makeTodo({ id: 'abc', title: 'Toggle test' })} onToggle={onToggle} /></ul>)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('abc')
  })

  it('fires onClick with todo id when task body is clicked', async () => {
    const onClick = vi.fn()
    render(<ul><TaskRow todo={makeTodo({ id: 'xyz', title: 'Click test' })} onClick={onClick} /></ul>)
    await userEvent.click(screen.getByText('Click test'))
    expect(onClick).toHaveBeenCalledWith('xyz')
  })

  it('fires onDelete with todo id when delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(<ul><TaskRow todo={makeTodo({ id: 'del1', title: 'Delete me' })} onDelete={onDelete} /></ul>)
    await userEvent.click(screen.getByRole('button', { name: "Delete 'Delete me'" }))
    expect(onDelete).toHaveBeenCalledWith('del1')
  })

  it('applies motion-safe transition classes on title', () => {
    render(<ul><TaskRow todo={makeTodo({ title: 'Transition test' })} /></ul>)
    const title = screen.getByText('Transition test')
    expect(title.className).toContain('motion-safe:transition-all')
    expect(title.className).toContain('motion-safe:duration-150')
  })
})
