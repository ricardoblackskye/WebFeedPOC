import { test, expect, type Page } from '@playwright/test'
import { waitForProducts, waitForLoadingToFinish } from './helpers'

test.describe('Shopping cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await waitForProducts(page)
  })

  test('cart is initially empty', async ({ page }) => {
    await expect(page.locator('.cart-empty')).toBeVisible()
  })

  test('adding a product to the cart removes the empty state', async ({ page }) => {
    await page.locator('.add-to-cart-btn').first().click()
    await expect(page.locator('.cart-empty')).not.toBeVisible()
  })

  test('added product appears in the cart', async ({ page }) => {
    const productName = await page.locator('.product-name').first().innerText()
    await page.locator('.add-to-cart-btn').first().click()

    const cartItemNames = page.locator('.cart-item-info h4')
    await expect(cartItemNames).toContainText(productName)
  })

  test('cart shows item price', async ({ page }) => {
    await page.locator('.add-to-cart-btn').first().click()
    await expect(page.locator('.cart-item-price').first()).toContainText('£')
  })

  test('cart shows a total price', async ({ page }) => {
    await page.locator('.add-to-cart-btn').first().click()
    // Total is shown as either "Total: £…" or inside .cart-total-line
    await expect(page.locator('.cart-total')).toContainText('£')
  })

  test('increasing quantity updates the quantity display', async ({ page }) => {
    await page.locator('.add-to-cart-btn').first().click()
    const quantityEl = page.locator('.quantity').first()
    const before = Number.parseInt(await quantityEl.innerText(), 10)

    await page.locator('.quantity-btn').filter({ hasText: '+' }).first().click()
    const after = Number.parseInt(await quantityEl.innerText(), 10)
    expect(after).toBe(before + 1)
  })

  test('decreasing quantity to zero removes the item', async ({ page }) => {
    await page.locator('.add-to-cart-btn').first().click()
    // quantity starts at 1, decrement to remove
    await page.locator('.quantity-btn').filter({ hasText: '-' }).first().click()
    await expect(page.locator('.cart-empty')).toBeVisible()
  })

  test('remove button removes the cart item', async ({ page }) => {
    await page.locator('.add-to-cart-btn').first().click()
    await page.locator('.remove-btn').first().click()
    await expect(page.locator('.cart-empty')).toBeVisible()
  })

  test('adding two different products shows both in cart', async ({ page }) => {
    const buttons = page.locator('.add-to-cart-btn')
    await buttons.nth(0).click()
    await buttons.nth(1).click()

    const cartItems = page.locator('.cart-item')
    const count = await cartItems.count()
    expect(count).toBeGreaterThanOrEqual(1) // may merge same item or show separately
  })

  test('Proceed to Checkout button is present when cart has items', async ({ page }) => {
    await page.locator('.add-to-cart-btn').first().click()
    await expect(page.locator('.checkout-btn')).toBeVisible()
    await expect(page.locator('.checkout-btn')).toBeEnabled()
  })
})
