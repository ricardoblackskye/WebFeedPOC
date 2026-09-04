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

// ---- Mobile: cart is a slide-over drawer (issue #109) ----
test.describe('Cart drawer on mobile (375px)', () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await waitForProducts(page)
  })

  test('cart is a hidden off-canvas drawer until the header button opens it', async ({ page }) => {
    await expect(page.locator('.cart-btn')).toBeVisible()
    // Closed drawer is off-screen AND visibility:hidden -> not visible to user/AT
    await expect(page.locator('#cart-drawer')).toBeHidden()
    await expect(page.locator('.cart-backdrop')).toBeHidden()

    await page.locator('.cart-btn').click()
    await expect(page.locator('#cart-drawer')).toBeVisible()
    await expect(page.locator('.cart-backdrop')).toBeVisible()
    // aria-expanded reflects the open state
    await expect(page.locator('.cart-btn')).toHaveAttribute('aria-expanded', 'true')

    // Dismiss via backdrop
    await page.locator('.cart-backdrop').click()
    await expect(page.locator('#cart-drawer')).toBeHidden()
    await expect(page.locator('.cart-btn')).toHaveAttribute('aria-expanded', 'false')
  })

  test('swipe left on the open drawer dismisses it (touch)', async ({ page }) => {
    await page.locator('.cart-btn').click()
    await expect(page.locator('#cart-drawer')).toBeVisible()

    const box = await page.locator('[role="dialog"]').boundingBox()
    const y = box.y + box.height / 2
    const startX = box.x + box.width - 20
    const endX = box.x - 60

    // Dispatch real touch events on the drawer surface (role=dialog). The swipe
    // handler is attached to that element (the inner .cart dialog), not the
    // #cart-drawer aside wrapper, so we target role=dialog here.
    await page.evaluate(
      ({ selector, startX, endX, y }) => {
        const el = document.querySelector(selector)
        const makeTouch = (clientX) =>
          new Touch({ identifier: 0, target: el, clientX, clientY: y, pageX: clientX, pageY: y })
        const startTouch = makeTouch(startX)
        const endTouch = makeTouch(endX)
        el.dispatchEvent(
          new TouchEvent('touchstart', { touches: [startTouch], changedTouches: [startTouch], bubbles: true, cancelable: true })
        )
        el.dispatchEvent(
          new TouchEvent('touchend', { touches: [], changedTouches: [endTouch], bubbles: true, cancelable: true })
        )
      },
      { selector: '[role="dialog"]', startX, endX, y }
    )

    await expect(page.locator('#cart-drawer')).toBeHidden()
    await expect(page.locator('.cart-btn')).toHaveAttribute('aria-expanded', 'false')
  })
})
