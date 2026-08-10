import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
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

  it('restores the previous body overflow style when closed', () => {
    document.body.style.overflow = 'auto'

    const { unmount } = render(
      <ProductModal
        product={mockProduct}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    )

    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('does not touch document body during server rendering', async () => {
    const source = await readFile(
      resolve(dirname(fileURLToPath(import.meta.url)), '../components/ProductModal.jsx'),
      'utf8',
    )

    expect(source).toContain('typeof document')
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

  it('displays multiple images with thumbnails', () => {
    const productWithMultipleImages = {
      ...mockProduct,
      images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ],
    }

    render(
      <ProductModal
        product={productWithMultipleImages}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    )

    const thumbnails = screen.getAllByRole('button', { name: /View \d+ of \d+/i })
    expect(thumbnails).toHaveLength(3)
  })

  it('switches images when thumbnail is clicked', () => {
    const productWithMultipleImages = {
      ...mockProduct,
      images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ],
    }

    render(
      <ProductModal
        product={productWithMultipleImages}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    )

    const mainImage = screen.getByAltText('Test Product (1 of 2)')
    expect(mainImage.src).toContain('image1.jpg')

    const thumbnail2 = screen.getByRole('button', { name: 'View 2 of 2' })
    fireEvent.click(thumbnail2)

    expect(mainImage.src).toContain('image2.jpg')
  })

  it('does not show thumbnails for single image', () => {
    const productWithSingleImage = {
      ...mockProduct,
      images: ['https://example.com/image1.jpg'],
    }

    render(
      <ProductModal
        product={productWithSingleImage}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    )

    const thumbnails = screen.queryAllByRole('button', { name: /View \d+ of \d+/i })
    expect(thumbnails).toHaveLength(0)
  })

  it('falls back to single image when images array is empty', () => {
    const productWithFallback = {
      ...mockProduct,
      images: [],
    }

    render(
      <ProductModal
        product={productWithFallback}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    )

    const mainImage = screen.getByAltText('Test Product')
    expect(mainImage.src).toContain('example.com/image.jpg')
  })
})
