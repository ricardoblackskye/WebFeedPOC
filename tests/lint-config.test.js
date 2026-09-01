import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { load as parseYaml } from 'js-yaml'
import path from 'node:path'

const ROOT = path.resolve(process.cwd())

function loadYaml (relPath) {
  return parseYaml(readFileSync(path.join(ROOT, relPath), 'utf8'))
}

function findStep (workflow, usesPrefix) {
  for (const job of Object.values(workflow.jobs)) {
    for (const step of job.steps || []) {
      if (step.uses && step.uses.startsWith(usesPrefix)) return step
    }
  }
  return undefined
}

// ---------------------------------------------------------------------------
// Task 1: zizmor `artipacked` — checkout must set persist-credentials: false
// ---------------------------------------------------------------------------
describe('Task 1: pr-reviewer.yml zizmor artipacked fix', () => {
  it('actions/checkout sets persist-credentials: false', () => {
    const wf = loadYaml('.github/workflows/pr-reviewer.yml')
    const checkout = findStep(wf, 'actions/checkout')
    expect(checkout, 'checkout step present').toBeDefined()
    expect(checkout.with['persist-credentials']).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Task 3: devskim noise — REPOSITORY_DEVSKIM must be in DISABLE_LINTERS
// ---------------------------------------------------------------------------
describe('Task 3: .mega-linter.yml disables REPOSITORY_DEVSKIM', () => {
  it('DISABLE_LINTERS contains REPOSITORY_DEVSKIM (appended, TYPESCRIPT_STANDARD kept)', () => {
    const cfg = loadYaml('.mega-linter.yml')
    expect(Array.isArray(cfg.DISABLE_LINTERS), 'DISABLE_LINTERS is a list').toBe(true)
    expect(cfg.DISABLE_LINTERS).toContain('TYPESCRIPT_STANDARD')
    expect(cfg.DISABLE_LINTERS).toContain('REPOSITORY_DEVSKIM')
  })
})

// ---------------------------------------------------------------------------
// Task 4: javascript_standard — exclude scripts/pr-reviewer.js via merged regex
// ---------------------------------------------------------------------------
describe('Task 4: .mega-linter.yml excludes pr-reviewer.js from Standard Style', () => {
  it('JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE matches pr-reviewer.js AND existing wix/stripe files', () => {
    const cfg = loadYaml('.mega-linter.yml')
    // MegaLinter (Python) honours the inline (?i) flag; JS RegExp does not, so
    // emulate case-insensitivity with the `i` flag and strip the leading (?i).
    const pattern = cfg.JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE.replace(/^\(\?i\)/, '')
    const rx = new RegExp(pattern, 'i')
    expect(rx.test('scripts/pr-reviewer.js'), 'matches pr-reviewer.js').toBe(true)
    expect(rx.test('src/services/wixService.js'), 'keeps existing wix exclusion').toBe(true)
    expect(rx.test('src/services/stripeService.js'), 'keeps existing stripe exclusion').toBe(true)
    // sanity: a normal source file is NOT excluded (would still be linted)
    expect(rx.test('src/main.js'), 'does not over-exclude normal src files').toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Task 2: cspell — the words MegaLinter flags must be in .cspell.json words[]
// (Current flagged unknowns from `npx cspell` against the repo: openrouter,
//  OPENROUTER, webfeed, pousr, deepseek — all in scripts/pr-reviewer.js)
// ---------------------------------------------------------------------------
describe('Task 2: .cspell.json covers flagged unknown words', () => {
  it('all currently-flagged cspell words are present in the dictionary', () => {
    const cfg = JSON.parse(readFileSync(path.join(ROOT, '.cspell.json'), 'utf8'))
    expect(Array.isArray(cfg.words), 'words is an array').toBe(true)
    const dict = new Set(cfg.words.map((w) => w.toLowerCase()))
    // Words that appear in the plan doc and this test file and are spell-checked
    // by MegaLinter (it lints .hermes/plans/*.md and test files too).
    const flagged = [
      'openrouter', 'OPENROUTER', 'webfeed', 'pousr', 'deepseek',
      'sdlc', 'prio', 'tweetsodium', 'issuecomment', 'isinstance'
    ]
    for (const w of flagged) {
      expect(dict.has(w.toLowerCase()), `dictionary contains "${w}"`).toBe(true)
    }
  })
})
