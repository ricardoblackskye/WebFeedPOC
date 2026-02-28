/**
 * Wix Checkout API Proxy
 * Handles checkout and order operations with proper server-side authentication
 * 
 * Endpoints:
 * POST /api/wix-checkout - Create checkout from current cart
 * GET /api/wix-checkout?id={checkoutId} - Get checkout details
 * GET /api/wix-checkout/order?id={orderId} - Get order details
 * GET /api/wix-checkout/orders - List orders for current member
 */

import { createClient, OAuthStrategy } from '@wix/sdk'
import { checkout, orders } from '@wix/ecom'
import { currentCart } from '@wix/ecom'

// Helper to create authenticated Wix client
function createWixClient(tokens) {
  const clientId = process.env.WIX_CLIENT_ID
  
  if (!clientId) {
    throw new Error('WIX_CLIENT_ID environment variable not set. Set in Vercel dashboard (without VITE_ prefix)')
  }

  return createClient({
    modules: { checkout, orders, currentCart },
    auth: OAuthStrategy({ 
      clientId,
      tokens: tokens || undefined
    }),
  })
}

// Get tokens from cookies or request headers
function getTokens(req) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const accessToken = authHeader.substring(7)
    return {
      accessToken,
      refreshToken: req.cookies?.wix_refresh_token
    }
  }

  if (req.cookies?.wix_visitor_token) {
    return {
      accessToken: req.cookies.wix_visitor_token,
      refreshToken: req.cookies.wix_refresh_token
    }
  }

  if (req.body?.tokens) {
    return req.body.tokens
  }

  return null
}

export default async function handler(req, res) {
  try {
    const tokens = getTokens(req)
    const wixClient = createWixClient(tokens)

    // Handle different operations based on method and query params
    if (req.method === 'POST') {
      // Create checkout from current cart
      const checkoutResponse = await wixClient.currentCart.createCheckoutFromCurrentCart({
        channelType: 'WEB',
      })

      const checkoutObj = checkoutResponse.checkout
      
      // Build checkout URL
      const siteUrl = process.env.WIX_SITE_URL
      if (!siteUrl) {
        throw new Error('WIX_SITE_URL environment variable not set. Set in Vercel dashboard (without VITE_ prefix)')
      }
      const checkoutUrl = `${siteUrl}/_api/checkout/v1/checkout/${checkoutObj._id}`

      return res.status(200).json({
        success: true,
        checkout: checkoutObj,
        checkoutUrl,
      })

    } else if (req.method === 'GET') {
      const { id, orderId, action } = req.query

      if (action === 'orders' || req.url.includes('/orders')) {
        // List orders for current member
        const limit = parseInt(req.query.limit || '10', 10)
        const offset = parseInt(req.query.offset || '0', 10)

        const response = await wixClient.orders.searchOrders({
          search: {
            paging: { limit, offset },
            sort: [{ fieldName: '_createdDate', order: 'DESC' }],
          },
        })

        return res.status(200).json({
          success: true,
          orders: response.orders || [],
          totalCount: response.totalCount || 0,
        })
      } else if (orderId) {
        // Get specific order details
        const orderResponse = await wixClient.orders.getOrder(orderId)

        return res.status(200).json({
          success: true,
          order: orderResponse.order,
        })
      } else if (id) {
        // Get checkout details
        const checkoutResponse = await wixClient.checkout.getCheckout(id)

        return res.status(200).json({
          success: true,
          checkout: checkoutResponse.checkout,
        })
      } else {
        return res.status(400).json({ 
          error: 'Missing required parameter: id, orderId, or action=orders' 
        })
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Wix checkout API error:', error)
    
    // Handle authentication errors
    if (error.message?.includes('auth') || error.message?.includes('token')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        details: error.message,
        requiresAuth: true
      })
    }

    return res.status(500).json({ 
      error: 'Checkout operation failed',
      details: error.message
    })
  }
}
