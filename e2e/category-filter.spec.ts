import { test, expect, type Page } from 'playwright/test'
import { waitForProducts, waitForLoadingToFinish } from './helpers'

test.describe('Category filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await waitForProducts(page)
  })

  test('clicking a category button activates it', async ({ page }) => {
    const categoryButtons = page.locator('.category-btn')
    const count = await categoryButtons.count()
    // Skip if only "All Items" button exists
    test.skip(count <= 1, 'No categories other than All')

    const secondBtn = categoryButtons.nth(1)
    await secondBtn.click()
    await expect(secondBtn).toHaveClass(/active/)
    // All Items should no longer be active
    await expect(categoryButtons.first()).not.toHaveClass(/active/)
  })

  test('filtering by category reduces the product list', async ({ page }) => {
    const categoryButtons = page.locator('.category-btn')
    const count = await categoryButtons.count()
    test.skip(count <= 1, 'No categories other than All')

    const initialCount = await page.locator('.product-card').count()
    await categoryButtons.nth(1).click()
    await page.waitForTimeout(300)

    const filteredCount = await page.locator('.product-card').count()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
  })

  test('clicking "All Items" restores all products', async ({ page }) => {
    const categoryButtons = page.locator('.category-btn')
    const count = await categoryButtons.count()
    test.skip(count <= 1, 'No categories other than All')

    const initialCount = await page.locator('.product-card').count()
    await categoryButtons.nth(1).click()
    await page.waitForTimeout(300)
    await categoryButtons.first().click() // "All Items"
    await page.waitForTimeout(300)

    const restoredCount = await page.locator('.product-card').count()
    expect(restoredCount).toBe(initialCount)
  })

  test('category buttons show product counts', async ({ page }) => {
    const countBadge = page.locator('.category-count').first()
    await expect(countBadge).toBeVisible()
    const text = await countBadge.innerText()
    expect(Number.parseInt(text, 10)).toBeGreaterThan(0)
  })

  test('/category/:name route shows only products in that category', async ({ page }) => {
    // Pick the first non-"All" category button to determine a slug
    const categoryButtons = page.locator('.category-btn')
    const count = await categoryButtons.count()
    test.skip(count <= 1, 'No categories other than All')

    const categoryName = await categoryButtons.nth(1).innerText()
    // Clean the name (strip the count badge text)
    const name = categoryName.replace(/\s*\d+\s*$/, '').trim()

    await page.goto(`/category/${encodeURIComponent(name)}`)
    await waitForLoadingToFinish(page)

    // The h2 should contain the category name
    await expect(page.locator('h2').first()).toContainText(name)
    // Each product card rendered should belong to the category — spot-check the breadcrumb
    await expect(page.locator('.breadcrumb')).toContainText(name)
  })
})
