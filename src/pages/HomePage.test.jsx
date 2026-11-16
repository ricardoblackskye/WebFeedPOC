import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    addToCart: () => {},
    ...overrides,
  }

  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<Outlet context={context} />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('HomePage footer line', () => {
  it('renders the Dark Factory footer line on the home page', () => {
    renderHomePage()
    expect(screen.getByText(FOOTER_COPY)).toBeDefined()
  })

  it('renders the footer line in italics using an em element', () => {
    renderHomePage()
    expect(screen.getByText(FOOTER_COPY).tagName).toBe('EM')
  })

  it('renders the footer line while products are still loading', () => {
    renderHomePage({ loading: true })
    expect(screen.getByText(FOOTER_COPY)).toBeDefined()
  })

  it('keeps the existing home page content alongside the footer line', () => {
    renderHomePage()
    expect(screen.getByRole('heading', { name: /All Items/ })).toBeDefined()
    expect(screen.getByText('No products available')).toBeDefined()
    expect(screen.getByText(FOOTER_COPY)).toBeDefined()
  })
})
