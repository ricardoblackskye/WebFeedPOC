import { wixSession } from './wixSession'

/**
 * Wix Checkout Service
 * Uses backend API routes for proper authentication and checkout operations
 * Documentation: https://dev.wix.com/docs/sdk/backend-modules/ecom/checkout
 */

/**
 * Create a checkout from the current cart
 * Returns checkout object with ID and URL for redirect
 */
export async function createCheckout() {
  try {
    const response = await wixSession.makeAuthenticatedRequest('/api/wix-checkout', {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`Failed to create checkout: ${response.statusText}`)
    }

    const data = await response.json()
    return data.checkout
  } catch (error) {
    console.error('Failed to create checkout:', error)
    throw new Error(`Checkout creation failed: ${error.message}`)
  }
}

/**
 * Get checkout details by ID
 * @param {string} checkoutId - Wix checkout ID
 */
export async function getCheckout(checkoutId) {
  try {
    const response = await wixSession.makeAuthenticatedRequest(`/api/wix-checkout?id=${checkoutId}`)

    if (!response.ok) {
      throw new Error(`Failed to get checkout: ${response.statusText}`)
    }

    const data = await response.json()
    return data.checkout
  } catch (error) {
    console.error('Failed to get checkout:', error)
    throw new Error(`Failed to retrieve checkout: ${error.message}`)
  }
}

/**
 * Get the checkout URL for redirecting users to Wix hosted checkout
 * Now handled by the backend API, but kept for compatibility
 * @param {string} checkoutId - Wix checkout ID
 * @returns {string} Checkout URL
 */
export function getCheckoutUrl(checkoutId) {
  const siteUrl =import.meta.env.VITE_WIX_SITE_URL || 'https://www.wix.com'
  return `${siteUrl}/_api/checkout/v1/checkout/${checkoutId}`
}

/**
 * Get order details by ID
 * Used to show order confirmation after successful checkout
 * @param {string} orderId - Wix order ID
 */
export async function getOrder(orderId) {
  try {
    const response = await wixSession.makeAuthenticatedRequest(`/api/wix-checkout?orderId=${orderId}`)

    if (!response.ok) {
      throw new Error(`Failed to get order: ${response.statusText}`)
    }

    const data = await response.json()
    return data.order
  } catch (error) {
    console.error('Failed to get order:', error)
    throw new Error(`Failed to retrieve order: ${error.message}`)
  }
}

/**
 * Query orders for the current member
 * Useful for order history page
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of orders to return
 * @param {number} options.offset - Pagination offset
 */
export async function queryOrders({ limit = 10, offset = 0 } = {}) {
  try {
    const response = await wixSession.makeAuthenticatedRequest(
      `/api/wix-checkout?action=orders&limit=${limit}&offset=${offset}`
    )

    if (!response.ok) {
      throw new Error(`Failed to query orders: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      orders: data.orders || [],
      totalCount: data.totalCount || 0,
    }
  } catch (error) {
    console.error('Failed to query orders:', error)
    return {
      orders: [],
      totalCount: 0,
    }
  }
}

/**
 * Transform Wix order to simplified format for display
 * @param {Object} wixOrder - Raw Wix order object
 */
export function transformOrder(wixOrder) {
  if (!wixOrder) return null

  return {
    id: wixOrder._id,
    number: wixOrder.number,
    status: wixOrder.status,
    createdDate: wixOrder._createdDate,
    updatedDate: wixOrder._updatedDate,
    currency: wixOrder.currency,
    
    // Line items
    items: wixOrder.lineItems?.map(item => ({
      id: item._id,
      productId: item.catalogReference?.catalogItemId,
      name: item.productName?.original || item.productName?.translated || 'Unknown Product',
      quantity: item.quantity,
      price: parseFloat(item.price?.amount || 0),
      totalPrice: parseFloat(item.totalPrice?.amount || 0),
      image: item.image,
      url: item.url,
    })) || [],
    
    // Pricing
    subtotal: parseFloat(wixOrder.priceSummary?.subtotal?.amount || 0),
    shipping: parseFloat(wixOrder.priceSummary?.shipping?.amount || 0),
    tax: parseFloat(wixOrder.priceSummary?.tax?.amount || 0),
    discount: parseFloat(wixOrder.priceSummary?.discount?.amount || 0),
    total: parseFloat(wixOrder.priceSummary?.total?.amount || 0),
    
    // Shipping info
    shippingInfo: wixOrder.shippingInfo ? {
      firstName: wixOrder.shippingInfo.logistics?.shippingDestination?.contactDetails?.firstName,
      lastName: wixOrder.shippingInfo.logistics?.shippingDestination?.contactDetails?.lastName,
      address: wixOrder.shippingInfo.logistics?.shippingDestination?.address,
      phone: wixOrder.shippingInfo.logistics?.shippingDestination?.contactDetails?.phone,
    } : null,
    
    // Billing info
    billingInfo: wixOrder.billingInfo ? {
      firstName: wixOrder.billingInfo.contactDetails?.firstName,
      lastName: wixOrder.billingInfo.contactDetails?.lastName,
      address: wixOrder.billingInfo.address,
    } : null,
    
    // Payment info
    paymentStatus: wixOrder.paymentStatus,
    fulfillmentStatus: wixOrder.fulfillmentStatus,
    
    // Raw order for advanced use
    _raw: wixOrder,
  }
}

/**
 * Get simplified checkout redirect flow
 * This is the main function to use for initiating checkout
 * @returns {Promise<string>} Checkout URL to redirect user to
 */
export async function initiateCheckout(localItems) {
  try {
    // Create checkout from current cart via API
    // Pass local cart items when in local mode so the API can sync them to Wix first
    const body = localItems && localItems.length > 0 ? { items: localItems } : {}
    const response = await wixSession.makeAuthenticatedRequest('/api/wix-checkout', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      let message = `Failed to create checkout: ${response.statusText}`
      try {
        const errData = await response.json()
        if (errData.details) message = errData.details
        else if (errData.error) message = errData.error
      } catch { /* ignore parse errors */ }
      throw new Error(message)
    }

    const data = await response.json()
    
    // Return the checkout URL provided by the API
    if (data.checkoutUrl) {
      return data.checkoutUrl
    }
    
    // Fallback: construct URL from checkout ID
    if (data.checkout && data.checkout._id) {
      return getCheckoutUrl(data.checkout._id)
    }
    
    throw new Error('Invalid checkout response - no URL or ID provided')
  } catch (error) {
    console.error('Failed to initiate checkout:', error)
    throw error
  }
}
