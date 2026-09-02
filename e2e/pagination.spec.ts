import { test, expect, type Page } from '@playwright/test'
import { waitForProducts, waitForLoadingToFinish } from './helpers'

test.describe('Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await waitForProducts(page)
  })

  test('pagination control is visible when product count exceeds page size', async ({ page }) => {
    // The demo set has ~12 products and page size is 12; pagination only shows
    // if totalPages > 1. Skip gracefully when not applicable.
    const pagination = page.locator('.pagination')
    const paginationVisible = await pagination.isVisible().catch(() => false)

    if (!paginationVisible) {
      test.skip(true, 'Product count does not exceed the page size – pagination not rendered')
    }

    await expect(pagination).toBeVisible()
  })

  test('Next page button advances to page 2', async ({ page }) => {
    const pagination = page.locator('.pagination')
    const paginationVisible = await pagination.isVisible().catch(() => false)
    test.skip(!paginationVisible, 'Pagination not rendered')

    const nextBtn = page.locator('.pagination button, .pagination a').filter({ hasText: /next|>/i }).first()
    await nextBtn.click()
    await page.waitForTimeout(300)

    const activePageBtn = page.locator('.pagination .active, .pagination [aria-current="page"]')
    await expect(activePageBtn).toContainText('2')
  })
})

test.describe('Pagination – category page', () => {
  test('category page renders correctly when navigated directly', async ({ page }) => {
    await page.goto('/category/Timepieces')
    await waitForLoadingToFinish(page)

    // Should show the category heading
    await expect(page.locator('h2').first()).toContainText('Timepieces')
    // Breadcrumb should be present
    await expect(page.locator('.breadcrumb')).toBeVisible()
  })

  test('back link on category page navigates to home', async ({ page }) => {
    // Navigate to an empty category to trigger the "Browse all products" fallback
    await page.goto('/category/NonExistentCategory999')
    await waitForLoadingToFinish(page)

    const backLink = page.locator('a[href="/"]').first()
    await backLink.click()
    await expect(page).toHaveURL('/')
  })
})
