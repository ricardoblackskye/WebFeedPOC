import { describe, it, expect } from 'vitest'
import { execSync, type ExecSyncOptions } from 'node:child_process'
import { readFileSync } from 'node:fs'

describe('YAML linting should pass for configuration files', () => {
  const files = [
    '.github/workflows/ci.yml',
    '.github/workflows/mega-linter.yml',
    '.mega-linter.yml'
  ]

  it('should have no YAML parsing errors', { timeout: 60000 }, () => {
    const opts: ExecSyncOptions = { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    for (const file of files) {
      try {
        // Use yaml-lint to check the file
        execSync(`npx yaml-lint ${file}`, opts)
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        throw new Error(`YAML linting failed for ${file}: ${message}`)
      }
    }
  })

  it('should not have duplicate keys in .mega-linter.yml', () => {
    const content = readFileSync('.mega-linter.yml', 'utf8')
    // Simple check for duplicate key: look for two lines with the same key (without considering indentation)
    // We'll look for the specific key mentioned in the issue
    const key = 'JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE:'
    const lines = content.split('\n')
    let count = 0
    for (const line of lines) {
      if (line.trim().startsWith(key)) {
        count++
      }
    }
    expect(count).toBe(1)
  })
})