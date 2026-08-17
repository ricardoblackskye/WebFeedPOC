import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const packageJson = JSON.parse(
  readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')
)
const packageLock = JSON.parse(
  readFileSync(resolve(process.cwd(), 'package-lock.json'), 'utf8')
)

const AFFECTED_RANGES = {
  ghsa: { minimum: [7, 12, 0], maximumExclusive: [8, 3, 0] },
  aikidoCsrf: { minimum: [7, 12, 0], maximumExclusive: [7, 18, 0] },
  aikidoDeserialization: { minimum: [7, 0, 0], maximumExclusive: [7, 18, 0] }
}

function parseVersion (version) {
  const match = String(version).match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!match) throw new Error(`Unsupported React Router version: ${version}`)
  return match.slice(1).map(Number)
}

function compareVersions (left, right) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index]
  }
  return 0
}

function isAffected (version, range) {
  const parsed = parseVersion(version)
  return compareVersions(parsed, range.minimum) >= 0 &&
    compareVersions(parsed, range.maximumExclusive) < 0
}

function resolvedVersion (packageName) {
  return packageLock.packages[`node_modules/${packageName}`]?.version
}

describe('React Router security baseline', () => {
  it('declares a React Router version outside the GHSA affected range', () => {
    const declared = packageJson.dependencies['react-router-dom']
    const resolved = resolvedVersion('react-router-dom')

    expect(declared).toBeDefined()
    expect(resolved).toBeDefined()
    const mainSource = readFileSync(resolve(process.cwd(), 'src/main.jsx'), 'utf8')
    const usesFrameworkMode = mainSource.includes('createRequestHandler') ||
      mainSource.includes('createBrowserRouter')

    if (usesFrameworkMode) {
      expect(isAffected(resolved, AFFECTED_RANGES.ghsa)).toBe(false)
    } else {
      expect(isAffected(resolved, AFFECTED_RANGES.aikidoCsrf)).toBe(false)
      expect(isAffected(resolved, AFFECTED_RANGES.aikidoDeserialization)).toBe(false)
    }
  })

  it('resolves matching react-router and react-router-dom versions outside all reported ranges', () => {
    const routerVersion = resolvedVersion('react-router')
    const domVersion = resolvedVersion('react-router-dom')

    expect(routerVersion).toBeDefined()
    expect(domVersion).toBe(routerVersion)

    const mainSource = readFileSync(resolve(process.cwd(), 'src/main.jsx'), 'utf8')
    const usesFrameworkMode = mainSource.includes('createRequestHandler') ||
      mainSource.includes('createBrowserRouter')

    if (usesFrameworkMode) {
      expect(Object.values(AFFECTED_RANGES).some((range) => isAffected(routerVersion, range))).toBe(false)
    } else {
      expect(isAffected(routerVersion, AFFECTED_RANGES.aikidoCsrf)).toBe(false)
      expect(isAffected(routerVersion, AFFECTED_RANGES.aikidoDeserialization)).toBe(false)
    }
  })

  it('uses the intended SPA router rather than Framework Mode server actions', () => {
    const mainSource = readFileSync(resolve(process.cwd(), 'src/main.jsx'), 'utf8')
    const packageSource = readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')

    expect(mainSource).toContain('BrowserRouter')
    expect(mainSource).not.toContain('createRequestHandler')
    expect(mainSource).not.toContain('createBrowserRouter')
    expect(packageSource).not.toContain('@react-router/dev')
  })
})

describe('React Router security test helpers', () => {
  it('classifies the reported affected ranges correctly', () => {
    expect(isAffected('7.13.0', AFFECTED_RANGES.ghsa)).toBe(true)
    expect(isAffected('8.3.0', AFFECTED_RANGES.ghsa)).toBe(false)
    expect(isAffected('7.17.0', AFFECTED_RANGES.aikidoCsrf)).toBe(true)
    expect(isAffected('7.18.0', AFFECTED_RANGES.aikidoCsrf)).toBe(false)
    expect(isAffected('7.0.0', AFFECTED_RANGES.aikidoDeserialization)).toBe(true)
    expect(isAffected('7.18.0', AFFECTED_RANGES.aikidoDeserialization)).toBe(false)
  })
})

export { AFFECTED_RANGES, compareVersions, isAffected, parseVersion }
