import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '../components/ProductCard'

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    image: null,
  }

  const mockAddToCart = vi.fn()
  const mockProductClick = vi.fn()

  beforeEach(() => {
    mockAddToCart.mockClear()
    mockProductClick.mockClear()
  })

  it('renders product information', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockAddToCart}
        onProductClick={mockProductClick}
      />
    )
    
    expect(screen.getByText('Test Product')).toBeDefined()
    expect(screen.getByText('Test Description')).toBeDefined()
    expect(screen.getByText('£99.99')).toBeDefined()
  })

  it('calls onAddToCart when button is clicked', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockAddToCart}
        onProductClick={mockProductClick}
      />
    )
    
    const button = screen.getByText('Add to Cart')
    fireEvent.click(button)
    
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct)
    expect(mockAddToCart).toHaveBeenCalledTimes(1)
  })

  it('calls onProductClick when card is clicked', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockAddToCart}
        onProductClick={mockProductClick}
      />
    )
    
    const card = screen.getByText('Test Product').closest('.product-card')
    fireEvent.click(card)
    
    expect(mockProductClick).toHaveBeenCalledWith(mockProduct)
  })

  it('shows placeholder when no image', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockAddToCart}
        onProductClick={mockProductClick}
      />
    )
    
    expect(screen.getByText('No Image')).toBeDefined()
  })

  it('shows View More link for long descriptions', () => {
    const longDescription = Array(60).fill('word').join(' ')
    const productWithLongDesc = { ...mockProduct, description: longDescription }

    render(
      <ProductCard 
        product={productWithLongDesc} 
        onAddToCart={mockAddToCart}
        onProductClick={mockProductClick}
      />
    )
    
    expect(screen.getByText('View More')).toBeDefined()
  })

  it('does not show View More for short descriptions', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockAddToCart}
        onProductClick={mockProductClick}
      />
    )
    
    expect(screen.queryByText('View More')).toBeNull()
  })

  it('clicking View More opens product modal', () => {
    const longDescription = Array(60).fill('word').join(' ')
    const productWithLongDesc = { ...mockProduct, description: longDescription }

    render(
      <ProductCard 
        product={productWithLongDesc} 
        onAddToCart={mockAddToCart}
        onProductClick={mockProductClick}
      />
    )
    
    const viewMoreLink = screen.getByText('View More')
    fireEvent.click(viewMoreLink)
    
    expect(mockProductClick).toHaveBeenCalledWith(productWithLongDesc)
  })
})
