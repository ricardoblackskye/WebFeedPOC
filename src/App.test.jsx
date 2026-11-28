import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { renderToString } from 'react-dom/server'
import App from './App'
import HomePage from './pages/HomePage'
import * as wixHook from './hooks/useWixProducts'
import * as cartHook from './hooks/useWixCart'

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

function renderAppShell(path = '/') {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="*" element={<App />} />
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

  it('nav-toggle collapses and expands the primary nav', () => {
    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null,
    })

    renderApp()

    const toggle = screen.getByRole('button', { name: /toggle navigation menu/i })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
  })
})

describe('Cart drawer controls', () => {
  it('renders a cart toggle button collapsed (aria-expanded false) by default', () => {
    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null,
    })

    renderApp()

    const cartToggle = screen.getByRole('button', { name: /^cart/i })
    expect(cartToggle.getAttribute('aria-expanded')).toBe('false')
  })

  it('cart badge reflects the number of items in the cart', async () => {
    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null,
    })
    localStorage.setItem(
      'antiques_cart',
      JSON.stringify([{ id: '1', name: 'A', price: 10, quantity: 2, category: 'x' }])
    )

    renderApp()

    await waitFor(() => {
      const badge = document.querySelector('.cart-badge')
      expect(badge).not.toBeNull()
      expect(badge.textContent).toBe('2')
    })
  })

  it('toggles the cart drawer open and closed via the header button', () => {
    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null,
    })

    renderApp()

    const cartToggle = screen.getByRole('button', { name: /^cart/i })
    expect(cartToggle.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(cartToggle)
    expect(cartToggle.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(cartToggle)
    expect(cartToggle.getAttribute('aria-expanded')).toBe('false')
  })

  it('closes the cart drawer when Escape is pressed', () => {
    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null,
    })

    renderApp()

    const cartToggle = screen.getByRole('button', { name: /^cart/i })
    fireEvent.click(cartToggle)
    expect(cartToggle.getAttribute('aria-expanded')).toBe('true')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(cartToggle.getAttribute('aria-expanded')).toBe('false')
  })
})

describe('Dark Factory footer credit', () => {
  const CREDIT = 'This is Built by the Dark Factory - by the Developer Agent'

  const mockEmptyData = () => {
    vi.restoreAllMocks()
    vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null,
      refreshing: false,
    })
    vi.spyOn(cartHook, 'useWixCart').mockReturnValue({
      cart: [],
      loading: false,
      error: null,
      useWixBackend: false,
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      updateQuantity: vi.fn(),
      totals: { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 },
    })
  }

  it('renders the Dark Factory credit in the footer', () => {
    mockEmptyData()
    const { container } = renderApp()
    const footer = container.querySelector('footer.app-footer')
    expect(footer).not.toBeNull()
    expect(footer.textContent).toContain(CREDIT)
  })

  it('renders the credit in italics via an <em> element', () => {
    mockEmptyData()
    const { container } = renderApp()
    const credit = container.querySelector('footer.app-footer em')
    expect(credit).not.toBeNull()
    expect(credit.textContent).toBe(CREDIT)
  })

  it('places the credit next to the copyright text and adds no other footer content', () => {
    mockEmptyData()
    const { container } = renderApp()
    const footer = container.querySelector('footer.app-footer')
    expect(footer.querySelectorAll('p')).toHaveLength(1)
    const line = footer.querySelector('p')
    expect(line.textContent).toMatch(/All rights reserved\.\s+This is Built by the Dark Factory - by the Developer Agent$/)
  })

  it('renders the credit in server-rendered HTML', () => {
    mockEmptyData()
    const html = renderToString(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </HelmetProvider>
    )
    expect(html).toContain(CREDIT)
  })

  it('renders the credit exactly once on a non-home route', () => {
    mockEmptyData()
    renderAppShell('/products/vase')
    expect(screen.getAllByText(CREDIT)).toHaveLength(1)
  })
})
