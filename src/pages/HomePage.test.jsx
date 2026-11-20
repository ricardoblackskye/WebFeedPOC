import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom'
import HomePage from './HomePage'

function renderHomePage() {
  const outletContext = {
    products: [],
    loading: false,
    error: null,
    categories: [],
    productCounts: { All: 0 },
    addToCart: vi.fn(),
  }

  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Outlet context={outletContext} />}>
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  )
}

describe('HomePage Dark Factory credit', () => {
  it('renders the Dark Factory build credit with the exact story copy', () => {
    renderHomePage()
    expect(screen.getByText('Built by the Dark Factory - by the Developer Agent')).toBeDefined()
  })

  it('renders the credit in italics via an <em> element', () => {
    renderHomePage()
    const credit = screen.getByText('Built by the Dark Factory - by the Developer Agent')
    expect(credit.tagName).toBe('EM')
  })

  it('renders the credit exactly once alongside the unchanged All Items heading', () => {
    renderHomePage()
    expect(screen.getAllByText('Built by the Dark Factory - by the Developer Agent')).toHaveLength(1)
    expect(screen.getByText('All Items')).toBeDefined()
  })
})
