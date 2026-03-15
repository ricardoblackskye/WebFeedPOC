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
import { checkout, orders, currentCart } from '@wix/ecom'
import { redirects } from '@wix/redirects'

// Helper to create authenticated Wix client
function createWixClient(tokens) {
  const clientId = process.env.WIX_CLIENT_ID
  
  if (!clientId) {
    throw new Error('WIX_CLIENT_ID environment variable not set. Set in Vercel dashboard (without VITE_ prefix)')
  }

  return createClient({
    modules: { checkout, orders, currentCart, redirects },
    auth: OAuthStrategy({ 
      clientId,
      tokens: tokens || undefined
    }),
  })
}

// Get tokens from custom header (full token objects) or cookies
function getTokens(req) {
  // Try the X-Wix-Tokens header (contains full { accessToken, refreshToken } objects)
  const wixTokensHeader = req.headers['x-wix-tokens']
  if (wixTokensHeader) {
    try {
      return JSON.parse(wixTokensHeader)
    } catch { /* ignore malformed header */ }
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

    if (req.method === 'POST') {
      return await handlePost(wixClient, req, res)
    }
    if (req.method === 'GET') {
      return await handleGet(wixClient, req, res)
    }
    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Wix checkout API error:', error)

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

async function handlePost(wixClient, req, res) {
  const localItems = req.body?.items
  if (localItems && localItems.length > 0) {
    await wixClient.currentCart.addToCurrentCart({
      lineItems: localItems.map(item => ({
        catalogReference: {
          catalogItemId: item.id,
          appId: '1380b703-ce81-ff05-f115-39571d94dfcd',
        },
        quantity: Number.parseInt(item.quantity, 10) || 1,
      })),
    })
  }

  const checkoutResponse = await wixClient.currentCart.createCheckoutFromCurrentCart({
    channelType: 'WEB',
  })

  // createCheckoutFromCurrentCart returns { checkoutId } not { checkout: { _id } }
  const checkoutId = checkoutResponse.checkoutId

  // Use createRedirectSession to get the proper hosted checkout URL
  const siteUrl = process.env.WIX_SITE_URL || ''
  const redirectSession = await wixClient.redirects.createRedirectSession({
    ecomCheckout: { checkoutId },
    callbacks: {
      // thankYouPageUrl: Wix appends ?orderId=... after a completed order
      thankYouPageUrl: `${siteUrl}/order-confirmation`,
      // postFlowUrl: triggered for intermediate flows (e.g. member login during
      // checkout) — no orderId is provided, so send back to homepage not order-confirmation
      postFlowUrl: siteUrl,
      // cartPageUrl / checkoutPageUrl: prevents Wix falling back to its own
      // redirect middleware (giannadart.co.uk/__ecom/_serverless/...) when
      // the user clicks "Continue browsing" or navigates back from checkout
      cartPageUrl: siteUrl,
      checkoutPageUrl: `${siteUrl}/`,
    },
  })

  const checkoutUrl = redirectSession?.redirectSession?.fullUrl
  if (!checkoutUrl) {
    throw new Error('Failed to create checkout redirect URL')
  }

  return res.status(200).json({
    success: true,
    checkout: { _id: checkoutId },
    checkoutUrl,
  })
}

async function handleGet(wixClient, req, res) {
  const { id, orderId, action } = req.query

  if (action === 'orders' || req.url.includes('/orders')) {
    return handleGetOrders(wixClient, req, res)
  }
  if (orderId) {
    const orderResponse = await wixClient.orders.getOrder(orderId)
    return res.status(200).json({ success: true, order: orderResponse.order })
  }
  if (id) {
    const checkoutResponse = await wixClient.checkout.getCheckout(id)
    return res.status(200).json({ success: true, checkout: checkoutResponse.checkout })
  }
  return res.status(400).json({ error: 'Missing required parameter: id, orderId, or action=orders' })
}

async function handleGetOrders(wixClient, req, res) {
  const limit = Number.parseInt(req.query.limit || '10', 10)
  const offset = Number.parseInt(req.query.offset || '0', 10)

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
}
