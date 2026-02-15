import { createClient, OAuthStrategy } from '@wix/sdk'
import { currentCart } from '@wix/ecom'
import { products } from '@wix/stores'

/**
 * Creates a Wix SDK client for cart operations
 * Note: Cart operations require visitor/member authentication
 * Documentation: https://dev.wix.com/docs/sdk/backend-modules/ecom/current-cart
 */
function createWixCartClient() {
  const clientId = import.meta.env.VITE_WIX_CLIENT_ID

  if (!clientId) {
    throw new Error('Wix API credentials not configured')
  }

  return createClient({
    modules: { currentCart, products },
    auth: OAuthStrategy({ clientId }),
  })
}

/**
 * Get the current cart for the session
 * Returns null if no cart exists or if there's an error
 */
export async function getCurrentCart() {
  try {
    const wixClient = createWixCartClient()
    const cart = await wixClient.currentCart.getCurrentCart()
    return cart
  } catch (error) {
    console.error('Failed to get current cart:', error)
    // Return empty cart structure if cart doesn't exist yet
    return null
  }
}

/**
 * Add a product to the cart
 * @param {string} productId - Wix product ID
 * @param {number} quantity - Quantity to add (default: 1)
 */
export async function addToWixCart(productId, quantity = 1) {
  try {
    const wixClient = createWixCartClient()
    
    // Add line item to cart
    const result = await wixClient.currentCart.addToCurrentCart({
      lineItems: [
        {
          catalogReference: {
            catalogItemId: productId,
            appId: import.meta.env.VITE_WIX_STORES_APP_ID || '1380b703-ce81-ff05-f115-39571d94dfcd', // Default Wix Stores app ID
          },
          quantity,
        },
      ],
    })
    
    return result.cart
  } catch (error) {
    console.error('Failed to add item to cart:', error)
    throw error
  }
}

/**
 * Update quantity of a line item in the cart
 * @param {string} lineItemId - Line item ID from cart
 * @param {number} quantity - New quantity
 */
export async function updateCartItemQuantity(lineItemId, quantity) {
  try {
    const wixClient = createWixCartClient()
    
    const result = await wixClient.currentCart.updateCurrentCartLineItemQuantity([
      {
        _id: lineItemId,
        quantity,
      },
    ])
    
    return result.cart
  } catch (error) {
    console.error('Failed to update cart item quantity:', error)
    throw error
  }
}

/**
 * Remove a line item from the cart
 * @param {string} lineItemId - Line item ID to remove
 */
export async function removeFromWixCart(lineItemId) {
  try {
    const wixClient = createWixCartClient()
    
    const result = await wixClient.currentCart.removeLineItemsFromCurrentCart([lineItemId])
    
    return result.cart
  } catch (error) {
    console.error('Failed to remove item from cart:', error)
    throw error
  }
}

/**
 * Delete the entire current cart
 */
export async function clearWixCart() {
  try {
    const wixClient = createWixCartClient()
    await wixClient.currentCart.deleteCurrentCart()
    return true
  } catch (error) {
    console.error('Failed to clear cart:', error)
    throw error
  }
}

/**
 * Transform Wix cart to our app's cart format for easier consumption
 * @param {Object} wixCart - Wix cart object
 * @returns {Array} Array of cart items in app format
 */
export function transformWixCart(wixCart) {
  if (!wixCart || !wixCart.lineItems) {
    return []
  }

  return wixCart.lineItems.map(item => ({
    id: item.catalogReference?.catalogItemId || item.productName?.original, // Use product ID if available
    lineItemId: item._id, // Wix line item ID for updates/removes
    name: item.productName?.translated || item.productName?.original || 'Unknown Product',
    price: item.price?.amount || 0,
    quantity: item.quantity || 1,
    image: item.image || null,
    url: item.url || null,
    // Include full item for advanced features
    _wixItem: item,
  }))
}

/**
 * Get cart totals from Wix cart
 * @param {Object} wixCart - Wix cart object
 * @returns {Object} Cart totals
 */
export function getCartTotals(wixCart) {
  if (!wixCart) {
    return {
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
    }
  }

  return {
    subtotal: parseFloat(wixCart.subtotal?.amount || 0),
    tax: parseFloat(wixCart.taxSummary?.totalTax?.amount || 0),
    shipping: parseFloat(wixCart.shippingInfo?.cost?.amount || 0),
    discount: parseFloat(wixCart.appliedDiscounts?.reduce((sum, d) => sum + parseFloat(d.discountAmount?.amount || 0), 0) || 0),
    total: parseFloat(wixCart.totals?.total?.amount || 0),
  }
}
