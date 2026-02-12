import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCheckoutSession, formatPriceForStripe } from '../services/stripeService'

// Mock fetch
global.fetch = vi.fn()

describe('stripeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCheckoutSession', () => {
    it('creates checkout session successfully', async () => {
      const mockSession = { id: 'session_123' }
      const items = [
        { name: 'Product 1', price: 100, quantity: 2 },
        { name: 'Product 2', price: 50, quantity: 1 },
      ]

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      })

      const session = await createCheckoutSession(items)

      expect(session).toEqual(mockSession)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/create-checkout-session',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [
              { name: 'Product 1', price: 100, quantity: 2 },
              { name: 'Product 2', price: 50, quantity: 1 },
            ],
          }),
        })
      )
    })

    it('throws error on failed request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      })

      await expect(createCheckoutSession([])).rejects.toThrow(
        'Failed to create checkout session'
      )
    })

    it('handles network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(createCheckoutSession([])).rejects.toThrow('Network error')
    })
  })

  describe('formatPriceForStripe', () => {
    it('converts dollars to cents correctly', () => {
      expect(formatPriceForStripe(10)).toBe(1000)
      expect(formatPriceForStripe(99.99)).toBe(9999)
      expect(formatPriceForStripe(0.50)).toBe(50)
    })

    it('handles zero', () => {
      expect(formatPriceForStripe(0)).toBe(0)
    })

    it('rounds to nearest cent', () => {
      expect(formatPriceForStripe(10.999)).toBe(1100)
      expect(formatPriceForStripe(10.001)).toBe(1000)
    })

    it('handles large amounts', () => {
      expect(formatPriceForStripe(1000000)).toBe(100000000)
    })
  })
})
