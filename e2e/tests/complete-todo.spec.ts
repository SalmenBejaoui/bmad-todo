import { expect, test } from '@playwright/test'
import { deleteAllTodos } from '../helpers/api'

test.describe('Complete todo', () => {
  test.beforeEach(async () => {
    await deleteAllTodos()
  })

  test('clicking checkbox moves task to Done section with strikethrough', async ({
    page,
  }) => {
    await page.goto('/')

    // Create a task via UI
    await page.getByRole('button', { name: '+ Add task' }).click()
    await page.getByLabel('Task title').fill('Exercise')
    await page.getByRole('dialog').getByRole('button', { name: 'Add task' }).click()

    // Task should be in Active section
    await expect(page.getByText('Exercise')).toBeVisible()

    // Click the checkbox to complete the task
    await page
      .getByRole('checkbox', { name: /Mark 'Exercise' as complete/ })
      .click()

    // Task should now appear in the Done section
    await expect(
      page.getByRole('region', { name: /Done tasks/ })
    ).toBeVisible()

    // Title should have strikethrough styling (line-through class applied via data-state=checked)
    const taskSpan = page.getByText('Exercise')
    await expect(taskSpan).toHaveClass(/line-through/)
  })

  test('clicking checkbox again marks task as incomplete', async ({ page }) => {
    await page.goto('/')

    // Create and complete a task
    await page.getByRole('button', { name: '+ Add task' }).click()
    await page.getByLabel('Task title').fill('Meditate')
    await page.getByRole('dialog').getByRole('button', { name: 'Add task' }).click()

    await page
      .getByRole('checkbox', { name: /Mark 'Meditate' as complete/ })
      .click()

    // Should be in Done section
    await expect(
      page.getByRole('region', { name: /Done tasks/ })
    ).toBeVisible()

    // Click checkbox again to mark incomplete
    await page
      .getByRole('checkbox', { name: /Mark 'Meditate' as incomplete/ })
      .click()

    // Should return to Active section
    await expect(
      page.getByRole('region', { name: /Active tasks/ })
    ).toBeVisible()
  })
})
