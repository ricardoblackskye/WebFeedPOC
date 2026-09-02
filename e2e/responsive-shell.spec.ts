import { test, expect, type Page } from '@playwright/test'

/** Assert no horizontal overflow on the current page. */
async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => (document.scrollingElement?.scrollWidth ?? 0) > (document.scrollingElement?.clientWidth ?? 0)
  )
  expect(overflow, 'page should not have a horizontal scrollbar').toBe(false)
}

/** Count the resolved grid tracks of the product list. */
async function productGridTracks(page: Page): Promise<number> {
  await page.waitForSelector('.product-card', { timeout: 15000 })
  return page.locator('.product-list').evaluate(
    (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length
  )
}

// ---- Mobile 320px ----
test.describe('Mobile shell (320px)', () => {
  test.use({ viewport: { width: 320, height: 568 } })

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expectNoHorizontalScroll(page)
  })

  test('header font <= 2rem and nav collapsed into hamburger', async ({ page }) => {
    await page.goto('/')
    const fs = await page.locator('.app-header h1').evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize)
    )
    expect(fs, 'h1 should be <= 2rem (32px) at 320px').toBeLessThanOrEqual(32)

    const toggle = page.locator('.nav-toggle')
    await expect(toggle, 'hamburger toggle should be visible on mobile').toBeVisible()
    await expect(page.locator('#primary-nav'), 'nav hidden until toggled').toBeHidden()

    await toggle.click()
    await expect(page.locator('#primary-nav'), 'nav shown after toggle').toBeVisible()
  })

  test('product grid is 1-column', async ({ page }) => {
    await page.goto('/')
    expect(await productGridTracks(page), 'grid should be 1 column at 320px').toBe(1)
  })
})

// ---- Tablet 768px ----
test.describe('Tablet shell (768px)', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test('nav shown inline, grid 2-column, no overflow', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.nav-toggle'), 'no hamburger at tablet width').toBeHidden()
    await expect(page.locator('#primary-nav'), 'inline nav shown at tablet width').toBeVisible()

    await expectNoHorizontalScroll(page)

    expect(await productGridTracks(page), 'grid should be 2 columns at 768px').toBe(2)
  })
})

// ---- Desktop 1280px (preserved) ----
test.describe('Desktop shell (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('header restored to 3.5rem, grid auto-fill', async ({ page }) => {
    await page.goto('/')

    const fs = await page.locator('.app-header h1').evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize)
    )
    expect(fs, 'h1 should be ~3.5rem (56px) on desktop').toBeCloseTo(56, 0)

    await expect(page.locator('.nav-toggle'), 'no hamburger on desktop').toBeHidden()
    await expect(page.locator('#primary-nav'), 'inline nav shown on desktop').toBeVisible()
  })
})
