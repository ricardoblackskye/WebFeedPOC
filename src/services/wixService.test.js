import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchWixProducts, fetchWixProduct } from '../services/wixService'

// Mock fetch
global.fetch = vi.fn()

describe('wixService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set mock environment variables
    vi.stubEnv('VITE_WIX_API_KEY', 'test-api-key')
    vi.stubEnv('VITE_WIX_SITE_ID', 'test-site-id')
  })

  describe('fetchWixProducts', () => {
    it('throws error when API credentials not configured', async () => {
      vi.stubEnv('VITE_WIX_API_KEY', '')
      vi.stubEnv('VITE_WIX_SITE_ID', '')

      await expect(fetchWixProducts()).rejects.toThrow(
        'Wix API credentials not configured'
      )
    })

    it('fetches products successfully', async () => {
      const mockResponse = {
        products: [
          {
            id: '1',
            name: 'Product 1',
            description: 'Description 1',
            price: { price: 100 },
            media: { mainMedia: { image: { url: 'https://example.com/image.jpg' } } },
            productType: 'Furniture',
            collections: ['antiques'],
          },
        ],
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const products = await fetchWixProducts()

      expect(products).toHaveLength(1)
      expect(products[0]).toEqual({
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        image: 'https://example.com/image.jpg',
        category: 'Furniture',
        collections: ['antiques'],
      })
    })

    it('handles missing image gracefully', async () => {
      const mockResponse = {
        products: [
          {
            id: '1',
            name: 'Product 1',
            description: 'Description 1',
            price: { price: 100 },
            media: null,
            productType: 'Furniture',
          },
        ],
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const products = await fetchWixProducts()

      expect(products[0].image).toBeNull()
    })

    it('throws error on failed fetch', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      })

      await expect(fetchWixProducts()).rejects.toThrow('Wix API error: Not Found')
    })
  })

  describe('fetchWixProduct', () => {
    it('fetches single product successfully', async () => {
      const mockProduct = {
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: { price: 100 },
        media: { mainMedia: { image: { url: 'https://example.com/image.jpg' } } },
        productType: 'Furniture',
        collections: [],
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct,
      })

      const product = await fetchWixProduct('1')

      expect(product).toEqual({
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        image: 'https://example.com/image.jpg',
        category: 'Furniture',
        collections: [],
      })
    })

    it('throws error when API credentials not configured', async () => {
      vi.stubEnv('VITE_WIX_API_KEY', '')

      await expect(fetchWixProduct('1')).rejects.toThrow(
        'Wix API credentials not configured'
      )
    })
  })
})
