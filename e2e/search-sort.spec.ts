import { test, expect, type Page } from '@playwright/test'
import { waitForProducts, waitForLoadingToFinish } from './helpers'

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

// ---- Issue #111: mobile (phone tier). The repo's device-matrix runs this
// block against chromium-mobile-android (360x780) and the other mobile projects.
// We pin the responsive contract that jsdom cannot evaluate: vertical stacking,
// >=16px font-size (no iOS focus zoom), >=44px touch targets (WCAG 2.5.5),
// operability of the sort dropdown, and live filtering when typing. ----
test.describe('Search & sort — mobile (360px)', () => {
  test.use({ viewport: { width: 360, height: 780 } })

  test('sort controls stack vertically on a phone viewport', async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await waitForProducts(page)

    const direction = await page.locator('.sort-controls').evaluate(
      (el) => getComputedStyle(el).flexDirection
    )
    expect(direction, 'sort-controls must be a vertical column at <=479px').toBe('column')
  })

  test('search input and sort select meet 16px font + 44px touch target', async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await waitForProducts(page)

    for (const selector of ['.search-input', '.sort-select']) {
      const el = page.locator(selector)
      await expect(el, `${selector} must be visible on mobile`).toBeVisible()

      const fontSize = await el.evaluate((e) => parseFloat(getComputedStyle(e).fontSize))
      expect(fontSize, `${selector} font-size must be >= 16px to avoid iOS zoom`).toBeGreaterThanOrEqual(16)

      const height = await el.evaluate((e) => e.getBoundingClientRect().height)
      expect(height, `${selector} touch target must be >= 44px (WCAG 2.5.5)`).toBeGreaterThanOrEqual(44)
    }
  })

  test('sort dropdown is operable on mobile viewport', async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await waitForProducts(page)

    const select = page.locator('.sort-select')
    await expect(select, 'sort select must be visible on mobile').toBeVisible()
    await select.selectOption('price-asc')
    await page.waitForTimeout(300)

    const prices = await page.locator('.product-price').allInnerTexts()
    const numeric = prices.map(p => Number.parseFloat(p.replaceAll(/[^0-9.]/g, '')))
    for (let i = 1; i < numeric.length; i++) {
      expect(numeric[i]).toBeGreaterThanOrEqual(numeric[i - 1])
    }
  })

  test('typing in the search field filters results on mobile', async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await waitForProducts(page)

    const search = page.locator('.search-input')
    await expect(search, 'search input must be visible on mobile').toBeVisible()

    const before = await page.locator('.product-card').count()
    await search.fill('Victorian')
    await page.waitForTimeout(300)

    const after = await page.locator('.product-card').count()
    expect(after, 'typing should narrow the results').toBeLessThanOrEqual(before)
    expect(after, 'typing a known term should keep at least one result').toBeGreaterThan(0)
  })
})
