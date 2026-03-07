import { expect, test } from '@playwright/test'
import { deleteAllTodos } from '../helpers/api'

test.describe('Task detail', () => {
  test.beforeEach(async () => {
    await deleteAllTodos()
  })

  test('clicking task row opens detail modal with title, description, and timestamp', async ({
    page,
  }) => {
    await page.goto('/')

    // Create a task with description via the UI
    await page.getByRole('button', { name: '+ Add task' }).click()
    await page.getByLabel('Task title').fill('Plan the trip')
    await page.getByLabel('Task description (optional)').fill(
      'Book flights and hotel'
    )
    await page.getByRole('dialog').getByRole('button', { name: 'Add task' }).click()

    // Click the task row body (the title button, not the checkbox or delete)
    const taskButton = page
      .getByRole('listitem')
      .filter({ hasText: 'Plan the trip' })
      .getByRole('button', { name: 'Plan the trip' })
    await taskButton.click()

    // Detail modal should open
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Title should appear in the modal heading
    await expect(
      modal.getByRole('heading', { name: 'Plan the trip' })
    ).toBeVisible()

    // Description should be visible
    await expect(modal.getByText('Book flights and hotel')).toBeVisible()

    // "Created" timestamp label should appear
    await expect(modal.getByText('Created')).toBeVisible()

    // Close the modal
    await modal.getByRole('button', { name: 'Close' }).click()
    await expect(modal).not.toBeVisible()
  })

  test('clicking "Mark as done" in detail modal completes the task', async ({
    page,
  }) => {
    await page.goto('/')

    await page.getByRole('button', { name: '+ Add task' }).click()
    await page.getByLabel('Task title').fill('Review PR')
    await page.getByRole('dialog').getByRole('button', { name: 'Add task' }).click()

    // Open detail modal
    const taskButton = page
      .getByRole('listitem')
      .filter({ hasText: 'Review PR' })
      .getByRole('button', { name: 'Review PR' })
    await taskButton.click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Click "Mark as done" in the footer
    await modal.getByRole('button', { name: 'Mark as done' }).click()

    // Modal should close and task should be in Done section
    await expect(modal).not.toBeVisible()
    await expect(
      page.getByRole('region', { name: /Done tasks/ })
    ).toBeVisible()
  })
})
