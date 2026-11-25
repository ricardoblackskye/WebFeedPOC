import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import HomePage from './HomePage'

const FOOTER_TEXT = 'Built by the Dark Factory - by the Developer Agent'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      products: [],
      loading: false,
      error: null,
      categories: [],
      productCounts: { All: 0 },
      addToCart: vi.fn(),
    }),
  }
})

const renderHomePage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </HelmetProvider>
  )

describe('HomePage footer line', () => {
  it('renders the Dark Factory footer line with the exact copy', () => {
    renderHomePage()
    expect(screen.getByText(FOOTER_TEXT)).toBeDefined()
  })

  it('renders the footer line in italics (em element)', () => {
    renderHomePage()
    const line = screen.getByText(FOOTER_TEXT)
    expect(line.tagName).toBe('EM')
    expect(line.closest('footer')).not.toBeNull()
  })

  it('keeps the existing home page content unchanged', () => {
    renderHomePage()
    expect(screen.getByRole('heading', { name: /All Items/ })).toBeDefined()
    expect(screen.getByText('No products available')).toBeDefined()
  })
})
