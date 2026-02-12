const WIX_API_KEY = import.meta.env.VITE_WIX_API_KEY
const WIX_SITE_ID = import.meta.env.VITE_WIX_SITE_ID

/**
 * Fetches products from Wix.com using their API
 * Documentation: https://dev.wix.com/api/rest/wix-stores/catalog/products
 * 
 * Wix products support collections (categories) via the productType and collections fields
 */
export async function fetchWixProducts() {
  if (!WIX_API_KEY || !WIX_SITE_ID) {
    throw new Error('Wix API credentials not configured')
  }

  try {
    const response = await fetch(
      `https://www.wixapis.com/stores/v1/products/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': WIX_API_KEY,
          'wix-site-id': WIX_SITE_ID,
        },
        body: JSON.stringify({
          query: {
            filter: {},
            paging: {
              limit: 100,
              offset: 0,
            },
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Wix API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Transform Wix product data to our format
    return data.products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.price,
      image: product.media?.mainMedia?.image?.url || null,
      category: product.productType || 'Uncategorized',
      collections: product.collections || [],
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
  if (!WIX_API_KEY || !WIX_SITE_ID) {
    throw new Error('Wix API credentials not configured')
  }

  try {
    const response = await fetch(
      `https://www.wixapis.com/stores/v1/products/${productId}`,
      {
        headers: {
          'Authorization': WIX_API_KEY,
          'wix-site-id': WIX_SITE_ID,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Wix API error: ${response.statusText}`)
    }

    const product = await response.json()
    
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.price,
      image: product.media?.mainMedia?.image?.url || null,
      category: product.productType || 'Uncategorized',
      collections: product.collections || [],
    }
  } catch (error) {
    console.error('Failed to fetch Wix product:', error)
    throw error
  }
}
