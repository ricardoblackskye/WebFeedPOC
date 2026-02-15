/**
 * Wix Session Manager
 * Handles Wix visitor authentication and token management
 * Provides session persistence across page refreshes
 */

const SESSION_STORAGE_KEY = 'wix_session'
const TOKEN_EXPIRY_BUFFER = 300000 // 5 minutes before actual expiry

class WixSessionManager {
  constructor() {
    this.tokens = null
    this.expiresAt = null
    this.initializeSession()
  }

  /**
   * Initialize session from localStorage if available
   */
  initializeSession() {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY)
      if (stored) {
        const session = JSON.parse(stored)
        if (session.expiresAt > Date.now()) {
          this.tokens = session.tokens
          this.expiresAt = session.expiresAt
        } else {
          // Session expired, clear it
          localStorage.removeItem(SESSION_STORAGE_KEY)
        }
      }
    } catch (error) {
      console.error('Failed to initialize Wix session:', error)
    }
  }

  /**
   * Check if we have valid tokens
   */
  hasValidSession() {
    return this.tokens && this.expiresAt && this.expiresAt > (Date.now() + TOKEN_EXPIRY_BUFFER)
  }

  /**
   * Get current auth tokens
   */
  getTokens() {
    if (!this.hasValidSession()) {
      return null
    }
    return this.tokens
  }

  /**
   * Get authorization header for API requests
   */
  getAuthHeader() {
    const tokens = this.getTokens()
    if (!tokens || !tokens.accessToken) {
      return {}
    }
    return {
      'Authorization': `Bearer ${tokens.accessToken}`
    }
  }

  /**
   * Authenticate with Wix and get visitor tokens
   */
  async authenticate() {
    try {
      const response = await fetch('/api/wix-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens: this.tokens // Pass existing tokens if we have them
        }),
        credentials: 'include', // Include cookies
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.tokens) {
        this.tokens = data.tokens
        this.expiresAt = data.expiresAt

        // Save to localStorage for persistence
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            tokens: this.tokens,
            expiresAt: this.expiresAt,
          }))
        } catch (error) {
          console.warn('Failed to save session to localStorage:', error)
        }

        return true
      }

      return false
    } catch (error) {
      console.error('Wix authentication error:', error)
      return false
    }
  }

  /**
   * Ensure we have a valid session, authenticate if needed
   */
  async ensureAuthenticated() {
    if (this.hasValidSession()) {
      return true
    }

    return await this.authenticate()
  }

  /**
   * Clear session (logout)
   */
  clearSession() {
    this.tokens = null
    this.expiresAt = null
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear session:', error)
    }
  }

  /**
   * Make authenticated API request to Wix backend
   */
  async makeAuthenticatedRequest(url, options = {}) {
    // Ensure we have a valid session
    await this.ensureAuthenticated()

    // Add auth headers
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    }

    // Make request with credentials
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    })

    // Handle 401 - try to re-authenticate once
    if (response.status === 401) {
      console.log('Session expired, re-authenticating...')
      this.clearSession()
      const reauth = await this.authenticate()
      
      if (reauth) {
        // Retry request with new tokens
        const retryHeaders = {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
          ...options.headers,
        }

        return await fetch(url, {
          ...options,
          headers: retryHeaders,
          credentials: 'include',
        })
      }
    }

    return response
  }
}

// Export singleton instance
export const wixSession = new WixSessionManager()

// Export class for testing
export default WixSessionManager
