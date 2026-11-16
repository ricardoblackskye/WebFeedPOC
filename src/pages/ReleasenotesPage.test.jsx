import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import ReleasenotesPage from './ReleasenotesPage'

const ROOT = path.resolve(process.cwd())

// This tree is CRLF; an un-normalized comparison passes locally and fails in CI.
const normalize = (text) => text.replace(/\r\n/g, '\n').trim()

describe('ReleasenotesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the release notes heading and the notes themselves', () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <ReleasenotesPage />
        </MemoryRouter>
      </HelmetProvider>
    )

    expect(screen.getByRole('heading', { level: 1, name: /Release Notes/i })).toBeInTheDocument()

    // The page renders releasenotes.md into a <pre>. Assert the BODY, never a literal copied out of the
    // content file: pinning a string from that file is what let the first real release note turn main red.
    const body = container.querySelector('.releasenotes-content pre')
    expect(body, 'the page renders a body element').not.toBeNull()

    const rendered = normalize(body.textContent ?? '')

    // Fails if the page renders nothing - the case a placeholder-only assertion could not catch.
    expect(rendered.length).toBeGreaterThan(0)

    // And what it renders is the file's content, read from disk rather than through the bundler.
    const onDisk = normalize(readFileSync(path.join(ROOT, 'releasenotes.md'), 'utf8'))
    expect(rendered).toBe(onDisk)
  })
})
