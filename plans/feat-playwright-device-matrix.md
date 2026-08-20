# Playwright Device Matrix & Test Infrastructure Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add a Playwright device matrix covering all target viewports so responsive regressions are caught in CI, with a reusable fixture for device-aware testing.

**Architecture:** Extend the existing Playwright config (playwright.config.cjs) with 6 device projects (iPhone SE, Pixel 5, iPad Mini, iPad Pro 11", Desktop Chrome, Desktop HD). Create a shared fixture that injects the viewport name into test context. Add a no-horizontal-scrollbar test at every breakpoint. Wire e2e into the CI workflow with HTML report artifact.

**Technical Strategy:** Use Playwright's built-in devices export (already imported in config). Each project inherits the existing baseURL and webServer config. Create a fixture in e2e/fixtures.js that provides deviceName. The no-scroll test uses page.evaluate() to check scroll width <= client width on every page at every viewport.

**Testing Blueprint:** Policy test verifying all 6 device projects exist in config. E2E tests that run across all devices (no-scroll test). Existing spec files run per-device in CI.

---

## Current State

- playwright.config.cjs: Only 1 project (chromium/Desktop Chrome 1280x720)
- 7 e2e spec files in e2e/, 1 helper file (helpers.js)
- E2E tests do NOT run in CI (only vitest unit tests)
- All existing e2e tests import from "playwright/test"

## Edge Cases Identified

| # | Scenario | Expected Behavior | Test Case |
|---|----------|-------------------|-----------|
| 1 | No device specified | Falls back to Desktop Chrome 1280x720 | Existing default |
| 2 | iPhone SE (375x667) | No horizontal scroll, cart accessible | no-scrollbar.spec.js |
| 3 | Pixel 5 (393x851) | Same as above | no-scrollbar.spec.js |
| 4 | iPad Mini (768x1024) | Grid 2 columns, no overflow | no-scrollbar.spec.js |
| 5 | iPad Pro 11" (834x1194) | Grid 3 columns, no overflow | no-scrollbar.spec.js |
| 6 | Desktop HD (1920x1080) | Grid 4+ columns, no overflow | no-scrollbar.spec.js |
| 7 | CI limited concurrency | Workers=1 in CI prevents port clash | Config already set |
| 8 | Playwright browsers not installed | CI step explicitly installs chromium | CI workflow addition |

## Repo History Considered

| Commit | Fix Description | Lesson Applied |
|--------|----------------|---------------|
| 4fd2d7d | Fixed JS Standard violations in test/config files | New files must pass Standard lint |
| PR #118 | SPELL_LYCHEE_FILTER_REGEX_EXCLUDE for package-lock | New text files checked by lychee |

---

## Task 1: Add device projects to Playwright config (RED - policy test)

**Objective:** Add 5 new device projects to playwright.config.cjs alongside existing chromium project.

**Files:**
- Modify: playwright.config.cjs
- Create: scripts/tests/playwright-device-matrix.policy.mjs

### Step 1: Write failing policy test

Create scripts/tests/playwright-device-matrix.policy.mjs asserting all 6 projects with their exact viewport dimensions exist.

Run to verify RED:
  node --test scripts/tests/playwright-device-matrix.policy.mjs

Expected: 2 tests, 0 pass, 2 fail.

### Step 2: Implement device projects

Modify playwright.config.cjs to add all 6 projects:
- chromium-desktop (1280x720) - uses devices['Desktop Chrome']
- chromium-mobile-se (375x667) - iPhone SE
- chromium-mobile-pixel5 (393x851) - Pixel 5
- chromium-tablet-mini (768x1024) - iPad Mini with isMobile/hasTouch
- chromium-tablet-pro (834x1194) - iPad Pro 11" with isMobile/hasTouch
- chromium-desktop-hd (1920x1080)

### Step 3: Verify GREEN
  node --test scripts/tests/playwright-device-matrix.policy.mjs

Expected: 2 tests, 2 pass.

### Step 4: Commit
  git add playwright.config.cjs scripts/tests/playwright-device-matrix.policy.mjs
  git commit -m "feat: add 6 device projects to Playwright config"

---

## Task 2: Create reusable device context fixture

**Objective:** Create fixture that injects device name into test context.

**Files:**
- Create: e2e/fixtures.js
- Modify: scripts/tests/playwright-device-matrix.policy.mjs

### Step 1: Add policy test asserting fixture exists with deviceName export.

### Step 2: Create e2e/fixtures.js with test.extend that maps project names to human-readable device labels.

### Step 3: Verify GREEN - all 3 policy tests pass.

### Step 4: Commit.

---

## Task 3: Write no-horizontal-scrollbar test

**Objective:** Create test verifying no horizontal scroll at any breakpoint across multiple page types.

**Files:**
- Create: e2e/no-scrollbar.spec.js
- Modify: scripts/tests/playwright-device-matrix.policy.mjs

### Step 1: Create e2e/no-scrollbar.spec.js testing /, /about, /category/Timepieces, /products/1, and product listing - all checking scrollWidth vs clientWidth.

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

  node --test scripts/tests/playwright-device-matrix.policy.mjs
  npm test -- --run
  npm run test:e2e
