import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchWixProducts, fetchWixProduct } from '../services/wixService'

// Mock the Wix SDK modules
const mockFind = vi.fn()
const mockLimit = vi.fn(() => ({ find: mockFind }))
const mockQueryProducts = vi.fn(() => ({ limit: mockLimit }))
const mockGetProduct = vi.fn()

vi.mock('@wix/sdk', () => ({
  createClient: vi.fn(() => ({
    products: {
      queryProducts: mockQueryProducts,
      getProduct: mockGetProduct,
    },
  })),
  OAuthStrategy: vi.fn((config) => config),
}))

vi.mock('@wix/stores', () => ({
  products: {},
}))

describe('wixService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_WIX_CLIENT_ID', 'test-client-id')
  })

  describe('fetchWixProducts', () => {
    it('throws error when API credentials not configured', async () => {
      vi.stubEnv('VITE_WIX_CLIENT_ID', '')

      await expect(fetchWixProducts()).rejects.toThrow(
        'Wix API credentials not configured'
      )
    })

    it('fetches products successfully', async () => {
      mockFind.mockResolvedValueOnce({
        items: [
          {
            _id: '1',
            name: 'Product 1',
            description: 'Description 1',
            price: { price: 100 },
            media: { mainMedia: { image: { url: 'https://example.com/image.jpg' } } },
            productType: 'Furniture',
            collectionIds: ['antiques'],
            sku: 'SKU-001',
          },
        ],
        hasNext: () => false,
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
        sku: 'SKU-001',
      })
    })

    it('handles missing image gracefully', async () => {
      mockFind.mockResolvedValueOnce({
        items: [
          {
            _id: '1',
            name: 'Product 1',
            description: 'Description 1',
            price: { price: 100 },
            media: null,
            productType: 'Furniture',
            collectionIds: [],
            sku: null,
          },
        ],
        hasNext: () => false,
      })

      const products = await fetchWixProducts()

      expect(products[0].image).toBeNull()
    })

    it('throws error on SDK failure', async () => {
      mockFind.mockRejectedValueOnce(new Error('SDK error'))

      await expect(fetchWixProducts()).rejects.toThrow('SDK error')
    })

    it('paginates through all results', async () => {
      const page2 = {
        items: [{ _id: '2', name: 'Product 2', description: '', price: { price: 200 }, media: null, productType: 'Art', collectionIds: [], sku: null }],
        hasNext: () => false,
      }

      mockFind.mockResolvedValueOnce({
        items: [{ _id: '1', name: 'Product 1', description: '', price: { price: 100 }, media: null, productType: 'Furniture', collectionIds: [], sku: null }],
        hasNext: () => true,
        next: vi.fn().mockResolvedValueOnce(page2),
      })

      const products = await fetchWixProducts()

      expect(products).toHaveLength(2)
      expect(products[0].id).toBe('1')
      expect(products[1].id).toBe('2')
    })
  })

  describe('fetchWixProduct', () => {
    it('fetches single product successfully', async () => {
      mockGetProduct.mockResolvedValueOnce({
        _id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: { price: 100 },
        media: { mainMedia: { image: { url: 'https://example.com/image.jpg' } } },
        productType: 'Furniture',
        collectionIds: [],
        sku: 'SKU-001',
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
        sku: 'SKU-001',
      })
    })

    it('throws error when API credentials not configured', async () => {
      vi.stubEnv('VITE_WIX_CLIENT_ID', '')

      await expect(fetchWixProduct('1')).rejects.toThrow(
        'Wix API credentials not configured'
      )
    })
  })
})
