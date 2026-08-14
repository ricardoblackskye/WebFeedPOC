import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useWixCart } from './useWixCart'
import * as wixCartService from '../services/wixCartService'
import { createProductFixture, createWixCartFixture, createWixCartLineItemFixture } from '../test-utils/copyPasteHelpers'

// Mock the wixCartService
vi.mock('../services/wixCartService', () => ({
  getCurrentCart: vi.fn(),
  addToWixCart: vi.fn(),
  updateCartItemQuantity: vi.fn(),
  removeFromWixCart: vi.fn(),
  clearWixCart: vi.fn(),
  transformWixCart: vi.fn(),
  getCartTotals: vi.fn()
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

describe('useWixCart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('initialization', () => {
    it('loads cart from localStorage when Wix cart unavailable', async () => {
      const storedCart = [createProductFixture({ id: '1', quantity: 1 })]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedCart))
      wixCartService.getCurrentCart.mockResolvedValue(null)

      const { result } = renderHook(() => useWixCart())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.cart).toEqual(storedCart)
      expect(result.current.useWixBackend).toBe(false)
    })

    it('loads cart from Wix when available', async () => {
      const wixCart = createWixCartFixture({
        lineItems: [createWixCartLineItemFixture({
          _id: 'line1',
          catalogReference: { catalogItemId: '1' }
        })]
      })
      const transformedCart = [createProductFixture({ id: '1', lineItemId: 'line1', quantity: 1 })]

      wixCartService.getCurrentCart.mockResolvedValue(wixCart)
      wixCartService.transformWixCart.mockReturnValue(transformedCart)

      const { result } = renderHook(() => useWixCart())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.cart).toEqual(transformedCart)
      expect(result.current.useWixBackend).toBe(true)
    })

    it('handles Wix cart errors gracefully', async () => {
      wixCartService.getCurrentCart.mockRejectedValue(new Error('Wix error'))
      localStorageMock.getItem.mockReturnValue('[]')

      const { result } = renderHook(() => useWixCart())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.useWixBackend).toBe(false)
      expect(result.current.cart).toEqual([])
    })
  })

  describe('addToCart', () => {
    it('adds product to local cart', async () => {
      wixCartService.getCurrentCart.mockResolvedValue(null)
      localStorageMock.getItem.mockReturnValue('[]')

      const { result } = renderHook(() => useWixCart())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const product = { id: '1', name: 'Test Product', price: 100 }

      await act(async () => {
        await result.current.addToCart(product)
      })

      expect(result.current.cart).toHaveLength(1)
      expect(result.current.cart[0]).toMatchObject({
        id: '1',
        name: 'Test Product',
        price: 100,
        quantity: 1
      })
    })

    it('increments quantity for existing product', async () => {
      const existingCart = [createProductFixture({ id: '1', quantity: 1 })]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingCart))
      wixCartService.getCurrentCart.mockResolvedValue(null)

      const { result } = renderHook(() => useWixCart())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const product = { id: '1', name: 'Test Product', price: 100 }

      await act(async () => {
        await result.current.addToCart(product)
      })

      expect(result.current.cart).toHaveLength(1)
      expect(result.current.cart[0].quantity).toBe(2)
    })

    it('uses Wix cart API when backend available', async () => {
      const wixCart = createWixCartFixture()
      const updatedWixCart = createWixCartFixture({
        lineItems: [createWixCartLineItemFixture({
          _id: 'line1',
          catalogReference: { catalogItemId: '1' }
        })]
      })
      const transformedCart = [createProductFixture({ id: '1', lineItemId: 'line1', quantity: 1 })]

      wixCartService.getCurrentCart.mockResolvedValue(wixCart)
      wixCartService.addToWixCart.mockResolvedValue(updatedWixCart)
      wixCartService.transformWixCart
        .mockReturnValueOnce([])
        .mockReturnValueOnce(transformedCart)

      const { result } = renderHook(() => useWixCart())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const product = { id: '1', name: 'Test Product', price: 100 }

      await act(async () => {
        await result.current.addToCart(product)
      })

      expect(wixCartService.addToWixCart).toHaveBeenCalledWith('1', 1)
      expect(result.current.cart).toEqual(transformedCart)
    })
  })

  describe('updateQuantity', () => {
    it('updates quantity in local cart', async () => {
      const existingCart = [createProductFixture({ id: '1', quantity: 1 })]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingCart))
      wixCartService.getCurrentCart.mockResolvedValue(null)

      const { result } = renderHook(() => useWixCart())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.updateQuantity('1', 5)
      })

      expect(result.current.cart[0].quantity).toBe(5)
    })

    it('removes item when quantity is 0', async () => {
      const existingCart = [createProductFixture({ id: '1', quantity: 1 })]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingCart))
      wixCartService.getCurrentCart.mockResolvedValue(null)

      const { result } = renderHook(() => useWixCart())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.updateQuantity('1', 0)
      })

      expect(result.current.cart).toHaveLength(0)
    })
  })

  describe('removeFromCart', () => {
    it('removes product from local cart', async () => {
      const existingCart = [
        { id: '1', name: 'Product 1', price: 100, quantity: 1 },
        { id: '2', name: 'Product 2', price: 200, quantity: 1 }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingCart))
      wixCartService.getCurrentCart.mockResolvedValue(null)

      const { result } = renderHook(() => useWixCart())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.removeFromCart('1')
      })

      expect(result.current.cart).toHaveLength(1)
      expect(result.current.cart[0].id).toBe('2')
    })
  })

  describe('totals', () => {
    it('calculates totals from local cart', async () => {
      const existingCart = [
        { id: '1', name: 'Product 1', price: 100, quantity: 2 },
        { id: '2', name: 'Product 2', price: 50, quantity: 1 }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingCart))
      wixCartService.getCurrentCart.mockResolvedValue(null)

      const { result } = renderHook(() => useWixCart())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.totals.subtotal).toBe(250)
      expect(result.current.totals.total).toBe(250)
      expect(result.current.totals.tax).toBe(0)
    })

    it('uses Wix cart totals when available', async () => {
      const wixCart = {
        lineItems: [],
        subtotal: { amount: 250 },
        taxSummary: { totalTax: { amount: 25 } },
        totals: { total: { amount: 275 } }
      }
      const wixTotals = {
        subtotal: 250,
        tax: 25,
        shipping: 0,
        discount: 0,
        total: 275
      }

      wixCartService.getCurrentCart.mockResolvedValue(wixCart)
      wixCartService.transformWixCart.mockReturnValue([])
      wixCartService.getCartTotals.mockReturnValue(wixTotals)

      const { result } = renderHook(() => useWixCart())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.totals).toEqual(wixTotals)
    })
  })

  describe('clearCart', () => {
    it('clears cart and localStorage', async () => {
      const existingCart = [createProductFixture({ id: '1', quantity: 1 })]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingCart))
      wixCartService.getCurrentCart.mockResolvedValue(null)

      const { result } = renderHook(() => useWixCart())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        result.current.clearCart()
      })

      expect(result.current.cart).toHaveLength(0)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('antiques_cart')
    })
  })
})
