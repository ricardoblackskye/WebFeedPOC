/**
 * #214 - no installed copy of minimatch may sit inside the advisory's affected range.
 *
 * osv-scanner is a REQUIRED MegaLinter descriptor, so a single affected copy turns MegaLinter red on every
 * branch - including `main` - and the Dark Factory's Definition of Done reads the pull request's checks, so
 * no run against this repository can report done while it is red.
 *
 * The affected copy is NESTED (`@typescript-eslint/typescript-estree/node_modules/minimatch`), which is the
 * copy a top-level glance misses, so this reads `package-lock.json` - the only place a nested copy's resolved
 * version lives - and checks EVERY copy.
 *
 * Range from GHSA-g3hv-75wg-m249 (CVE-2026-118764): introduced 7.0.0, fixed 11.0.1. The lower bound matters:
 * the three 3.1.5 copies under eslint's own packages are BELOW the affected range and are correctly clean,
 * which is why osv-scanner reported exactly one affected package.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const FIRST_AFFECTED = [7, 0, 0]
const FIRST_PATCHED = [11, 0, 1]

const parseVersion = (version) =>
  String(version)
    .split('-')[0]
    .split('.')
    .map((part) => Number.parseInt(part, 10))

const compare = (a, b) => {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const left = a[i] ?? 0
    const right = b[i] ?? 0
    if (left !== right) return left < right ? -1 : 1
  }
  return 0
}

/** True when the version sits inside `>= FIRST_AFFECTED` and `< FIRST_PATCHED`. */
export const inAffectedRange = (version) => {
  const parsed = parseVersion(version)
  return compare(parsed, FIRST_AFFECTED) >= 0 && compare(parsed, FIRST_PATCHED) < 0
}

/** Every resolved minimatch copy in the lock, nested ones included. */
export const minimatchCopies = () => {
  const lock = JSON.parse(readFileSync(resolve(process.cwd(), 'package-lock.json'), 'utf8'))
  return Object.entries(lock.packages ?? {})
    .filter(([key]) => key === 'node_modules/minimatch' || key.endsWith('/node_modules/minimatch'))
    .map(([key, entry]) => ({ key, version: entry.version }))
}

describe('#214 no vulnerable minimatch copy is installed', () => {
  it('finds at least one copy, so this guard cannot pass vacuously', () => {
    // A collection assertion over an empty tree passes while protecting nothing.
    expect(minimatchCopies().length).toBeGreaterThan(0)
  })

  it('places the range boundaries correctly', () => {
    // The boundary the advisory names: the first PATCHED version is clean, the one below it is not.
    expect(inAffectedRange('11.0.1')).toBe(false)
    expect(inAffectedRange('11.0.0')).toBe(true)
    // The lower bound: 7.0.0 is the first affected, and the 3.x line below it is clean.
    expect(inAffectedRange('7.0.0')).toBe(true)
    expect(inAffectedRange('6.2.3')).toBe(false)
    expect(inAffectedRange('3.1.5')).toBe(false)
  })

  it('has no copy inside the affected range', () => {
    const affected = minimatchCopies().filter((copy) => inAffectedRange(copy.version))
    const detail = `affected minimatch copies still installed: ${JSON.stringify(affected)}`
    expect(affected, detail).toEqual([])
  })
})
