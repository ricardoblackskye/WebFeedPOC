# Playwright Device Matrix & Test Infrastructure Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add a Playwright device matrix covering all target viewports so responsive regressions are caught in CI, with a reusable fixture for device-aware testing.

**Architecture:** Extend the existing Playwright config (playwright.config.cjs) with 9 device projects spanning iOS, Android, tablet, and desktop viewports. Create a shared fixture that injects the device name into test context. Add a no-horizontal-scrollbar test at every breakpoint. Wire e2e into the CI workflow with HTML report artifact.

**Technical Strategy:** Use Playwright's built-in devices export (already imported in config). Each project inherits the existing baseURL and webServer config. Mobile projects use explicit viewport + userAgent config (not devices[] presets) for precise control. The no-scroll test uses page.evaluate() to check scroll width <= client width on every page at every viewport.

**Testing Blueprint:** Policy test verifying all 9 device projects exist in config with exact viewport dimensions. E2E tests that run across all devices (no-scroll test). Existing spec files run per-device in CI.

---

## Current State

- playwright.config.cjs: Only 1 project (chromium/Desktop Chrome 1280x720)
- 7 e2e spec files in e2e/, 1 helper file (helpers.js)
- E2E tests do NOT run in CI (only vitest unit tests)
- All existing e2e tests import from "playwright/test"

## Device Matrix (9 projects)

| # | Project Name | Device / Form Factor | Viewport | Touch |
|---|-------------|---------------------|----------|-------|
| 1 | chromium-mobile-se | iPhone SE (iOS small phone) | 375x667 | Yes |
| 2 | chromium-mobile-android | Samsung Galaxy S24 (Android small phone) | 360x780 | Yes |
| 3 | chromium-mobile-pixel5 | Pixel 5 (Android medium phone) | 393x851 | Yes |
| 4 | chromium-mobile-fold | Samsung Galaxy Z Fold 5 (Android foldable inner) | 440x940 | Yes |
| 5 | chromium-tablet-mini | iPad Mini (iOS small tablet) | 768x1024 | Yes |
| 6 | chromium-tablet-android | Samsung Galaxy Tab S9 (Android tablet) | 800x1280 | Yes |
| 7 | chromium-tablet-pro | iPad Pro 11" (iOS large tablet) | 834x1194 | Yes |
| 8 | chromium-desktop | Desktop Chrome (standard laptop) | 1280x720 | No |
| 9 | chromium-desktop-hd | Desktop HD (wide monitor) | 1920x1080 | No |

Key viewport ranges covered: 360px (smallest phone), 375-393-440px (phones), 768-800-834px (tablets), 1280-1920px (desktop).

## Edge Cases Identified

| # | Scenario | Expected Behavior | Test Case |
|---|----------|-------------------|-----------|
| 1 | No device specified | Falls back to Desktop Chrome 1280x720 | Existing default |
| 2 | Galaxy S24 (360x780) — narrowest phone | No horizontal scroll, cart slides over, touch targets >= 48px | no-scrollbar.spec.js |
| 3 | iPhone SE (375x667) | Same as above | no-scrollbar.spec.js |
| 4 | Pixel 5 (393x851) | Same as above | no-scrollbar.spec.js |
| 5 | Galaxy Z Fold 5 (440x940) — foldable inner | Layout adapts, no overflow | no-scrollbar.spec.js |
| 6 | iPad Mini (768x1024) | Grid 2 columns, no overflow | no-scrollbar.spec.js |
| 7 | Galaxy Tab S9 (800x1280) | Same as iPad Mini behaviour | no-scrollbar.spec.js |
| 8 | iPad Pro 11" (834x1194) | Grid 3 columns, no overflow | no-scrollbar.spec.js |
| 9 | Desktop HD (1920x1080) | Grid 4+ columns, no overflow | no-scrollbar.spec.js |
| 10 | CI limited concurrency | Workers=1 in CI prevents port clash | Config already set |
| 11 | Playwright browsers not installed | CI step explicitly installs chromium | CI workflow addition |
| 12 | Touch vs non-touch interactions | Mobile/tablet projects set hasTouch/isMobile; desktop does not | Fixture provides deviceName |

## Repo History Considered

| Commit | Fix Description | Lesson Applied |
|--------|----------------|---------------|
| 4fd2d7d | Fixed JS Standard violations in test/config files | New files must pass Standard lint |
| PR #118 | SPELL_LYCHEE_FILTER_REGEX_EXCLUDE for package-lock | New text files checked by lychee |

---

## Task 1: Add device projects to Playwright config (RED - policy test)

**Objective:** Add 8 new device projects to playwright.config.cjs alongside existing chromium project, covering iOS and Android phones, tablets, foldables, and desktop.

**Files:**
- Modify: playwright.config.cjs
- Create: scripts/tests/playwright-device-matrix.policy.mjs

### Step 1: Write failing policy test

Create scripts/tests/playwright-device-matrix.policy.mjs asserting all 9 projects with their exact viewport dimensions exist:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const configPath = new URL('playwright.config.cjs', root);

