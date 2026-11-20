import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import HomePage from './HomePage'

const CREDIT_LINE = 'Built by the Dark Factory - by the Developer Agent'

const outletContext = {
  products: [],
  loading: false,
  error: null,
  categories: [],
  productCounts: { All: 0 },
  addToCart: () => {}
}

function ContextRoute() {
  return <Outlet context={outletContext} />
}

function renderHomePage() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ContextRoute />}>
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  )
}

describe('HomePage', () => {
  it('renders the Dark Factory credit line with the exact copy on the home page', () => {
    renderHomePage()
    expect(screen.getByText(CREDIT_LINE)).toBeDefined()
  })

  it('renders the Dark Factory credit line in italics', () => {
    renderHomePage()
    const line = screen.getByText(CREDIT_LINE)
    expect(line.tagName).toBe('EM')
  })

  it('renders the credit line once alongside the existing home page heading and product count', () => {
    renderHomePage()
    expect(screen.getAllByText(CREDIT_LINE)).toHaveLength(1)
    expect(screen.getByRole('heading', { name: /All Items/ })).toBeDefined()
    expect(screen.getByText('(0)')).toBeDefined()
  })
})
