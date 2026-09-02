/**
 * Shared helpers for Playwright E2E tests.
 *
 * The app falls back to mock/demo products when no Wix credentials are
 * configured, so all tests run against the built-in demo catalogue.
 */

import { type Page } from '@playwright/test'

/** Wait until the product grid is visible and at least one card is rendered. */
export async function waitForProducts (page: Page): Promise<void> {
  await page.waitForSelector('.product-card', { timeout: 15000 })
}

/**
 * Wait for the loading spinner to disappear before asserting anything
 * that depends on product data.
 */
export async function waitForLoadingToFinish (page: Page): Promise<void> {
  // The loading div is only present while products are being fetched
  const loading = page.locator('.loading')
  try {
    await loading.waitFor({ state: 'detached', timeout: 15000 })
  } catch {
    // Already gone – that's fine
  }
}

/**
 * On mobile (<=640px) the primary nav is collapsed behind a hamburger toggle
 * and is `display:none` until revealed. On tablet/desktop the nav is already
 * visible and the toggle is hidden, so this is a no-op there. Call this before
 * asserting the nav is visible or clicking a nav link, so tests work at every
 * breakpoint (see #108 responsive changes in src/App.css).
 */
export async function revealPrimaryNav (page: Page): Promise<void> {
  const toggle = page.locator('.nav-toggle')
  if (await toggle.isVisible()) {
    await toggle.click()
    await page.locator('#primary-nav').waitFor({ state: 'visible' })
  }
}