const EXPECTED_PROJECTS = [
  { name: 'chromium-mobile-se', width: 375, height: 667 },
  { name: 'chromium-mobile-android', width: 360, height: 780 },
  { name: 'chromium-mobile-pixel5', width: 393, height: 851 },
  { name: 'chromium-mobile-fold', width: 440, height: 940 },
  { name: 'chromium-tablet-mini', width: 768, height: 1024 },
  { name: 'chromium-tablet-android', width: 800, height: 1280 },
  { name: 'chromium-tablet-pro', width: 834, height: 1194 },
  { name: 'chromium-desktop', width: 1280, height: 720 },
  { name: 'chromium-desktop-hd', width: 1920, height: 1080 },
];

test('playwright.config.cjs defines all 9 device projects', () => {
  assert.ok(existsSync(configPath));
  const config = readFileSync(configPath, 'utf8');
  for (const p of EXPECTED_PROJECTS) {
    assert.match(config, new RegExp(`name:\s*'${p.name}'`), `expected '${p.name}'`);
    assert.match(config, new RegExp(`viewport:\s*\{.*width:\s*${p.width}.*height:\s*${p.height}`), `expected viewport ${p.width}x${p.height} for '${p.name}'`);
  }
});

test('custom viewport projects do not use devices[] presets', () => {
  const config = readFileSync(configPath, 'utf8');
  const custom = EXPECTED_PROJECTS.filter(p => p.name !== 'chromium-desktop').map(p => p.name);
  for (const name of custom) {
    assert.doesNotMatch(config, new RegExp(`name:\s*'${name}'[^]*?devices\[`), `'${name}' must use explicit viewport`);
  }
});
```

Run to verify RED:
```bash
node --test scripts/tests/playwright-device-matrix.policy.mjs
```
Expected: 2 tests, 0 pass, 2 fail.

### Step 2: Implement device projects

Modify playwright.config.cjs to add all 9 projects:

```js
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
```

### Step 3: Verify GREEN
```bash
node --test scripts/tests/playwright-device-matrix.policy.mjs
```
Expected: 2 tests, 2 pass.

### Step 4: Commit
```bash
git add playwright.config.cjs scripts/tests/playwright-device-matrix.policy.mjs
git commit -m "feat: add 9 device projects to Playwright config (iOS, Android, tablet, desktop)"
```

---

## Task 2: Create reusable device context fixture

**Objective:** Create fixture that injects device name into test context.

**Files:**
- Create: e2e/fixtures.js
- Modify: scripts/tests/playwright-device-matrix.policy.mjs

### Step 1: Add policy test asserting fixture exists with deviceName export.

### Step 2: Create e2e/fixtures.js with test.extend that maps project names to human-readable device labels:
```
chromium-mobile-android  -> "Galaxy S24 (360×780)"
chromium-mobile-se       -> "iPhone SE (375×667)"
chromium-mobile-pixel5   -> "Pixel 5 (393×851)"
chromium-mobile-fold     -> "Galaxy Z Fold 5 (440×940)"
chromium-tablet-mini     -> "iPad Mini (768×1024)"
chromium-tablet-android  -> "Galaxy Tab S9 (800×1280)"
chromium-tablet-pro      -> "iPad Pro 11" (834×1194)"
chromium-desktop         -> "Desktop (1280×720)"
chromium-desktop-hd      -> "Desktop HD (1920×1080)"
```

### Step 3: Verify GREEN - all 3 policy tests pass.

### Step 4: Commit.

---

## Task 3: Write no-horizontal-scrollbar test

**Objective:** Create test verifying no horizontal scroll at any breakpoint across multiple page types.

**Files:**
- Create: e2e/no-scrollbar.spec.js
- Modify: scripts/tests/playwright-device-matrix.policy.mjs

### Step 1: Create e2e/no-scrollbar.spec.js testing /, /about, /category/Timepieces, /products/1, and product listing - all checking scrollWidth vs clientWidth across all 9 device projects.

### Step 2: Add policy test asserting file exists and covers all page types.

### Step 3: Verify GREEN - all 4 policy tests pass.

### Step 4: Commit.

---

## Task 4: Standardise Playwright imports

**Objective:** Add policy test asserting all e2e spec files import from 'playwright/test'.

**Files:**
- Modify: scripts/tests/playwright-device-matrix.policy.mjs

All 7 existing spec files already use the correct import. Add policy test to enforce consistency.

### Step 5: Commit.

---

## Task 5: Add e2e test step to CI workflow

**Objective:** Add Playwright e2e job to .github/workflows/ci.yml.

**Files:**
- Modify: .github/workflows/ci.yml
- Modify: scripts/tests/playwright-device-matrix.policy.mjs

### Step 1: Write failing policy test asserting CI runs e2e tests and uploads playwright-report artifact.

### Step 2: Add new e2e job to CI workflow:
- needs: test (runs after vitest)
- npx playwright install chromium
- npm run test:e2e with CI: true env
- Upload playwright-report artifact on success or failure

### Step 3: Verify GREEN - all 6 policy tests pass.

### Step 4: Commit.

---

## Acceptance Criteria Verification

```bash
node --test scripts/tests/playwright-device-matrix.policy.mjs
npm test -- --run
npm run test:e2e
```
