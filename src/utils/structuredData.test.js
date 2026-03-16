import { describe, it, expect } from 'vitest'
import {
  generateProductSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  SITE_NAME,
  SITE_URL,
} from '../utils/structuredData'

describe('structuredData', () => {
  const mockProduct = {
    id: '1',
    name: 'Victorian Chair',
    slug: 'victorian-chair',
    description: '<p>A beautiful Victorian chair</p>',
    price: 250,
    image: 'https://example.com/chair.jpg',
    images: ['https://example.com/chair1.jpg', 'https://example.com/chair2.jpg'],
    category: 'Furniture',
    sku: 'VC-001',
    stock: {
      trackInventory: true,
      quantity: 10,
      inStock: true,
    },
  }

  describe('generateProductSchema', () => {
    it('generates valid Product schema', () => {
      const schema = generateProductSchema(mockProduct)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('Product')
      expect(schema.name).toBe('Victorian Chair')
      expect(schema.description).toBe('A beautiful Victorian chair')
      expect(schema.sku).toBe('VC-001')
      expect(schema.category).toBe('Furniture')
      expect(schema.image).toEqual([
        'https://example.com/chair1.jpg',
        'https://example.com/chair2.jpg',
      ])
      expect(schema.url).toBe(`${SITE_URL}/products/victorian-chair`)
    })

    it('includes correct offers', () => {
      const schema = generateProductSchema(mockProduct)

      expect(schema.offers['@type']).toBe('Offer')
      expect(schema.offers.price).toBe(250)
      expect(schema.offers.priceCurrency).toBe('GBP')
      expect(schema.offers.availability).toBe('https://schema.org/InStock')
    })

    it('returns null for null product', () => {
      expect(generateProductSchema(null)).toBeNull()
    })

    it('falls back to main image when no images array', () => {
      const product = { ...mockProduct, images: [] }
      const schema = generateProductSchema(product)

      expect(schema.image).toEqual(['https://example.com/chair.jpg'])
    })

    it('omits undefined fields', () => {
      const product = { ...mockProduct, sku: null, category: null, images: [], image: null }
      const schema = generateProductSchema(product)

      expect(schema.sku).toBeUndefined()
      expect(schema.category).toBeUndefined()
      expect(schema.image).toBeUndefined()
    })

    it('shows InStock for products without inventory tracking', () => {
      const product = {
        ...mockProduct,
        stock: {
          trackInventory: false,
          quantity: 0,
          inStock: true,
        },
      }
      const schema = generateProductSchema(product)

      expect(schema.offers.availability).toBe('https://schema.org/InStock')
    })

    it('shows OutOfStock for products with zero quantity', () => {
      const product = {
        ...mockProduct,
        stock: {
          trackInventory: true,
          quantity: 0,
          inStock: false,
        },
      }
      const schema = generateProductSchema(product)

      expect(schema.offers.availability).toBe('https://schema.org/OutOfStock')
    })

    it('shows LimitedAvailability for products with low stock (<=5)', () => {
      const product = {
        ...mockProduct,
        stock: {
          trackInventory: true,
          quantity: 3,
          inStock: true,
        },
      }
      const schema = generateProductSchema(product)

      expect(schema.offers.availability).toBe('https://schema.org/LimitedAvailability')
    })

    it('shows InStock for products with sufficient stock', () => {
      const product = {
        ...mockProduct,
        stock: {
          trackInventory: true,
          quantity: 10,
          inStock: true,
        },
      }
      const schema = generateProductSchema(product)

      expect(schema.offers.availability).toBe('https://schema.org/InStock')
    })

    it('defaults to InStock when stock data is missing', () => {
      const product = { ...mockProduct }
      delete product.stock
      const schema = generateProductSchema(product)

      expect(schema.offers.availability).toBe('https://schema.org/InStock')
    })
  })

  describe('generateOrganizationSchema', () => {
    it('generates valid Organization schema', () => {
      const schema = generateOrganizationSchema()

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('Organization')
      expect(schema.name).toBe(SITE_NAME)
      expect(schema.url).toBe(SITE_URL)
      expect(schema.description).toBeDefined()
    })
  })

  describe('generateWebSiteSchema', () => {
    it('generates valid WebSite schema', () => {
      const schema = generateWebSiteSchema()

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('WebSite')
      expect(schema.name).toBe(SITE_NAME)
      expect(schema.url).toBe(SITE_URL)
    })

    it('includes SearchAction', () => {
      const schema = generateWebSiteSchema()

      expect(schema.potentialAction['@type']).toBe('SearchAction')
      expect(schema.potentialAction.target).toContain('{search_term_string}')
    })
  })

  describe('generateBreadcrumbSchema', () => {
    it('generates valid BreadcrumbList', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Furniture', url: '/category/Furniture' },
        { name: 'Victorian Chair' },
      ]

      const schema = generateBreadcrumbSchema(items)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('BreadcrumbList')
      expect(schema.itemListElement).toHaveLength(3)
      expect(schema.itemListElement[0].position).toBe(1)
      expect(schema.itemListElement[0].name).toBe('Home')
      expect(schema.itemListElement[0].item).toBe(`${SITE_URL}/`)
      expect(schema.itemListElement[2].position).toBe(3)
      expect(schema.itemListElement[2].name).toBe('Victorian Chair')
      expect(schema.itemListElement[2].item).toBeUndefined()
    })
  })

  describe('generateItemListSchema', () => {
    it('generates valid ItemList', () => {
      const products = [
        { name: 'Product A', slug: 'product-a' },
        { name: 'Product B', slug: 'product-b' },
      ]

      const schema = generateItemListSchema(products, 'Test List')

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('ItemList')
      expect(schema.name).toBe('Test List')
      expect(schema.numberOfItems).toBe(2)
      expect(schema.itemListElement).toHaveLength(2)
      expect(schema.itemListElement[0].url).toBe(`${SITE_URL}/products/product-a`)
    })

    it('limits to 50 items', () => {
      const products = Array.from({ length: 60 }, (_, i) => ({
        name: `Product ${i}`,
        slug: `product-${i}`,
      }))

      const schema = generateItemListSchema(products)

      expect(schema.numberOfItems).toBe(60)
      expect(schema.itemListElement).toHaveLength(50)
    })
  })
})
