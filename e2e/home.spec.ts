import { test, expect, type Page } from 'playwright/test'
import { waitForProducts, waitForLoadingToFinish } from './helpers'

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
  })

  test('renders the site header and footer', async ({ page }) => {
    await expect(page.locator('header h1')).toContainText('Antiques Marketplace')
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.locator('footer')).toContainText('All rights reserved')
  })

  test('displays product cards after loading', async ({ page }) => {
    await waitForProducts(page)
    const cards = page.locator('.product-card')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('each product card shows name and price', async ({ page }) => {
    await waitForProducts(page)
    const firstCard = page.locator('.product-card').first()
    await expect(firstCard.locator('.product-name')).not.toBeEmpty()
    await expect(firstCard.locator('.product-price')).toContainText('£')
  })

  test('shows the category filter panel', async ({ page }) => {
    await waitForProducts(page)
    await expect(page.locator('.category-filter')).toBeVisible()
    // "All Items" button should exist and be active by default
    await expect(page.locator('.category-btn.active')).toContainText('All Items')
  })

  test('shows sort and search controls', async ({ page }) => {
    await waitForProducts(page)
    await expect(page.locator('select, [role="combobox"]').first()).toBeVisible()
    await expect(page.locator('input[type="search"], input[type="text"]').first()).toBeVisible()
  })

  test('product count heading matches number of cards', async ({ page }) => {
    await waitForProducts(page)
    const countText = await page.locator('.product-count').first().innerText()
    // countText is like "(12)"
    const countFromHeading = Number.parseInt(countText.replaceAll(/\D/g, ''), 10)
    const visibleCards = await page.locator('.product-card').count()
    // Shown cards may be a paginated subset, so count should be <= heading count
    expect(visibleCards).toBeLessThanOrEqual(countFromHeading)
  })

  test('shows the Shopping Cart sidebar', async ({ page }) => {
    await expect(page.locator('.cart')).toBeVisible()
    await expect(page.locator('.cart h2')).toContainText('Shopping Cart')
  })

  test('shows empty cart message when no items added', async ({ page }) => {
    await expect(page.locator('.cart-empty')).toBeVisible()
    await expect(page.locator('.cart-empty')).toContainText('Your cart is empty')
  })

  test('navigates to product page when a product card is clicked', async ({ page }) => {
    await waitForProducts(page)
    const firstCard = page.locator('.product-card').first()
    const productName = await firstCard.locator('.product-name').innerText()
    await firstCard.locator('.product-card-link').click()
    await page.waitForURL(/\/products\//)
    // Product page should show the same product name
    await expect(page.locator('h1, h2').filter({ hasText: productName })).toBeVisible()
  })
})
