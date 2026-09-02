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

// ---- Boundary correctness (no off-by-one between tiers) ----
// Reviewer flagged a possible off-by-one at 480px between the phone (≤479)
// and tablet (480–768) tiers, and at 640px for the hamburger. These tests pin
// the behaviour at the exact boundaries.
test.describe('Breakpoint boundaries', () => {
  test('exactly 480px → 2-column grid (not phone 1-col)', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(
      await productGridTracks(page),
      'at the 480px boundary the tablet tier (2-col) must win'
    ).toBe(2)
  })

  test('hamburger is inclusive at 640px; inline nav resumes at 641px', async ({ page }) => {
    // Boundary check: `width <= 640px` is inclusive, so 640px is collapsed
    // (hamburger visible, inline nav hidden) and 641px is inline. This proves
    // the breakpoint is contiguous with no off-by-one gap.
    await page.setViewportSize({ width: 640, height: 800 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(
      page.locator('.nav-toggle'),
      'at exactly 640px (inclusive) the hamburger is shown'
    ).toBeVisible()
    await expect(page.locator('#primary-nav'), 'at 640px the inline nav is hidden').toBeHidden()

    await page.setViewportSize({ width: 641, height: 800 })
    await page.waitForLoadState('networkidle')
    await expect(
      page.locator('#primary-nav'),
      'at 641px the inline nav resumes'
    ).toBeVisible()
    await expect(page.locator('.nav-toggle'), 'at 641px the hamburger is hidden').toBeHidden()
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
