import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'
import * as wixHook from './hooks/useWixProducts'

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve(null)),
}))

describe('App Integration Tests', () => {
  it('renders main components', () => {
    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null,
    })

    render(<App />)

    expect(screen.getByText('Antiques Marketplace')).toBeDefined()
    expect(screen.getByText('Discover unique treasures from the past')).toBeDefined()
    expect(screen.getByText('Shopping Cart')).toBeDefined()
  })

  it('displays products from hook', () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product',
        description: 'Test description',
        price: 100,
        image: null,
        category: 'Test Category',
      },
    ]

    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
    })

    render(<App />)

    expect(screen.getByText('Test Product')).toBeDefined()
  })

  it('adds product to cart', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product',
        description: 'Test description',
        price: 100,
        image: null,
        category: 'Test Category',
      },
    ]

    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
    })

    render(<App />)

    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)

    await waitFor(() => {
      // Check that the cart section contains the product
      const cart = screen.getByText('Shopping Cart').closest('.cart')
      expect(cart.textContent).toContain('Test Product')
      expect(cart.textContent).toContain('£100.00')
    })
  })

  it('opens modal when product clicked', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product',
        description: 'Test description',
        price: 100,
        image: null,
        category: 'Test Category',
        sku: 'TEST-001',
      },
    ]

    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
    })

    render(<App />)

    const productCard = screen.getByText('Test Product').closest('.product-card')
    fireEvent.click(productCard)

    await waitFor(() => {
      expect(screen.getByText('TEST-001')).toBeDefined()
    })
  })

  it('filters products by category', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Furniture Item',
        description: 'A chair',
        price: 100,
        image: null,
        category: 'Furniture',
      },
      {
        id: '2',
        name: 'Lighting Item',
        description: 'A lamp',
        price: 50,
        image: null,
        category: 'Lighting',
      },
    ]

    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
    })

    render(<App />)

    // Initially shows all products
    expect(screen.getByText('Furniture Item')).toBeDefined()
    expect(screen.getByText('Lighting Item')).toBeDefined()

    // Click Furniture category
    const furnitureButton = screen.getByText('Furniture')
    fireEvent.click(furnitureButton)

    await waitFor(() => {
      expect(screen.getByText('Furniture Item')).toBeDefined()
      expect(screen.queryByText('Lighting Item')).toBeNull()
    })
  })

  it('displays loading state', () => {
    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: [],
      loading: true,
      error: null,
    })

    render(<App />)

    expect(screen.getByText('Loading products...')).toBeDefined()
  })

  it('displays error message', () => {
    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: [],
      loading: false,
      error: 'API Error',
    })

    render(<App />)

    expect(screen.getByText('Using demo products (Wix not configured)')).toBeDefined()
  })

  it('updates cart quantity', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product',
        description: 'Test description',
        price: 100,
        image: null,
        category: 'Test Category',
      },
    ]

    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
    })

    render(<App />)

    // Add to cart
    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)

    await waitFor(() => {
      const cart = screen.getByText('Shopping Cart').closest('.cart')
      const quantityElement = cart.querySelector('.quantity')
      expect(quantityElement.textContent).toBe('1')
    })

    // Increase quantity
    const plusButton = screen.getByText('+')
    fireEvent.click(plusButton)

    await waitFor(() => {
      const cart = screen.getByText('Shopping Cart').closest('.cart')
      const quantityElement = cart.querySelector('.quantity')
      expect(quantityElement.textContent).toBe('2')
    })
  })

  it('removes item from cart', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product',
        description: 'Test description',
        price: 100,
        image: null,
        category: 'Test Category',
      },
    ]

    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
    })

    render(<App />)

    // Add to cart
    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Remove')).toBeDefined()
    })

    // Remove from cart
    const removeButton = screen.getByText('Remove')
    fireEvent.click(removeButton)

    await waitFor(() => {
      expect(screen.getByText('Your cart is empty')).toBeDefined()
    })
  })
})
