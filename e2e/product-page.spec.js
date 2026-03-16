import { test, expect } from 'playwright/test'
import { waitForProducts, waitForLoadingToFinish } from './helpers.js'

test.describe('Product detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await waitForProducts(page)
  })

  test('navigating to a product URL renders the product name', async ({ page }) => {
    // Navigate directly via the well-known mock slug
    await page.goto('/products/victorian-pocket-watch')
    await expect(page.locator('h1, h2').filter({ hasText: /Victorian Pocket Watch/i })).toBeVisible()
  })

  test('product page shows price', async ({ page }) => {
    await page.goto('/products/victorian-pocket-watch')
    await expect(page.locator('body')).toContainText('£')
  })

  test('product page shows Add to Cart button', async ({ page }) => {
    await page.goto('/products/victorian-pocket-watch')
    await expect(page.locator('button').filter({ hasText: /Add to Cart/i })).toBeVisible()
  })

  test('clicking Add to Cart on product page adds item to cart', async ({ page }) => {
    await page.goto('/products/victorian-pocket-watch')
    await page.locator('button').filter({ hasText: /Add to Cart/i }).first().click()
    await expect(page.locator('.cart-item')).toBeVisible()
  })

  test('clicking a product card from home navigates to that product URL', async ({ page }) => {
    await waitForProducts(page)
    const firstCard = page.locator('.product-card').first()
    const href = await firstCard.locator('a.product-card-link').getAttribute('href')
    expect(href).toMatch(/^\/products\//)

    await firstCard.locator('a.product-card-link').click()
    await page.waitForURL(/\/products\//)
    expect(page.url()).toContain('/products/')
  })

  test('product page shows product description', async ({ page }) => {
    await page.goto('/products/victorian-pocket-watch')
    // Description section exists
    const hasDesc = await page.locator('[class*="description"], [class*="product-desc"]').count()
    expect(hasDesc).toBeGreaterThan(0)
  })
})
