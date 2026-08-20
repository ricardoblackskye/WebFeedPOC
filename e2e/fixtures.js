import { test as base } from 'playwright/test'

/**
 * Extended test object that provides a human-readable deviceName
 * based on the Playwright project name.
 */
export const test = base.extend({
  deviceName: [async (_unused, use, testInfo) => {
    const name = testInfo.project.name
    const labels = {
      'chromium-mobile-android': 'Galaxy S24 (360×780)',
      'chromium-mobile-se': 'iPhone SE (375×667)',
      'chromium-mobile-pixel5': 'Pixel 5 (393×851)',
      'chromium-mobile-fold': 'Galaxy Z Fold 5 (440×940)',
      'chromium-tablet-mini': 'iPad Mini (768×1024)',
      'chromium-tablet-android': 'Galaxy Tab S9 (800×1280)',
      'chromium-tablet-pro': 'iPad Pro 11" (834×1194)',
      'chromium-desktop': 'Desktop (1280×720)',
      'chromium-desktop-hd': 'Desktop HD (1920×1080)'
    }
    await use(labels[name] || name)
  }, { auto: true }]
})

export { expect } from 'playwright/test'
