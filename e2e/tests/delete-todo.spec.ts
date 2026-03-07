import { expect, test } from '@playwright/test'
import { deleteAllTodos } from '../helpers/api'

test.describe('Delete todo', () => {
  test.beforeEach(async () => {
    await deleteAllTodos()
  })

  test('deleting a task removes it from the list and shows undo toast', async ({
    page,
  }) => {
    await page.goto('/')

    // Create a task
    await page.getByRole('button', { name: '+ Add task' }).click()
    await page.getByLabel('Task title').fill('Clean the kitchen')
    await page.getByRole('dialog').getByRole('button', { name: 'Add task' }).click()

    // Verify task is visible
    await expect(page.getByText('Clean the kitchen')).toBeVisible()

    // Hover over the task row to reveal the delete button (opacity-0 until hover)
    const taskRow = page
      .getByRole('listitem')
      .filter({ hasText: 'Clean the kitchen' })
    await taskRow.hover()

    // Click the delete button
    await page
      .getByRole('button', { name: /Delete 'Clean the kitchen'/ })
      .click()

    // Task should disappear from the list (optimistic update)
    await expect(page.getByText('Clean the kitchen')).not.toBeVisible()

    // Undo toast should be visible
    await expect(page.getByText('Task deleted.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible()
  })
})
