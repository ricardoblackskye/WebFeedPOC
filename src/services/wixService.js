import { createClient, OAuthStrategy } from '@wix/sdk'
import { products } from '@wix/stores'

/**
 * Creates a Wix headless client using the official SDK
 * Documentation: https://dev.wix.com/docs/sdk
 */
function createWixClient() {
  const clientId = import.meta.env.VITE_WIX_CLIENT_ID

  if (!clientId) {
    throw new Error('Wix API credentials not configured')
  }

  return createClient({
    modules: { products },
    auth: OAuthStrategy({ clientId }),
  })
}

/**
 * Fetches all products from Wix.com using the headless SDK.
 * Paginates through all results since the SDK defaults to 50 per page.
 */
export async function fetchWixProducts() {
  const wixClient = createWixClient()

  try {
    let allItems = []
    let result = await wixClient.products.queryProducts().limit(100).find()
    allItems = allItems.concat(result.items)

    while (result.hasNext()) {
      result = await result.next()
      allItems = allItems.concat(result.items)
    }

    // Transform Wix product data to our format
    return allItems.map(product => ({
      id: product._id,
      name: product.name,
      description: product.description || '',
      price: product.price?.price || 0,
      image: product.media?.mainMedia?.image?.url || null,
      category: product.productType || 'Uncategorized',
      collections: product.collectionIds || [],
      sku: product.sku || null,
    }))
  } catch (error) {
    console.error('Failed to fetch Wix products:', error)
    throw error
  }
}

/**
 * Fetches a single product by ID from Wix
 */
export async function fetchWixProduct(productId) {
  const wixClient = createWixClient()

  try {
    const product = await wixClient.products.getProduct(productId)

    return {
      id: product._id,
      name: product.name,
      description: product.description || '',
      price: product.price?.price || 0,
      image: product.media?.mainMedia?.image?.url || null,
      category: product.productType || 'Uncategorized',
      collections: product.collectionIds || [],
      sku: product.sku || null,
    }
  } catch (error) {
    console.error('Failed to fetch Wix product:', error)
    throw error
  }
}

