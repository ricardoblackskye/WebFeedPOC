import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductList from '../components/ProductList'

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
  const mockProductClick = vi.fn()

  beforeEach(() => {
    mockAddToCart.mockClear()
    mockProductClick.mockClear()
  })

  const renderList = (products = mockProducts) => {
    return render(
      <MemoryRouter>
        <ProductList
          products={products}
          onAddToCart={mockAddToCart}
          onProductClick={mockProductClick}
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
})
