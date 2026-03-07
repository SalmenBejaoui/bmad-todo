import { expect, test } from '@playwright/test'
import { deleteAllTodos } from '../helpers/api'

test.describe('Empty state', () => {
  test.beforeEach(async () => {
    await deleteAllTodos()
  })

  test('shows "No tasks yet." when there are no todos', async ({ page }) => {
    await page.goto('/')

    // App header should be visible
    await expect(page.getByRole('heading', { name: 'My Tasks' })).toBeVisible()

    // Empty state message should appear
    await expect(page.getByText('No tasks yet.')).toBeVisible()

    // The "+ Add task" button should still be present
    await expect(page.getByRole('button', { name: '+ Add task' })).toBeVisible()
  })
})
