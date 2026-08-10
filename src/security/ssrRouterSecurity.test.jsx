import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const securityDirectory = dirname(fileURLToPath(import.meta.url))
const sourcePaths = {
  entryServer: resolve(securityDirectory, '../entry-server.jsx'),
  prerender: resolve(securityDirectory, '../../scripts/prerender.mjs'),
  wixSession: resolve(securityDirectory, '../services/wixSession.js'),
}

async function readSources() {
  const contents = await Promise.all(
    Object.entries(sourcePaths).map(async ([name, filePath]) => [name, await readFile(filePath, 'utf8')]),
  )
  return Object.fromEntries(contents)
}

describe('React Router SSR security boundary', () => {
  it('provides the same query provider required by data-aware routes', async () => {
    const { entryServer } = await readSources()

    expect(entryServer).toContain('QueryClientProvider')
    expect(entryServer).toContain('QueryClient')
  })

  it('guards browser-only session access before the SSR bundle is evaluated', async () => {
    const { wixSession } = await readSources()

    expect(wixSession).toContain('typeof window')
    expect(wixSession).not.toContain('localStorage.getItem')
  })

  it('fails the prerender process when no route is rendered', async () => {
    const { prerender } = await readSources()

    expect(prerender).toContain('successCount === 0')
    expect(prerender).toContain('process.exitCode = 1')
  })

  it('does not expose an arbitrary constructor hydration path in the SSR entry', async () => {
    const { entryServer } = await readSources()

    expect(entryServer).not.toContain('window[__subType]')
    expect(entryServer).not.toContain('window[metadata.constructor]')
    expect(entryServer).not.toContain('eval(')
    expect(entryServer).not.toContain('new window[')
  })
})
