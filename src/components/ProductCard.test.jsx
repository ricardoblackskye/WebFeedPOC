import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductCard from '../components/ProductCard'

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
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

  const renderCard = (product = mockProduct) => {
    return render(
      <MemoryRouter>
        <ProductCard 
          product={product} 
          onAddToCart={mockAddToCart}
          onProductClick={mockProductClick}
        />
      </MemoryRouter>
    )
  }

  it('renders product information', () => {
    renderCard()
    
    expect(screen.getByText('Test Product')).toBeDefined()
    expect(screen.getByText('Test Description')).toBeDefined()
    expect(screen.getByText('£99.99')).toBeDefined()
  })

  it('calls onAddToCart when button is clicked', () => {
    renderCard()
    
    const button = screen.getByText('Add to Cart')
    fireEvent.click(button)
    
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct)
    expect(mockAddToCart).toHaveBeenCalledTimes(1)
  })

  it('calls onProductClick when card is clicked', () => {
    renderCard()
    
    const card = screen.getByText('Test Product').closest('.product-card')
    fireEvent.click(card)
    
    expect(mockProductClick).toHaveBeenCalledWith(mockProduct)
  })

  it('shows placeholder when no image', () => {
    renderCard()
    
    expect(screen.getByText('No Image')).toBeDefined()
  })

  it('shows View More link for long descriptions', () => {
    const longDescription = Array(60).fill('word').join(' ')
    const productWithLongDesc = { ...mockProduct, description: longDescription }

    renderCard(productWithLongDesc)
    
    expect(screen.getByText('View More')).toBeDefined()
  })

  it('does not show View More for short descriptions', () => {
    renderCard()
    
    expect(screen.queryByText('View More')).toBeNull()
  })

  it('renders as article element', () => {
    const { container } = renderCard()
    
    const article = container.querySelector('article.product-card')
    expect(article).toBeDefined()
    expect(article).not.toBeNull()
  })
})
