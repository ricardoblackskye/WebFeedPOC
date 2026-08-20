import { test, expect } from './fixtures.js'

const PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/about', name: 'about page' },
  { path: '/category/Timepieces', name: 'category page' },
  { path: '/products/1', name: 'product detail page' },
]

test.describe('No horizontal scrollbar at any breakpoint', () => {
  for (const { path, name } of PAGES) {
    test(`${name} (${path}) has no horizontal scroll`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.scrollingElement.scrollWidth > document.scrollingElement.clientWidth
      })

      expect(hasHorizontalScroll).toBe(false)
    })
  }

  test('product listing page has no horizontal scroll after loading products', async ({ page }) => {
    await page.goto('/')
    await page.locator('.product-card').first().waitFor({ timeout: 15000 })
    await page.waitForTimeout(300)

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.scrollingElement.scrollWidth > document.scrollingElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })
})
