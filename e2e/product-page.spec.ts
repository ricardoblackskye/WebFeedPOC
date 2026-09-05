import { test, expect, type Page } from '@playwright/test'
import { waitForProducts, waitForLoadingToFinish, revealCartDrawer } from './helpers'

// Resolve to the first available product's URL so tests work with both
// real Wix products and the mock fallback catalogue.
async function getFirstProductUrl (page: Page): Promise<string | null> {
  await page.goto('/')
  await waitForLoadingToFinish(page)
  await waitForProducts(page)
  const href = await page.locator('.product-card').first().locator('a.product-card-link').getAttribute('href')
  return href
}

test.describe('Product detail page', () => {
  test('navigating to a product URL renders the product name', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    await page.goto(url ?? '/')
    await expect(page.locator('h1').first()).toBeVisible()
    const name = await page.locator('h1').first().innerText()
    expect(name.length).toBeGreaterThan(0)
  })

  test('product page shows price', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    await page.goto(url ?? '/')
    await expect(page.locator('body')).toContainText('£')
  })

  test('product page shows Add to Cart button', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    await page.goto(url ?? '/')
    await expect(page.locator('button').filter({ hasText: /Add to Cart/i })).toBeVisible()
  })

  test('clicking Add to Cart on product page adds item to cart', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    await page.goto(url ?? '/')
    await page.locator('button').filter({ hasText: /Add to Cart/i }).first().click()
    // On <=768px the cart is a hidden drawer; open it before asserting the item
    // is visible. No-op on desktop where it is a visible sticky sidebar.
    await revealCartDrawer(page)
    await expect(page.locator('.cart-item')).toBeVisible()
  })

  test('clicking a product card from home navigates to that product URL', async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await waitForProducts(page)
    const firstCard = page.locator('.product-card').first()
    const href = await firstCard.locator('a.product-card-link').getAttribute('href')
    expect(href).toMatch(/^\/products\//)

    await firstCard.locator('a.product-card-link').click()
    await page.waitForURL(/\/products\//)
    expect(page.url()).toContain('/products/')
  })

  test('product page shows product description', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    await page.goto(url ?? '/')
    await expect(page.locator('.product-page-description')).toBeVisible()
  })
})
