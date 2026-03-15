/**
 * Wix Cart API Proxy
 * Handles all cart operations with proper server-side authentication
 * 
 * Endpoints:
 * GET /api/wix-cart - Get current cart
 * POST /api/wix-cart/add - Add item to cart
 * PUT /api/wix-cart/update - Update cart item quantity
 * DELETE /api/wix-cart/remove - Remove item from cart
 * DELETE /api/wix-cart/clear - Clear entire cart
 */

import { createClient, OAuthStrategy } from '@wix/sdk'
import { currentCart } from '@wix/ecom'
import { products } from '@wix/stores'

// Helper to create authenticated Wix client
function createWixClient(tokens) {
  const clientId = process.env.WIX_CLIENT_ID
  
  if (!clientId) {
    throw new Error('WIX_CLIENT_ID environment variable not set. Set in Vercel dashboard (without VITE_ prefix)')
  }

  return createClient({
    modules: { currentCart, products },
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

  // Try to get from cookies
  if (req.cookies?.wix_visitor_token) {
    return {
      accessToken: req.cookies.wix_visitor_token,
      refreshToken: req.cookies.wix_refresh_token
    }
  }

  // Try to get from request body
  if (req.body?.tokens) {
    return req.body.tokens
  }

  return null
}

export default async function handler(req, res) {
  try {
    const tokens = getTokens(req)
    const wixClient = createWixClient(tokens)

    // Parse action from query parameter or method
    const action = req.query.action || req.method.toLowerCase()

    switch (action) {
      case 'get':
      case 'GET': {
        // Get current cart — new visitors have no cart yet, which is not an error
        try {
          const cart = await wixClient.currentCart.getCurrentCart()
          return res.status(200).json({ success: true, cart })
        } catch (cartError) {
          // Wix throws when the visitor has no cart yet — return an empty cart structure
          // so the frontend stays in Wix-backend mode and adds go to Wix
          console.warn('No cart found for visitor, returning empty cart:', cartError.message)
          return res.status(200).json({ success: true, cart: { lineItems: [] } })
        }
      }

      case 'add':
      case 'POST': {
        // Add item to cart
        const { productId, quantity = 1, options } = req.body
        
        if (!productId) {
          return res.status(400).json({ error: 'Product ID required' })
        }

        const addResult = await wixClient.currentCart.addToCurrentCart({
          lineItems: [{
            catalogReference: {
              catalogItemId: productId,
              appId: process.env.VITE_WIX_STORES_APP_ID || '1380b703-ce81-ff05-f115-39571d94dfcd',
              options: options || {}
            },
            quantity: Number.parseInt(quantity, 10)
          }]
        })

        return res.status(200).json({ 
          success: true, 
          cart: addResult.cart 
        })
      }

      case 'update':
      case 'PUT': {
        // Update cart item quantity
        const { lineItemId, newQuantity } = req.body
        
        if (!lineItemId || newQuantity === undefined) {
          return res.status(400).json({ error: 'Line item ID and quantity required' })
        }

        const updateResult = await wixClient.currentCart.updateCurrentCartLineItemQuantity([{
          _id: lineItemId,
          quantity: Number.parseInt(newQuantity, 10)
        }])

        return res.status(200).json({ 
          success: true, 
          cart: updateResult.cart 
        })
      }

      case 'remove':
      case 'DELETE': {
        if (req.query.clear === 'true') {
          // Clear entire cart
          await wixClient.currentCart.deleteCurrentCart()
          return res.status(200).json({ 
            success: true, 
            message: 'Cart cleared' 
          })
        }

        // Remove specific item
        const itemId = req.body.lineItemId || req.query.lineItemId
        
        if (!itemId) {
          return res.status(400).json({ error: 'Line item ID required' })
        }

        const removeResult = await wixClient.currentCart.removeLineItemsFromCurrentCart([itemId])
        return res.status(200).json({ 
          success: true, 
          cart: removeResult.cart 
        })
      }

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }

  } catch (error) {
    console.error('Wix cart API error:', error)
    
    // Handle authentication errors
    if (error.message?.includes('auth') || error.message?.includes('token')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        details: error.message,
        requiresAuth: true
      })
    }

    return res.status(500).json({ 
      error: 'Cart operation failed',
      details: error.message
    })
  }
}
