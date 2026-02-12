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

  beforeEach(() => {
    mockAddToCart.mockClear()
  })

  it('renders product information', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />)
    
    expect(screen.getByText('Test Product')).toBeDefined()
    expect(screen.getByText('Test Description')).toBeDefined()
    expect(screen.getByText('$99.99')).toBeDefined()
  })

  it('calls onAddToCart when button is clicked', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />)
    
    const button = screen.getByText('Add to Cart')
    fireEvent.click(button)
    
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct)
    expect(mockAddToCart).toHaveBeenCalledTimes(1)
  })

  it('shows placeholder when no image', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />)
    
    expect(screen.getByText('No Image')).toBeDefined()
  })
})
