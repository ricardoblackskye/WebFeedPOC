import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom'
import HomePage from './HomePage'

const FOOTER_COPY = 'Built by the Dark Factory - by the Developer Agent'

function renderHomePage(overrides = {}) {
  const context = {
    products: [],
    loading: false,
    error: null,
    categories: [],
    productCounts: { All: 0 },
    addToCart: vi.fn(),
    ...overrides,
  }

  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Outlet context={context} />}>
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  )
}

afterEach(() => {
  cleanup()
})

describe('HomePage', () => {
  it('renders the Dark Factory footer line with the exact copy on the home page', () => {
    renderHomePage()
    expect(screen.getByText(FOOTER_COPY)).toBeDefined()
  })

  it('renders the footer line as italic text', () => {
    renderHomePage()
    const line = screen.getByText(FOOTER_COPY)
    expect(line.tagName).toBe('EM')
    expect(line.closest('footer')).not.toBeNull()
  })

  it('renders the footer line while products are loading', () => {
    renderHomePage({ loading: true })
    expect(screen.getByText(FOOTER_COPY)).toBeDefined()
    expect(screen.getByText('Loading products...')).toBeDefined()
  })

  it('renders the footer line when the product list is empty', () => {
    renderHomePage({ loading: false, products: [] })
    expect(screen.getByText(FOOTER_COPY)).toBeDefined()
    expect(screen.getByText('No products available')).toBeDefined()
  })

  it('keeps existing home page content alongside the new footer line', () => {
    renderHomePage()
    expect(screen.getByText('All Items')).toBeDefined()
    expect(screen.getByText(FOOTER_COPY)).toBeDefined()
  })
})
