import { useState, useEffect, useCallback } from 'react'
import {
  getCurrentCart,
  addToWixCart,
  updateCartItemQuantity,
  removeFromWixCart,
  transformWixCart,
  getCartTotals,
} from '../services/wixCartService'

const CART_STORAGE_KEY = 'antiques_cart'

/**
 * Custom hook for managing cart with Wix ecom integration
 * 
 * Strategy: Hybrid approach
 * - Attempts to use Wix cart API for persistent, cross-device cart
 * - Falls back to localStorage for unauthenticated sessions
 * - Provides consistent interface regardless of backend
 * 
 * Note: Full Wix cart integration requires visitor/member authentication
 * which needs backend support. This implementation provides the foundation.
 */
export function useWixCart() {
  const [cart, setCart] = useState([])
  const [wixCart, setWixCart] = useState(null)
  const [useWixBackend, setUseWixBackend] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [initialized, setInitialized] = useState(false)

  // Load cart on mount
  useEffect(() => {
    loadCart()
  }, [])

  // Save cart to localStorage whenever it changes (fallback mode)
  // Only save AFTER initial load to prevent race condition where empty initial state
  // overwrites stored cart before it can be loaded from localStorage
  useEffect(() => {
    if (initialized && !useWixBackend) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
      } catch (err) {
        console.error('Failed to save cart to localStorage:', err)
      }
    }
  }, [cart, useWixBackend, initialized])

  /**
   * Load cart from Wix or localStorage
   */
  const loadCart = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Try to load from Wix cart API
      const wixCartData = await getCurrentCart()
      
      if (wixCartData) {
        // Successfully got Wix cart
        setWixCart(wixCartData)
        setCart(transformWixCart(wixCartData))
        setUseWixBackend(true)
      } else {
        // Fall back to localStorage
        loadFromLocalStorage()
        setUseWixBackend(false)
      }
    } catch (err) {
      console.warn('Wix cart not available, using local storage:', err)
      loadFromLocalStorage()
      setUseWixBackend(false)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [])

  /**
   * Load cart from localStorage
   */
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        setCart(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err)
      setCart([])
    }
  }

  /**
   * Add product to cart
   */
  const addToCart = useCallback(async (product) => {
    setError(null)

    if (useWixBackend) {
      try {
        // Use Wix cart API
        const updatedWixCart = await addToWixCart(product.id, 1)
        setWixCart(updatedWixCart)
        setCart(transformWixCart(updatedWixCart))
        return
      } catch (err) {
        console.error('Failed to add to Wix cart, falling back to local:', err)
        setError('Cart operation failed, using local cart')
        setUseWixBackend(false)
      }
    }

    // Local cart logic (fallback or default)
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id)
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }, [useWixBackend])

  /**
   * Remove product from cart
   */
  const removeFromCart = useCallback(async (productId) => {
    setError(null)

    if (useWixBackend) {
      try {
        // Find the line item ID for Wix
        const item = cart.find(i => i.id === productId)
        if (item?.lineItemId) {
          const updatedWixCart = await removeFromWixCart(item.lineItemId)
          setWixCart(updatedWixCart)
          setCart(transformWixCart(updatedWixCart))
          return
        }
      } catch (err) {
        console.error('Failed to remove from Wix cart:', err)
        setError('Cart operation failed')
        setUseWixBackend(false)
      }
    }

    // Local cart logic
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }, [cart, useWixBackend])

  /**
   * Update quantity of item in cart
   */
  const updateQuantity = useCallback(async (productId, quantity) => {
    setError(null)

    if (quantity <= 0) {
      return removeFromCart(productId)
    }

    if (useWixBackend) {
      try {
        const item = cart.find(i => i.id === productId)
        if (item?.lineItemId) {
          const updatedWixCart = await updateCartItemQuantity(item.lineItemId, quantity)
          setWixCart(updatedWixCart)
          setCart(transformWixCart(updatedWixCart))
          return
        }
      } catch (err) {
        console.error('Failed to update Wix cart quantity:', err)
        setError('Cart operation failed')
        setUseWixBackend(false)
      }
    }

    // Local cart logic
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    )
  }, [cart, useWixBackend, removeFromCart])

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    setCart([])
    setWixCart(null)
    try {
      localStorage.removeItem(CART_STORAGE_KEY)
    } catch (err) {
      console.error('Failed to clear localStorage cart:', err)
    }
  }, [])

  /**
   * Calculate cart totals
   */
  const totals = useCallback(() => {
    if (useWixBackend && wixCart) {
      return getCartTotals(wixCart)
    }

    // Calculate from local cart
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return {
      subtotal,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: subtotal,
    }
  }, [cart, wixCart, useWixBackend])()

  return {
    cart,
    wixCart, // Raw Wix cart for advanced features
    loading,
    error,
    useWixBackend,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totals,
    refresh: loadCart, // Allow manual refresh
  }
}
