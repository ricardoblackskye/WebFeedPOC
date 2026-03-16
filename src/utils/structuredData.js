/**
 * Structured data (JSON-LD) generators for SEO
 * See: https://schema.org/Product, https://schema.org/Organization
 */

import { stripHtml } from './helpers'

const SITE_NAME = 'Antiques Marketplace'
const SITE_URL = 'https://www.antiquesmarketplace.co.uk' // Update with real domain

/**
 * Generates Product structured data (JSON-LD)
 */
export function generateProductSchema(product) {
  if (!product) return null

  // Determine availability based on stock information
  let availability = 'https://schema.org/InStock' // Default
  if (product.stock?.trackInventory) {
    if (!product.stock.inStock || product.stock.quantity === 0) {
      availability = 'https://schema.org/OutOfStock'
    } else if (product.stock.quantity <= 5) {
      availability = 'https://schema.org/LimitedAvailability'
    }
  }

  let image
  if (product.images?.length > 0) {
    image = product.images
  } else if (product.image) {
    image = [product.image]
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: stripHtml(product.description) || undefined,
    sku: product.sku || undefined,
    image,
    category: product.category || undefined,
    url: `${SITE_URL}/products/${product.slug}`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'GBP',
      availability: availability,
      url: `${SITE_URL}/products/${product.slug}`,
    },
  }

  return structuredClone(schema)
}

/**
 * Generates Organization structured data for the site
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Discover unique antiques and vintage treasures. Curated collection of furniture, timepieces, decorative arts, and more.',
  }
}

/**
 * Generates WebSite structured data with search action
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generates BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${SITE_URL}${item.url}` : undefined,
    })),
  }
}

/**
 * Generates ItemList structured data for product listings
 */
export function generateItemListSchema(products, listName = 'Products') {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 50).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/products/${product.slug}`,
      name: product.name,
    })),
  }
}

export { SITE_NAME, SITE_URL }
