import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../hooks/useCreateTodo', () => ({
  useCreateTodo: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

import { useCreateTodo } from '../hooks/useCreateTodo'
import { AddTaskModal } from './AddTaskModal'

const mockMutate = vi.fn()
const defaultMockHook = { mutate: mockMutate, isPending: false } as unknown

function renderModal(open = true, onOpenChange = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return {
    onOpenChange,
    ...render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(AddTaskModal, { open, onOpenChange }),
      ),
    ),
  }
}

describe('AddTaskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCreateTodo).mockReturnValue(defaultMockHook as unknown as ReturnType<typeof useCreateTodo>)
  })

  it('renders the modal with title input when open', () => {
    renderModal()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Task title')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Description (optional)')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderModal(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('disables the Add task button when title is empty', () => {
    renderModal()
    const addButton = screen.getByRole('button', { name: 'Add task' })
    expect(addButton).toBeDisabled()
  })

  it('enables the Add task button when title has content', async () => {
    renderModal()
    const input = screen.getByLabelText('Task title')
    await userEvent.type(input, 'New task')
    const addButton = screen.getByRole('button', { name: 'Add task' })
    expect(addButton).toBeEnabled()
  })

  it('calls mutate and closes the modal on submit', async () => {
    const onOpenChange = vi.fn()
    renderModal(true, onOpenChange)

    const input = screen.getByLabelText('Task title')
    await userEvent.type(input, 'My task')
    const addButton = screen.getByRole('button', { name: 'Add task' })
    await userEvent.click(addButton)

    expect(mockMutate).toHaveBeenCalledWith({ title: 'My task', description: undefined })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('submits on Enter key press in the title input', async () => {
    const onOpenChange = vi.fn()
    renderModal(true, onOpenChange)

    const input = screen.getByLabelText('Task title')
    await userEvent.type(input, 'Enter task')
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockMutate).toHaveBeenCalledWith({ title: 'Enter task', description: undefined })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not submit on Enter when title is empty', () => {
    renderModal()
    const input = screen.getByLabelText('Task title')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('includes description when provided', async () => {
    const onOpenChange = vi.fn()
    renderModal(true, onOpenChange)

    await userEvent.type(screen.getByLabelText('Task title'), 'Task with desc')
    await userEvent.type(screen.getByPlaceholderText('Description (optional)'), 'Some details')
    await userEvent.click(screen.getByRole('button', { name: 'Add task' }))

    expect(mockMutate).toHaveBeenCalledWith({ title: 'Task with desc', description: 'Some details' })
  })

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    renderModal(true, onOpenChange)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('shows error toast and reopens modal on mutation error', async () => {
    const { toast } = await import('sonner')
    let capturedOnError: (() => void) | undefined
    vi.mocked(useCreateTodo).mockImplementation((options) => {
      capturedOnError = options?.onError
      return defaultMockHook as unknown as ReturnType<typeof useCreateTodo>
    })

    const onOpenChange = vi.fn()
    renderModal(true, onOpenChange)

    capturedOnError?.()

    expect(toast.error).toHaveBeenCalledWith("Couldn't save your task. Try again.")
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true))
  })
})
