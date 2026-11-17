import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import HomePage from './HomePage'

const FOOTER_TEXT = 'Built by the Dark Factory - by the Developer Agent'

const products = [
  {
    id: 'p1',
    name: 'Victorian Oak Chair',
    price: 250,
    category: 'Furniture',
    description: 'A sturdy Victorian oak chair',
    image: 'chair.jpg',
  },
]

function renderHomePage(items = products) {
  const context = {
    products: items,
    loading: false,
    error: null,
    categories: ['Furniture'],
    productCounts: { All: items.length, Furniture: items.length },
    addToCart: vi.fn(),
  }

  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Outlet context={context} />}>
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  )
}

describe('HomePage built-by footer', () => {
  it('renders the built-by footer line on the home page', () => {
    renderHomePage()
    expect(screen.getByText(FOOTER_TEXT)).toBeDefined()
  })

  it('renders the built-by footer text inside an em element', () => {
    renderHomePage()
    expect(screen.getByText(FOOTER_TEXT).tagName).toBe('EM')
  })

  it('renders the built-by footer below the product list', () => {
    renderHomePage()
    const footer = screen.getByText(FOOTER_TEXT)
    const listedProduct = screen.getByText('Victorian Oak Chair')
    const position = listedProduct.compareDocumentPosition(footer)
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
