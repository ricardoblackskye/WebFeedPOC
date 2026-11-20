import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import HomePage from './HomePage'

const CREDIT_LINE = 'Built by the Dark Factory - by the Developer Agent - concurrent'

function HomeOutlet({ products = [], loading = false }) {
  return (
    <Outlet
      context={{
        products,
        loading,
        error: null,
        categories: [],
        productCounts: { All: products.length },
        addToCart: vi.fn(),
      }}
    />
  )
}

function renderHomePage(props = {}) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomeOutlet {...props} />}>
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  )
}

describe('HomePage Dark Factory credit line', () => {
  it('renders the credit line with the exact copy from the story', () => {
    renderHomePage()
    expect(screen.getByText(CREDIT_LINE)).toBeDefined()
  })

  it('renders the credit line in italics via an em element', () => {
    renderHomePage()
    expect(screen.getByText(CREDIT_LINE).tagName).toBe('EM')
  })

  it('renders the credit line exactly once while products are loading', () => {
    renderHomePage({ loading: true })
    expect(screen.getAllByText(CREDIT_LINE)).toHaveLength(1)
  })
})
