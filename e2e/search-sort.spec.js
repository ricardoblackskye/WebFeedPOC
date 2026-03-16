import { test, expect } from 'playwright/test'
import { waitForProducts, waitForLoadingToFinish } from './helpers.js'

test.describe('Search and sort', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await waitForProducts(page)
  })

  test('search filters the product list', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[type="text"]').first()
    const beforeCount = await page.locator('.product-card').count()

    // Type a term that appears in at least one mock product name
    await searchInput.fill('Victorian')
    await page.waitForTimeout(300) // debounce / re-render

    const afterCount = await page.locator('.product-card').count()
    expect(afterCount).toBeLessThanOrEqual(beforeCount)
  })

  test('clearing search restores the full product list', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[type="text"]').first()
    const initialCount = await page.locator('.product-card').count()

    await searchInput.fill('Victorian')
    await page.waitForTimeout(300)
    await searchInput.fill('')
    await page.waitForTimeout(300)

    const restoredCount = await page.locator('.product-card').count()
    expect(restoredCount).toBe(initialCount)
  })

  test('shows "No products found" when search yields no results', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[type="text"]').first()
    await searchInput.fill('xyzzy_nonexistent_product_12345')
    await page.waitForTimeout(300)
    await expect(page.locator('.error').filter({ hasText: 'No products found' })).toBeVisible()
  })

  test('search term is reflected in the URL query parameter', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[type="text"]').first()
    await searchInput.fill('watch')
    await page.waitForTimeout(300)
    expect(page.url()).toContain('search=watch')
  })

  test('sort by price ascending orders cards correctly', async ({ page }) => {
    const sortSelect = page.locator('select').first()
    await sortSelect.selectOption('price-asc')
    await page.waitForTimeout(300)

    const prices = await page.locator('.product-price').allInnerTexts()
    const numeric = prices.map(p => Number.parseFloat(p.replaceAll(/[^0-9.]/g, '')))
    for (let i = 1; i < numeric.length; i++) {
      expect(numeric[i]).toBeGreaterThanOrEqual(numeric[i - 1])
    }
  })

  test('sort by price descending orders cards correctly', async ({ page }) => {
    const sortSelect = page.locator('select').first()
    await sortSelect.selectOption('price-desc')
    await page.waitForTimeout(300)

    const prices = await page.locator('.product-price').allInnerTexts()
    const numeric = prices.map(p => Number.parseFloat(p.replaceAll(/[^0-9.]/g, '')))
    for (let i = 1; i < numeric.length; i++) {
      expect(numeric[i]).toBeLessThanOrEqual(numeric[i - 1])
    }
  })

  test('sort by name ascending orders cards alphabetically', async ({ page }) => {
    const sortSelect = page.locator('select').first()
    await sortSelect.selectOption('name-asc')
    await page.waitForTimeout(300)

    const names = await page.locator('.product-name').allInnerTexts()
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })
})
