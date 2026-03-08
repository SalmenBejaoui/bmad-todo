import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, devices } from '@playwright/test'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const outputDir = path.join(
  repoRoot,
  '_bmad-output',
  'implementation-artifacts',
  'showcase-screenshots'
)

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173'
const apiUrl = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3001'

async function api(pathname, init) {
  const response = await fetch(`${apiUrl}${pathname}`, init)
  if (!response.ok) {
    throw new Error(`${init?.method ?? 'GET'} ${pathname} failed: ${response.status}`)
  }

  if (response.status === 204) {
    return undefined
  }

  return response.json()
}

async function deleteAllTodos() {
  const todos = await api('/todos')
  await Promise.all(
    todos.map((todo) => api(`/todos/${todo.id}`, { method: 'DELETE' }))
  )
}

async function createTodo(title, description) {
  return api('/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  })
}

async function waitForApp(page) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'My Tasks' }).waitFor()
}

async function captureDesktopShots() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1280 } })
  const page = await context.newPage()

  await deleteAllTodos()
  await waitForApp(page)
  await page.screenshot({
    path: path.join(outputDir, '01-empty-state.png'),
    fullPage: true,
  })

  await page.getByRole('button', { name: '+ Add task' }).click()
  await page.getByLabel('Task title').fill('Plan sprint demo')
  await page.getByLabel('Task description (optional)').fill(
    'Collect release notes and prepare the talking points.'
  )
  await page.screenshot({
    path: path.join(outputDir, '02-add-task-modal.png'),
    fullPage: true,
  })

  await page.getByRole('dialog').getByRole('button', { name: 'Add task' }).click()
  await page.getByText('Plan sprint demo').waitFor()

  await createTodo('Refine backlog items', 'Split larger stories before planning.')
  await createTodo('Review accessibility pass', 'Validate keyboard and screen reader flows.')
  await page.reload({ waitUntil: 'networkidle' })
  await page.screenshot({
    path: path.join(outputDir, '03-active-task-list.png'),
    fullPage: true,
  })

  const detailTrigger = page
    .getByRole('listitem')
    .filter({ hasText: 'Plan sprint demo' })
    .getByRole('button', { name: 'Plan sprint demo', exact: true })
  await detailTrigger.click()
  await page.getByRole('dialog').waitFor()
  await page.screenshot({
    path: path.join(outputDir, '04-task-detail-modal.png'),
    fullPage: true,
  })

  await page.getByRole('dialog').getByRole('button', { name: 'Mark as done' }).click()
  await page.getByRole('region', { name: /Done tasks/ }).waitFor()
  await page.screenshot({
    path: path.join(outputDir, '05-completed-task-state.png'),
    fullPage: true,
  })

  const taskRow = page
    .getByRole('listitem')
    .filter({ hasText: 'Review accessibility pass' })
  await taskRow.hover()
  await page.getByRole('button', { name: /Delete 'Review accessibility pass'/ }).click()
  await page.getByText('Task deleted.').waitFor()
  await page.screenshot({
    path: path.join(outputDir, '06-delete-with-undo-toast.png'),
    fullPage: false,
  })

  const toast = page.locator('[data-sonner-toast]').filter({ hasText: 'Task deleted.' })
  await toast.screenshot({
    path: path.join(outputDir, '07-delete-toast-closeup.png'),
  })

  await context.close()
  await browser.close()
}

async function captureMobileShot() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await context.newPage()

  await waitForApp(page)
  await page.screenshot({
    path: path.join(outputDir, '08-mobile-responsive-view.png'),
    fullPage: true,
  })

  await context.close()
  await browser.close()
}

async function main() {
  await mkdir(outputDir, { recursive: true })
  await captureDesktopShots()
  await captureMobileShot()

  console.log(`Saved showcase screenshots to ${outputDir}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})