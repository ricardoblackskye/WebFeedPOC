import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductModal from '../components/ProductModal'

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve(null)),
}))

describe('ProductModal', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    description: 'Test description',
    price: 99.99,
    image: 'https://example.com/image.jpg',
    sku: 'TEST-001',
    condition: 'Excellent',
    era: 'Victorian',
    dimensions: '10" x 5"',
    material: 'Oak wood',
    category: 'Furniture',
  }

  const mockOnClose = vi.fn()
  const mockOnAddToCart = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnAddToCart.mockClear()
  })

  afterEach(() => {
    document.body.style.overflow = 'unset'
  })

  it('renders product information correctly', () => {
    render(
      <ProductModal
        product={mockProduct}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    )

    expect(screen.getByText('Test Product')).toBeDefined()
    expect(screen.getByText('Test description')).toBeDefined()
    expect(screen.getByText('£99.99')).toBeDefined()
    expect(screen.getByText('TEST-001')).toBeDefined()
    expect(screen.getByText('Excellent')).toBeDefined()
    expect(screen.getByText('Victorian')).toBeDefined()
    expect(screen.getByText('10" x 5"')).toBeDefined()
    expect(screen.getByText('Oak wood')).toBeDefined()
    expect(screen.getByText('Furniture')).toBeDefined()
  })

  it('calls onClose when close button clicked', () => {
    render(
      <ProductModal
        product={mockProduct}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    )

    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop clicked', () => {
    render(
      <ProductModal
        product={mockProduct}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    )

    const backdrop = document.querySelector('.modal-backdrop')
    fireEvent.click(backdrop)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when modal content clicked', () => {
    render(
      <ProductModal
        product={mockProduct}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    )

    const modalContent = document.querySelector('.modal-content')
    fireEvent.click(modalContent)

    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('calls onAddToCart and closes modal when Add to Cart clicked', () => {
    render(
      <ProductModal
        product={mockProduct}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    )

    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)

    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('returns null when no product provided', () => {
    const { container } = render(
      <ProductModal
        product={null}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('shows placeholder when no image', () => {
    const productNoImage = { ...mockProduct, image: null }

    render(
      <ProductModal
        product={productNoImage}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    )

    expect(screen.getByText('No Image Available')).toBeDefined()
  })

  it('only shows fields that exist', () => {
    const minimalProduct = {
      id: '1',
      name: 'Minimal Product',
      description: 'Description',
      price: 50,
      image: null,
    }

    render(
      <ProductModal
        product={minimalProduct}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    )

    expect(screen.getByText('Minimal Product')).toBeDefined()
    expect(screen.queryByText('SKU:')).toBeNull()
    expect(screen.queryByText('Condition:')).toBeNull()
  })
})
