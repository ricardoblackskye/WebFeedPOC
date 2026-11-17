import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import HomePage from './HomePage'

vi.mock('../components/ProductList', () => ({
  default: () => <div data-testid="product-list" />
}))

vi.mock('../utils/structuredData', () => ({
  generateItemListSchema: () => ({ '@type': 'ItemList' })
}))

const products = [{ id: '1', name: 'Vase', description: 'A vase', price: 10, category: 'Ceramics' }]
const outletContext = {
  products,
  loading: false,
  error: null,
  categories: ['Ceramics'],
  productCounts: { All: 1, Ceramics: 1 },
  addToCart: vi.fn()
}

const renderHomePage = () =>
  render(
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

afterEach(cleanup)

describe('HomePage footer', () => {
  it('renders the footer line with the exact credit text', () => {
    renderHomePage()
    expect(screen.getByText('Built by the Dark Factory - by the Developer Agent')).toBeDefined()
  })

  it('renders the footer credit in italics using an em element', () => {
    renderHomePage()
    const footer = screen.getByText('Built by the Dark Factory - by the Developer Agent')
    expect(footer.tagName).toBe('EM')
  })

  it('places the footer line after the product list in document order', () => {
    renderHomePage()
    const productList = screen.getByTestId('product-list')
    const footer = screen.getByText('Built by the Dark Factory - by the Developer Agent')
    expect(productList.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('keeps the existing home page content intact', () => {
    renderHomePage()
    expect(screen.getByRole('heading', { level: 2 }).textContent).toContain('All Items')
    expect(screen.getByTestId('product-list')).toBeDefined()
  })
})
