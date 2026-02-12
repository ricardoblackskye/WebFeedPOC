import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductList from '../components/ProductList'

describe('ProductList', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Product 1',
      description: 'Description 1',
      price: 100,
      image: 'https://example.com/image1.jpg',
      category: 'Category A',
    },
    {
      id: '2',
      name: 'Product 2',
      description: 'Description 2',
      price: 200,
      image: null,
      category: 'Category B',
    },
  ]

  const mockAddToCart = vi.fn()
  const mockProductClick = vi.fn()

  beforeEach(() => {
    mockAddToCart.mockClear()
    mockProductClick.mockClear()
  })

  it('renders all products', () => {
    render(
      <ProductList
        products={mockProducts}
        onAddToCart={mockAddToCart}
        onProductClick={mockProductClick}
      />
    )

    expect(screen.getByText('Product 1')).toBeDefined()
    expect(screen.getByText('Product 2')).toBeDefined()
  })

  it('renders empty list when no products', () => {
    const { container } = render(
      <ProductList
        products={[]}
        onAddToCart={mockAddToCart}
        onProductClick={mockProductClick}
      />
    )

    const productList = container.querySelector('.product-list')
    expect(productList.children.length).toBe(0)
  })

  it('passes correct props to ProductCard', () => {
    render(
      <ProductList
        products={mockProducts}
        onAddToCart={mockAddToCart}
        onProductClick={mockProductClick}
      />
    )

    const addToCartButtons = screen.getAllByText('Add to Cart')
    expect(addToCartButtons.length).toBe(2)
  })
})
