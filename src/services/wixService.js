import { createClient, OAuthStrategy } from '@wix/sdk'
import { products, collections } from '@wix/stores'

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
    modules: { products, collections },
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
    // First, fetch all collections to map IDs to names
    const collectionsResult = await wixClient.collections.queryCollections().find()
    const collectionMap = {}
    collectionsResult.items.forEach(collection => {
      collectionMap[collection._id] = collection.name
    })

    let allItems = []
    let result = await wixClient.products.queryProducts().limit(100).find()
    allItems = allItems.concat(result.items)

    while (result.hasNext()) {
      result = await result.next()
      allItems = allItems.concat(result.items)
    }

    // Transform Wix product data to our format
    return allItems.map(product => {
      // Use the first collection as the category, fallback to productType or Uncategorized
      let category = 'Uncategorized'
      if (product.collectionIds && product.collectionIds.length > 0) {
        const firstCollectionId = product.collectionIds[0]
        category = collectionMap[firstCollectionId] || category
      } else if (product.productType) {
        category = product.productType
      }

      return {
        id: product._id,
        name: product.name,
        slug: product.slug || product.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        description: product.description || '',
        price: product.price?.price || 0,
        image: product.media?.mainMedia?.image?.url || null,
        images: product.media?.items?.map(item => item.image?.url).filter(Boolean) || [],
        category: category,
        collections: product.collectionIds || [],
        sku: product.sku || null,
      }
    })
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
    // Fetch collections to map IDs to names
    const collectionsResult = await wixClient.collections.queryCollections().find()
    const collectionMap = {}
    collectionsResult.items.forEach(collection => {
      collectionMap[collection._id] = collection.name
    })

    const product = await wixClient.products.getProduct(productId)

    // Use the first collection as the category, fallback to productType or Uncategorized
    let category = 'Uncategorized'
    if (product.collectionIds && product.collectionIds.length > 0) {
      const firstCollectionId = product.collectionIds[0]
      category = collectionMap[firstCollectionId] || category
    } else if (product.productType) {
      category = product.productType
    }

    return {
      id: product._id,
      name: product.name,
      slug: product.slug || product.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      description: product.description || '',
      price: product.price?.price || 0,
      image: product.media?.mainMedia?.image?.url || null,
      images: product.media?.items?.map(item => item.image?.url).filter(Boolean) || [],
      category: category,
      collections: product.collectionIds || [],
      sku: product.sku || null,
    }
  } catch (error) {
    console.error('Failed to fetch Wix product:', error)
    throw error
  }
}
