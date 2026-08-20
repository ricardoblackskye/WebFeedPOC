const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } }
    },
    {
      name: 'chromium-mobile-android',
      use: {
        browserName: 'chromium',
        viewport: { width: 360, height: 780 },
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Samsung Galaxy S24) AppleWebKit/537.36',
        isMobile: true,
        hasTouch: true
      }
    },
    {
      name: 'chromium-mobile-se',
      use: {
        browserName: 'chromium',
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        isMobile: true,
        hasTouch: true
      }
    },
    {
      name: 'chromium-mobile-pixel5',
      use: {
        browserName: 'chromium',
        viewport: { width: 393, height: 851 },
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 5) AppleWebKit/537.36',
        isMobile: true,
        hasTouch: true
      }
    },
    {
      name: 'chromium-mobile-fold',
      use: {
        browserName: 'chromium',
        viewport: { width: 440, height: 940 },
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Samsung Galaxy Z Fold 5) AppleWebKit/537.36',
        isMobile: true,
        hasTouch: true
      }
    },
    {
      name: 'chromium-tablet-mini',
      use: {
        browserName: 'chromium',
        viewport: { width: 768, height: 1024 },
        isMobile: true,
        hasTouch: true
      }
    },
    {
      name: 'chromium-tablet-android',
      use: {
        browserName: 'chromium',
        viewport: { width: 800, height: 1280 },
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Samsung Galaxy Tab S9) AppleWebKit/537.36',
        isMobile: true,
        hasTouch: true
      }
    },
    {
      name: 'chromium-tablet-pro',
      use: {
        browserName: 'chromium',
        viewport: { width: 834, height: 1194 },
        isMobile: true,
        hasTouch: true
      }
    },
    {
      name: 'chromium-desktop-hd',
      use: {
        browserName: 'chromium',
        viewport: { width: 1920, height: 1080 }
      }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  }
})
