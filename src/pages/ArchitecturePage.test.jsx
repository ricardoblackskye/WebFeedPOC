import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import ArchitecturePage from './ArchitecturePage'

describe('ArchitecturePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the architecture title, document sections, and SEO tags', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <ArchitecturePage />
        </MemoryRouter>
      </HelmetProvider>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /Architecture — Antiques Marketplace/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /1\. System Overview/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /11\. State Management Summary/i })).toBeInTheDocument()
  })

  it('renders markdown tables cleanly for tabular sections', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <ArchitecturePage />
        </MemoryRouter>
      </HelmetProvider>,
    )

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    expect(screen.getByText('Scope')).toBeInTheDocument()
    expect(screen.getByText('Mechanism')).toBeInTheDocument()
    expect(screen.getByText('What it holds')).toBeInTheDocument()
    expect(screen.getAllByText('App-wide').length).toBeGreaterThanOrEqual(1)
  })

  it('mounts chart containers for all 11 Mermaid diagrams in the document', async () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <ArchitecturePage />
        </MemoryRouter>
      </HelmetProvider>,
    )

    const mermaidContainers = container.querySelectorAll('.mermaid-diagram, [data-mermaid]')
    expect(mermaidContainers.length).toBe(11)
  })

  it('renders safely in SSR / non-DOM environments without throwing', () => {
    expect(() => {
      render(
        <HelmetProvider>
          <MemoryRouter>
            <ArchitecturePage />
          </MemoryRouter>
        </HelmetProvider>,
      )
    }).not.toThrow()
  })
})
