import { wixSession } from './wixSession'

/**
 * Wix Cart Service
 * Uses backend API routes for proper authentication and cart operations
 * Documentation: https://dev.wix.com/docs/sdk/backend-modules/ecom/current-cart
 */

/**
 * Get the current cart for the session
 * Returns null if no cart exists or if there's an error
 */
export async function getCurrentCart() {
  try {
    const response = await wixSession.makeAuthenticatedRequest('/api/wix-cart?action=get')
    
    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Cart authentication required')
        return null
      }
      throw new Error(`Failed to get cart: ${response.statusText}`)
    }

    const data = await response.json()
    return data.cart
  } catch (error) {
    console.error('Failed to get current cart:', error)
    return null
  }
}

/**
 * Add a product to the cart
 * @param {string} productId - Wix product ID
 * @param {number} quantity - Quantity to add (default: 1)
 * @param {Object} options - Product options (variants, etc.)
 */
export async function addToWixCart(productId, quantity = 1, options = {}) {
  try {
    const response = await wixSession.makeAuthenticatedRequest('/api/wix-cart?action=add', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        quantity,
        options,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to add to cart: ${response.statusText}`)
    }

    const data = await response.json()
    return data.cart
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
    const response = await wixSession.makeAuthenticatedRequest('/api/wix-cart?action=update', {
      method: 'PUT',
      body: JSON.stringify({
        lineItemId,
        newQuantity: quantity,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update cart: ${response.statusText}`)
    }

    const data = await response.json()
    return data.cart
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
    const response = await wixSession.makeAuthenticatedRequest('/api/wix-cart?action=remove', {
      method: 'DELETE',
      body: JSON.stringify({
        lineItemId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to remove from cart: ${response.statusText}`)
    }

    const data = await response.json()
    return data.cart
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
    const response = await wixSession.makeAuthenticatedRequest('/api/wix-cart?action=remove&clear=true', {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to clear cart: ${response.statusText}`)
    }

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
