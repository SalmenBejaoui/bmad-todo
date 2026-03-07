import { expect, test } from '@playwright/test'
import { deleteAllTodos } from '../helpers/api'

test.describe('Create todo', () => {
  test.beforeEach(async () => {
    await deleteAllTodos()
  })

  test('creates a new task and shows it in Active section', async ({ page }) => {
    await page.goto('/')

    // Open the add task modal
    await page.getByRole('button', { name: '+ Add task' }).click()

    // Modal should appear with "Add task" title
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Add task' })
    ).toBeVisible()

    // Fill in the task title
    const titleInput = page.getByLabel('Task title')
    await expect(titleInput).toBeFocused()
    await titleInput.fill('Buy groceries')

    // Submit the form
    await page.getByRole('dialog').getByRole('button', { name: 'Add task' }).click()

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // The new task should appear in the Active section
    await expect(page.getByText('Buy groceries')).toBeVisible()

    // Active section header should show count
    await expect(
      page.getByRole('region', { name: /Active tasks/ })
    ).toBeVisible()
  })

  test('creates a task with description', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: '+ Add task' }).click()
    await page.getByLabel('Task title').fill('Read a book')
    await page.getByLabel('Task description (optional)').fill('Finish the chapter')
    await page.getByRole('dialog').getByRole('button', { name: 'Add task' }).click()

    await expect(page.getByText('Read a book')).toBeVisible()
  })
})
