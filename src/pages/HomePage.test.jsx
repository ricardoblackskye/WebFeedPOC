import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import HomePage from './HomePage'

const CREDIT = 'Built by the Dark Factory - by the Developer Agent'

const baseContext = {
  products: [
    { id: '1', name: 'Walnut Writing Desk', price: 480, category: 'Furniture', description: 'Georgian walnut desk' },
    { id: '2', name: 'Brass Oil Lamp', price: 90, category: 'Lighting', description: 'Victorian oil lamp' },
  ],
  loading: false,
  error: null,
  categories: ['Furniture', 'Lighting'],
  productCounts: { All: 2, Furniture: 1, Lighting: 1 },
  addToCart: vi.fn(),
}

function renderHomePage({ context = {}, initialEntry = '/' } = {}) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<Outlet context={{ ...baseContext, ...context }} />}>
            <Route path="/" element={<HomePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  )
}

describe('HomePage Dark Factory credit', () => {
  it('renders the Dark Factory credit line with the exact copy on the home page', () => {
    renderHomePage()
    expect(screen.getByText(CREDIT)).toBeDefined()
  })

  it('renders the Dark Factory credit line in italics', () => {
    renderHomePage()
    expect(screen.getByText(CREDIT).tagName).toBe('EM')
  })

  it('renders the Dark Factory credit line after the product list as the last element on the page', () => {
    const { container } = renderHomePage()
    const credit = container.querySelector('.home-credit')
    expect(credit).not.toBeNull()
    expect(credit.textContent).toBe(CREDIT)
    const heading = screen.getByRole('heading', { level: 2, name: /All Items/ })
    expect(heading.compareDocumentPosition(credit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(container.lastElementChild).toBe(credit)
  })

  it('keeps the credit at the bottom when the catalogue is empty', () => {
    const { container } = renderHomePage({
      context: { products: [], categories: [], productCounts: { All: 0 } },
    })
    expect(screen.getByText('No products available')).toBeDefined()
    const credit = container.querySelector('.home-credit')
    expect(credit).not.toBeNull()
    expect(container.lastElementChild).toBe(credit)
  })

  it('keeps the credit at the bottom when no products match the search', () => {
    const { container } = renderHomePage({ initialEntry: '/?search=zzzzq' })
    expect(screen.getByText('No products found')).toBeDefined()
    const credit = container.querySelector('.home-credit')
    expect(credit).not.toBeNull()
    expect(container.lastElementChild).toBe(credit)
  })

  it('renders the credit line exactly once on the home page', () => {
    const { container } = renderHomePage()
    expect(container.querySelectorAll('.home-credit')).toHaveLength(1)
    expect(screen.getAllByText(CREDIT)).toHaveLength(1)
  })
})
