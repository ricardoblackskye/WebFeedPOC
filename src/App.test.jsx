import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import HomePage from './pages/HomePage'
import * as wixHook from './hooks/useWixProducts'

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve(null)),
}))

function renderApp(initialEntries = ['/']) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  )
}

describe('App Integration Tests', () => {
  it('renders main components', () => {
    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null,
    })

    renderApp()

    expect(screen.getByText('Antiques Marketplace')).toBeDefined()
    expect(screen.getByText('Discover unique treasures from the past')).toBeDefined()
    expect(screen.getByText('Shopping Cart')).toBeDefined()
  })

  it('displays products from hook', () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product',
        slug: 'test-product',
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

    renderApp()

    expect(screen.getByText('Test Product')).toBeDefined()
  })

  it('adds product to cart', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product',
        slug: 'test-product',
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

    renderApp()

    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)

    await waitFor(() => {
      const cart = screen.getByText('Shopping Cart').closest('.cart')
      expect(cart.textContent).toContain('Test Product')
      expect(cart.textContent).toContain('£100.00')
    })
  })

  it('filters products by category', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Furniture Item',
        slug: 'furniture-item',
        description: 'A chair',
        price: 100,
        image: null,
        category: 'Furniture',
      },
      {
        id: '2',
        name: 'Lighting Item',
        slug: 'lighting-item',
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

    renderApp()

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

    renderApp()

    expect(screen.getByText('Loading products...')).toBeDefined()
  })

  it('displays error message', () => {
    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: [],
      loading: false,
      error: 'API Error',
    })

    renderApp()

    expect(screen.getByText('Using demo products (Wix not configured)')).toBeDefined()
  })

  it('updates cart quantity', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product',
        slug: 'test-product',
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

    renderApp()

    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)

    await waitFor(() => {
      const cart = screen.getByText('Shopping Cart').closest('.cart')
      const quantityElement = cart.querySelector('.quantity')
      expect(quantityElement.textContent).toBe('1')
    })

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
        slug: 'test-product',
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

    renderApp()

    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Remove')).toBeDefined()
    })

    const removeButton = screen.getByText('Remove')
    fireEvent.click(removeButton)

    await waitFor(() => {
      expect(screen.getByText('Your cart is empty')).toBeDefined()
    })
  })

  it('renders footer', () => {
    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null,
    })

    renderApp()

    expect(screen.getByText(/All rights reserved/)).toBeDefined()
  })
})
