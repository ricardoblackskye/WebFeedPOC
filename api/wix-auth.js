/**
 * Wix Authentication API Route
 * Initializes Wix visitor session and returns tokens
 * 
 * This endpoint:
 * 1. Creates a Wix visitor session
 * 2. Returns visitor tokens for frontend use
 * 3. Sets secure HTTP-only cookies for session management
 */

import { createClient, OAuthStrategy } from '@wix/sdk'
import { currentCart } from '@wix/ecom'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const clientId = process.env.WIX_CLIENT_ID
    
    if (!clientId) {
      console.error('Wix client ID not configured')
      return res.status(500).json({ 
        error: 'Wix configuration missing',
        details: 'WIX_CLIENT_ID environment variable not set. Set in Vercel dashboard (without VITE_ prefix)'
      })
    }

    // Create Wix client with OAuth strategy
    const wixClient = createClient({
      modules: { currentCart },
      auth: OAuthStrategy({ 
        clientId,
        tokens: req.body.tokens // Accept existing tokens if provided
      }),
    })

    // Generate visitor tokens
    const tokens = await wixClient.auth.generateVisitorTokens()
    
    // Set secure cookie with tokens (for server-side use)
    res.setHeader('Set-Cookie', [
      `wix_visitor_token=${tokens.accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`,
      `wix_refresh_token=${tokens.refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`,
    ])

    // Return tokens to client (for client-side SDK use)
    return res.status(200).json({
      success: true,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      expiresAt: Date.now() + 604800000, // 7 days
    })
  } catch (error) {
    console.error('Wix authentication error:', error)
    return res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message,
    })
  }
}
