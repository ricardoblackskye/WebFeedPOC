/**
 * Structured data (JSON-LD) generators for SEO
 * See: https://schema.org/Product, https://schema.org/Organization
 */

import { stripHtml } from './helpers'

const SITE_NAME = 'Antiques Marketplace'
const SITE_URL = 'https://www.antiquesmarketplace.co.uk' // Update with real domain

export { SITE_NAME, SITE_URL }

export interface ProductStock {
  trackInventory: boolean
  quantity: number
  inStock: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  image?: string
  images?: string[]
  category?: string
  sku?: string
  stock?: ProductStock
}

interface BreadcrumbItem {
  name: string
  url?: string
}

interface ListItem {
  name: string
  slug: string
}

interface JsonLdObject {
  '@context': string
  '@type': string
  [key: string]: unknown
}

interface ProductSchema extends JsonLdObject {
  '@type': 'Product'
  name: string
  description?: string
  sku?: string
  image?: string[]
  category?: string
  url: string
  offers: {
    '@type': 'Offer'
    price: number
    priceCurrency: string
    availability: string
    url: string
  }
}

interface OrganizationSchema extends JsonLdObject {
  '@type': 'Organization'
  name: string
  url: string
  description: string
}

interface WebSiteSchema extends JsonLdObject {
  '@type': 'WebSite'
  name: string
  url: string
  potentialAction: {
    '@type': 'SearchAction'
    target: string
    'query-input': string
  }
}

interface BreadcrumbListSchema extends JsonLdObject {
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item?: string
  }>
}

interface ItemListSchema extends JsonLdObject {
  '@type': 'ItemList'
  name: string
  numberOfItems: number
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    url: string
    name: string
  }>
}

type StockAvailability = 'https://schema.org/InStock' | 'https://schema.org/OutOfStock' | 'https://schema.org/LimitedAvailability'

/**
 * Determines availability based on stock information
 */
function determineAvailability (stock: ProductStock | undefined): StockAvailability {
  if (!stock?.trackInventory) {
    return 'https://schema.org/InStock'
  }
  if (!stock.inStock || stock.quantity === 0) {
    return 'https://schema.org/OutOfStock'
  }
  if (stock.quantity <= 5) {
    return 'https://schema.org/LimitedAvailability'
  }
  return 'https://schema.org/InStock'
}

/**
 * Generates Product structured data (JSON-LD)
 */
export function generateProductSchema (product: Product | null | undefined): ProductSchema | null {
  if (!product) return null

  const availability = determineAvailability(product.stock)

  let image: string[] | undefined
  if (product.images?.length! > 0) {
    image = product.images
  } else if (product.image) {
    image = [product.image]
  }

  const schema: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: stripHtml(product.description!) || undefined,
    sku: product.sku || undefined,
    image,
    category: product.category || undefined,
    url: `${SITE_URL}/products/${product.slug}`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'GBP',
      availability,
      url: `${SITE_URL}/products/${product.slug}`
    }
  }

  return structuredClone(schema)
}

/**
 * Generates Organization structured data for the site
 */
export function generateOrganizationSchema (): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Discover unique antiques and vintage treasures. Curated collection of furniture, timepieces, decorative arts, and more.'
  }
}

/**
 * Generates WebSite structured data with search action
 */
export function generateWebSiteSchema (): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
}

/**
 * Generates BreadcrumbList structured data
 */
export function generateBreadcrumbSchema (items: BreadcrumbItem[]): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${SITE_URL}${item.url}` : undefined
    }))
  }
}

/**
 * Generates ItemList structured data for product listings
 */
export function generateItemListSchema (products: ListItem[], listName: string = 'Products'): ItemListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 50).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/products/${product.slug}`,
      name: product.name
    }))
  }
}