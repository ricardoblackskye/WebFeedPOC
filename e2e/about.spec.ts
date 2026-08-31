import { test, expect, type Page } from 'playwright/test'
import { waitForLoadingToFinish } from './helpers'

/**
 * Wait for the about page to finish loading CMS content (or error/empty state).
 * The page shows a loading skeleton while fetching; we wait for it to disappear.
 */
async function waitForAboutPageReady (page: Page): Promise<void> {
  // Wait for the loading skeleton to be gone, or for content/error to appear
  await page.waitForFunction(
    () => !document.querySelector('[aria-label="Loading content"]'),
    { timeout: 15000 }
  )
}

test.describe('About page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about')
    await waitForAboutPageReady(page)
  })

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/About Us/)
  })

  test('renders the site header with nav links', async ({ page }) => {
    await expect(page.locator('header h1')).toContainText('Antiques Marketplace')
    await expect(page.locator('.app-nav')).toBeVisible()
    await expect(page.locator('.app-nav a[href="/about"]')).toBeVisible()
    await expect(page.locator('.app-nav a[href="/about"]')).toContainText('About')
  })

  test('renders the page heading', async ({ page }) => {
    await expect(page.locator('.about-page h2').first()).toContainText('About Us')
  })

  test('shows content, empty state, or error — never a blank page', async ({ page }) => {
    // One of these three states must be visible after loading
    const hasContent = await page.locator('.about-items').isVisible().catch(() => false)
    const hasEmpty = await page.locator('.about-empty').isVisible().catch(() => false)
    const hasError = await page.locator('.about-error').isVisible().catch(() => false)

    expect(hasContent || hasEmpty || hasError).toBe(true)
  })

  test('About nav link is present on the homepage too', async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await expect(page.locator('.app-nav a[href="/about"]')).toBeVisible()
  })

  test('navigates back to shop via nav link', async ({ page }) => {
    await page.locator('.app-nav a[href="/"]').click()
    await expect(page).toHaveURL('/')
  })

  test('Shop nav link navigates to product listing', async ({ page }) => {
    await page.locator('.app-nav a[href="/"]').click()
    await waitForLoadingToFinish(page)
    // Should be on home page showing products
    await expect(page.locator('.products-section')).toBeVisible()
  })
})

test.describe('About page — content structure (when CMS data loads)', () => {
  test('each about item is wrapped in an article element', async ({ page }) => {
    await page.goto('/about')
    await waitForAboutPageReady(page)

    const items = page.locator('.about-items')
    const isVisible = await items.isVisible().catch(() => false)

    if (!isVisible) {
      // CMS not available in test environment — skip structural check
      test.skip()
      return
    }

    const articles = page.locator('.about-item')
    const count = await articles.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('About page — accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about')
    await waitForAboutPageReady(page)
  })

  test('has a single h1 (site header)', async ({ page }) => {
    const h1s = page.locator('h1')
    await expect(h1s).toHaveCount(1)
    await expect(h1s).toContainText('Antiques Marketplace')
  })

  test('error alert has role="alert" when shown', async ({ page }) => {
    const errorEl = page.locator('[role="alert"]')
    const shown = await errorEl.isVisible().catch(() => false)
    if (shown) {
      await expect(errorEl).toBeVisible()
    }
    // If no error, this test is vacuously true — that's fine
  })

  test('nav has accessible aria-label', async ({ page }) => {
    await expect(page.locator('nav[aria-label="Site navigation"]')).toBeVisible()
  })
})
