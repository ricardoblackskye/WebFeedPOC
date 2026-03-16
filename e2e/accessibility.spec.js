import { test, expect } from 'playwright/test'

test.describe('Accessibility basics', () => {
  test('homepage has a single h1 element', async ({ page }) => {
    await page.goto('/')
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })

  test('product images have alt attributes', async ({ page }) => {
    await page.goto('/')
    await page.locator('.product-card').first().waitFor({ timeout: 15000 })

    const images = page.locator('.product-card img')
    const count = await images.count()
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt).toBeTruthy()
    }
  })

  test('Add to Cart buttons are keyboard-focusable', async ({ page }) => {
    await page.goto('/')
    await page.locator('.product-card').first().waitFor({ timeout: 15000 })

    const btn = page.locator('.add-to-cart-btn').first()
    await btn.focus()
    await expect(btn).toBeFocused()
  })

  test('category filter nav has an accessible label', async ({ page }) => {
    await page.goto('/')
    await page.locator('.product-card').first().waitFor({ timeout: 15000 })

    const nav = page.locator('nav[aria-label]').first()
    await expect(nav).toBeVisible()
  })

  test('page title is set', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    expect(title.length).toBeGreaterThan(0)
  })
})
