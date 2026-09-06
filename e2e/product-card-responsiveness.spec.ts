import { test, expect } from '@playwright/test';

test.describe('Product Card Responsiveness', () => {
  // Test for mobile viewport
  test.use({ viewport: { width: 320, height: 568 } });
  test('mobile product card has correct image aspect ratio', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.product-card');

    const imageContainer = page.locator('.product-card').first().locator('.product-image');
    await expect(imageContainer).toHaveCSS('aspect-ratio', '4 / 3');
  });

  test('mobile product name font size is set', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.product-card');

    const productName = page.locator('.product-card').first().locator('.product-name');
    const fontSize = await productName.evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });
    // Just check font size is set (not auto or invalid)
    expect(fontSize).toMatch(/^\d+(\.\d+)?px$/);
  });

  test('mobile product info padding is set', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.product-card');

    const productInfo = page.locator('.product-card').first().locator('.product-info');
    const paddingTop = await productInfo.evaluate(el => {
      return window.getComputedStyle(el).paddingTop;
    });
    // Just check padding is set (not auto or invalid)
    expect(paddingTop).toMatch(/^\d+(\.\d+)?px$/);
  });

  // Test for tablet viewport
  test.use({ viewport: { width: 768, height: 1024 } });
  test('tablet product card has correct image aspect ratio', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.product-card');

    const imageContainer = page.locator('.product-card').first().locator('.product-image');
    await expect(imageContainer).toHaveCSS('aspect-ratio', '4 / 3');
  });

  test('tablet product name font size is set', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.product-card');

    const productName = page.locator('.product-card').first().locator('.product-name');
    const fontSize = await productName.evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });
    // We'll just check it's set (not auto or invalid)
    expect(fontSize).toMatch(/^\d+(\.\d+)?px$/);
  });

  test('tablet product info padding is set', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.product-card');

    const productInfo = page.locator('.product-card').first().locator('.product-info');
    const paddingTop = await productInfo.evaluate(el => {
      return window.getComputedStyle(el).paddingTop;
    });
    expect(paddingTop).toMatch(/^\d+(\.\d+)?px$/);
  });

  // Test for desktop viewport
  test.use({ viewport: { width: 1280, height: 720 } });
  test('desktop product card has correct image aspect ratio', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.product-card');

    const imageContainer = page.locator('.product-card').first().locator('.product-image');
    await expect(imageContainer).toHaveCSS('aspect-ratio', '4 / 3');
  });

  test('desktop product name font size is 1.25rem', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.product-card');

    const productName = page.locator('.product-card').first().locator('.product-name');
    const fontSize = await productName.evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });
    // Expect 1.25rem = 20px (assuming base font size 16px)
    expect(fontSize).toBe('20px');
  });

  test('desktop product info padding is 1.25rem', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.product-card');

    const productInfo = page.locator('.product-card').first().locator('.product-info');
    const paddingTop = await productInfo.evaluate(el => {
      return window.getComputedStyle(el).paddingTop;
    });
    expect(paddingTop).toBe('20px');
  });

  // Test for no overflow at any viewport
  test.describe('No Overflow', () => {
    test('no overflow on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto('/');
      await page.waitForSelector('.product-card');

      const cards = page.locator('.product-card');
      const count = await cards.count();
      for (let i = 0; i < count; i++) {
        const card = cards.nth(i);
        // Check that the card's width is not greater than the viewport width
        const box = await card.boundingBox();
        expect(box?.width).toBeLessThanOrEqual(320);
        // Check that the card doesn't cause horizontal overflow
        const overflowCheck = await card.evaluate(el => {
          return el.scrollWidth <= el.clientWidth + 1; // Allow 1px for rounding
        });
        expect(overflowCheck).toBeTruthy();
      }
    });

    test('no overflow on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForSelector('.product-card');

      const cards = page.locator('.product-card');
      const count = await cards.count();
      for (let i = 0; i < count; i++) {
        const card = cards.nth(i);
        const box = await card.boundingBox();
        expect(box?.width).toBeLessThanOrEqual(768);
        const overflowCheck = await card.evaluate(el => {
          return el.scrollWidth <= el.clientWidth + 1;
        });
        expect(overflowCheck).toBeTruthy();
      }
    });

    test('no overflow on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');
      await page.waitForSelector('.product-card');

      const cards = page.locator('.product-card');
      const count = await cards.count();
      for (let i = 0; i < count; i++) {
        const card = cards.nth(i);
        const box = await card.boundingBox();
        expect(box?.width).toBeLessThanOrEqual(1280);
        const overflowCheck = await card.evaluate(el => {
          return el.scrollWidth <= el.clientWidth + 1;
        });
        expect(overflowCheck).toBeTruthy();
      }
    });
  });
});