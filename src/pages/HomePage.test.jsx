import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import HomePage from './HomePage'

vi.mock('react-router-dom', () => ({ useOutletContext: vi.fn(), useSearchParams: vi.fn() }))
vi.mock('../components/ProductList', () => ({ default: () => <div data-testid='product-list' /> }))
vi.mock('../components/ProductModal', () => ({ default: () => null }))
vi.mock('../components/CategoryFilter', () => ({ default: () => null }))
vi.mock('../components/SortControls', () => ({ default: () => null }))
vi.mock('../components/Pagination', () => ({ default: () => null }))
vi.mock('react-helmet-async', () => ({ Helmet: ({ children }) => <>{children}</> }))
vi.mock('../utils/structuredData', () => ({ generateItemListSchema: () => null }))

const ATTRIBUTION = 'Built by the Dark Factory - by the Developer Agent'

describe('HomePage footer attribution', () => {
  beforeEach(() => {
    useOutletContext.mockReturnValue({
      products: [{ id: '1', name: 'Vase', price: 10, category: 'Ceramics' }],
      loading: false,
      error: null,
      categories: ['Ceramics'],
      productCounts: { All: 1, Ceramics: 1 },
      addToCart: vi.fn(),
    })
    useSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()])
  })

  it('renders the Dark Factory attribution line in the home page footer', () => {
    render(<HomePage />)
    expect(screen.getByText(ATTRIBUTION)).toBeDefined()
  })

  it('renders the attribution line inside an <em> element', () => {
    render(<HomePage />)
    expect(screen.getByText(ATTRIBUTION).tagName).toBe('EM')
  })

  it('leaves the existing home page content unchanged beside the new line', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { name: /All Items/ })).toBeDefined()
    expect(screen.getByTestId('product-list')).toBeDefined()
  })
})
