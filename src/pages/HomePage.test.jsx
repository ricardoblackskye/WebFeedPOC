import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import HomePage from './HomePage'

const CREDIT = 'Built by the Dark Factory - by the Developer Agent'

function renderHomePage(overrides = {}) {
  const outletContext = {
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
          <Route path="/" element={<Outlet context={outletContext} />}>
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  )
}

describe('HomePage footer credit', () => {
  it('renders the Dark Factory footer credit with the exact story copy', () => {
    renderHomePage()
    expect(screen.getByText(CREDIT)).toBeDefined()
  })

  it('renders the footer credit in italics', () => {
    renderHomePage()
    expect(screen.getByText(CREDIT).tagName).toBe('EM')
  })

  it('renders the footer credit once and leaves the existing home page content unchanged', () => {
    renderHomePage()
    expect(screen.getAllByText(CREDIT)).toHaveLength(1)
    expect(screen.getByRole('heading', { name: /All Items/ })).toBeDefined()
  })

  it('renders the footer credit while products are still loading', () => {
    renderHomePage({ loading: true })
    expect(screen.getByText(CREDIT)).toBeDefined()
  })
})
