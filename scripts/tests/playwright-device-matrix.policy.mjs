import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..', '..')
const configPath = resolve(root, 'playwright.config.cjs')

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
]

test('playwright.config.cjs defines all 9 device projects', () => {
  assert.ok(existsSync(configPath), `expected ${configPath} to exist`)
  const config = readFileSync(configPath, 'utf8')

  for (const p of EXPECTED_PROJECTS) {
    assert.match(
      config,
      new RegExp(`name:\\s*'${p.name}'`),
      `expected project '${p.name}' in playwright.config.cjs`,
    )
    assert.match(
      config,
      new RegExp(`viewport:\\s*\\{.*width:\\s*${p.width}.*height:\\s*${p.height}`),
      `expected viewport ${p.width}x${p.height} for project '${p.name}'`,
    )
  }
})

test('custom viewport projects use explicit viewport config, not devices[] presets', () => {
  const config = readFileSync(configPath, 'utf8')
  const custom = EXPECTED_PROJECTS
    .filter(p => p.name !== 'chromium-desktop')
    .map(p => p.name)

  for (const name of custom) {
    assert.doesNotMatch(
      config,
      new RegExp(`name:\\s*'${name}'[^]*?devices\\[`),
      `project '${name}' must use explicit viewport, not devices[]`,
    )
  }
})

test('e2e/fixtures.js exports deviceName fixture via test.extend', () => {
  const fixturesPath = resolve(root, 'e2e', 'fixtures.js')
  assert.ok(existsSync(fixturesPath), `expected ${fixturesPath} to exist`)
  const content = readFileSync(fixturesPath, 'utf8')
  assert.match(content, /deviceName/, 'expected deviceName fixture in e2e/fixtures.js')
  assert.match(content, /extend\(/, 'expected test.extend in e2e/fixtures.js')
  assert.match(content, /export const test/, 'expected test export')
  assert.match(content, /export \{ expect \}/, 'expected expect export')
})

test('e2e/no-scrollbar.spec.js exists and covers all page types', () => {
  const scrollbarPath = resolve(root, 'e2e', 'no-scrollbar.spec.js')
  assert.ok(existsSync(scrollbarPath), `expected ${scrollbarPath} to exist`)
  const content = readFileSync(scrollbarPath, 'utf8')
  assert.match(content, /homepage/, 'expected homepage test')
  assert.match(content, /about page/, 'expected about page test')
  assert.match(content, /category page/, 'expected category page test')
  assert.match(content, /product detail page/, 'expected product detail page test')
  assert.match(content, /scrollWidth.*>.*clientWidth/, 'expected horizontal scroll detection')
})

test('all e2e spec files use consistent import from playwright/test', () => {
  const specFiles = [
    'home.spec.js', 'cart.spec.js', 'pagination.spec.js',
    'search-sort.spec.js', 'about.spec.js', 'category-filter.spec.js',
    'product-page.spec.js', 'accessibility.spec.js',
  ]
  const e2eDir = resolve(root, 'e2e')
  for (const file of specFiles) {
    const filePath = resolve(e2eDir, file)
    assert.ok(existsSync(filePath), `expected ${filePath} to exist`)
    const content = readFileSync(filePath, 'utf8')
    assert.match(
      content,
      /from\s+['"]playwright\/test['"]/,
      `expected ${file} to import from 'playwright/test'`,
    )
  }
})

test('.github/workflows/ci.yml runs e2e tests and uploads Playwright report', () => {
  const ciPath = resolve(root, '.github', 'workflows', 'ci.yml')
  assert.ok(existsSync(ciPath), `expected ${ciPath} to exist`)
  const content = readFileSync(ciPath, 'utf8')
  assert.match(
    content,
    /test:e2e|playwright/,
    'expected CI to run Playwright e2e tests',
  )
  assert.match(
    content,
    /playwright-report/,
    'expected CI to upload Playwright HTML report as artifact',
  )
})
