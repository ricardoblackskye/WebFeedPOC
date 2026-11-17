import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductList from '../components/ProductList'

const CREDIT_TEXT = 'Built by the Dark Factory - by the Developer Agent'

describe('ProductList', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Product 1',
      slug: 'product-1',
      description: 'Description 1',
      price: 100,
      image: 'https://example.com/image1.jpg',
      category: 'Category A',
    },
    {
      id: '2',
      name: 'Product 2',
      slug: 'product-2',
      description: 'Description 2',
      price: 200,
      image: null,
      category: 'Category B',
    },
  ]

  const mockAddToCart = vi.fn()

  beforeEach(() => {
    mockAddToCart.mockClear()
  })

  const renderList = (products = mockProducts) => {
    return render(
      <MemoryRouter>
        <ProductList
          products={products}
          onAddToCart={mockAddToCart}
        />
      </MemoryRouter>
    )
  }

  it('renders all products', () => {
    renderList()

    expect(screen.getByText('Product 1')).toBeDefined()
    expect(screen.getByText('Product 2')).toBeDefined()
  })

  it('renders empty list when no products', () => {
    const { container } = renderList([])

    const productList = container.querySelector('.product-list')
    expect(productList.children.length).toBe(0)
  })

  it('passes correct props to ProductCard', () => {
    renderList()

    const addToCartButtons = screen.getAllByText('Add to Cart')
    expect(addToCartButtons.length).toBe(2)
  })

  it('renders the Dark Factory credit line with the exact required text', () => {
    renderList()

    expect(screen.getByText(CREDIT_TEXT)).toBeDefined()
  })

  it('renders the credit line as italic emphasis (<em>)', () => {
    renderList()

    const credit = screen.getByText(CREDIT_TEXT)
    expect(credit.tagName).toBe('EM')
  })

  it('renders the credit line after the last product card', () => {
    const { container } = renderList()

    const credit = screen.getByText(CREDIT_TEXT)
    const cards = container.querySelectorAll('.product-card')
    expect(cards.length).toBeGreaterThan(0)
    const lastCard = cards[cards.length - 1]
    expect(lastCard.compareDocumentPosition(credit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders exactly one credit line for a multi-product list', () => {
    renderList()

    expect(screen.getAllByText(CREDIT_TEXT)).toHaveLength(1)
  })

  it('still renders every product in the list (regression)', () => {
    renderList()

    mockProducts.forEach(product => expect(screen.getByText(product.name)).toBeDefined())
  })
})
