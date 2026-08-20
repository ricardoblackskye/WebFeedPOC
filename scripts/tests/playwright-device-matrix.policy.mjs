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
