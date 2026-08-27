import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import ReleasenotesPage from './ReleasenotesPage'

describe('ReleasenotesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the release notes heading and content', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <ReleasenotesPage />
        </MemoryRouter>
      </HelmetProvider>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /Release Notes/i })).toBeInTheDocument()
    expect(screen.getByText(/This file will be auto-updated by the Eve Agent./)).toBeInTheDocument()
  })
})
