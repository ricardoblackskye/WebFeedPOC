import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from './HomePage'

const CREDIT = 'Built by the Dark Factory - by the Developer Agent'

vi.mock('react-helmet-async', () => ({ Helmet: () => null }))
vi.mock('react-router-dom', () => ({
  useOutletContext: () => ({
    products: [],
    loading: false,
    error: null,
    categories: [],
    productCounts: { All: 0 },
    addToCart: vi.fn(),
  }),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}))
vi.mock('../components/ProductList', () => ({ default: () => null }))
vi.mock('../components/ProductModal', () => ({ default: () => null }))
vi.mock('../components/CategoryFilter', () => ({ default: () => null }))
vi.mock('../components/SortControls', () => ({ default: () => null }))
vi.mock('../components/Pagination', () => ({ default: () => null }))
vi.mock('../utils/structuredData', () => ({ generateItemListSchema: vi.fn() }))

describe('HomePage', () => {
  it('renders the Dark Factory credit line on the home page', () => {
    render(<HomePage />)
    expect(screen.getByText(CREDIT)).toBeDefined()
  })

  it('renders the Dark Factory credit line in italics', () => {
    render(<HomePage />)
    expect(screen.getByText(CREDIT).tagName).toBe('EM')
  })

  it('keeps the existing home page structure intact', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { level: 2 }).textContent).toContain('All Items')
    expect(screen.getByText('No products available')).toBeDefined()
  })
})
