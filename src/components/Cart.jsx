import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { initiateCheckout } from '../services/wixCheckoutService'
import './Cart.css'

function Cart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  totalPrice,
  loading = false,
  error = null,
  useWixBackend = false,
  totals = null,
  isDrawerOpen = false,
  onCloseDrawer = null,
}) {
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)
  const dialogRef = useRef(null)
  const previouslyFocused = useRef(null)
  const touchStartX = useRef(null)

  const handleCheckout = async () => {
    if (items.length === 0) return

    setCheckoutLoading(true)
    setCheckoutError(null)

    try {
      // Pass local items when not using Wix backend so checkout API can sync them
      const checkoutUrl = await initiateCheckout(useWixBackend ? undefined : items)
      
      // Redirect to Wix hosted checkout page
      globalThis.location.href = checkoutUrl
    } catch (error) {
      console.error('Checkout error:', error)
      
      // Provide helpful error message based on the issue
      if (error.message?.includes('not configured') || error.message?.includes('credentials')) {
        setCheckoutError('Checkout requires Wix configuration. Please configure VITE_WIX_CLIENT_ID in your environment.')
      } else if (error.message?.includes('cart')) {
        setCheckoutError('Unable to access cart. Please try adding items again.')
      } else {
        setCheckoutError('Checkout is temporarily unavailable. Please try again later.')
      }
      
      setTimeout(() => setCheckoutError(null), 8000)
    } finally {
      setCheckoutLoading(false)
    }
  }

  // Focus management for the drawer: when opened in drawer mode, move focus into
  // the dialog and trap Tab within it; restore focus to the trigger on close.
  useEffect(() => {
    if (!isDrawerOpen) return
    const node = dialogRef.current
    if (!node) return

    previouslyFocused.current = document.activeElement

    const focusables = node.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusables.length > 0) {
      focusables[0].focus()
    } else {
      node.focus()
    }

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    node.addEventListener('keydown', onKeyDown)
    return () => {
      node.removeEventListener('keydown', onKeyDown)
      if (previouslyFocused.current && previouslyFocused.current.focus) {
        previouslyFocused.current.focus()
      }
    }
  }, [isDrawerOpen])

  // Swipe-to-dismiss on touch devices: track a horizontal swipe starting on the
  // drawer and dismiss when it ends at least 50px to the left. Native listeners
  // (not React synthetic) so they fire reliably from dispatched/browser touch
  // events on all devices.
  useEffect(() => {
    if (!isDrawerOpen) return
    const node = dialogRef.current
    if (!node || !onCloseDrawer) return

    const onTouchStart = (event) => {
      if (event.touches && event.touches.length > 0) {
        touchStartX.current = event.touches[0].clientX
      }
    }
    const onTouchEnd = (event) => {
      if (touchStartX.current === null) return
      const endX =
        event.changedTouches && event.changedTouches.length > 0
          ? event.changedTouches[0].clientX
          : touchStartX.current
      const deltaX = endX - touchStartX.current
      if (deltaX < -50) {
        onCloseDrawer()
      }
      touchStartX.current = null
    }

    node.addEventListener('touchstart', onTouchStart)
    node.addEventListener('touchend', onTouchEnd)
    return () => {
      node.removeEventListener('touchstart', onTouchStart)
      node.removeEventListener('touchend', onTouchEnd)
    }
  }, [isDrawerOpen, onCloseDrawer])

  // Shared dialog props applied to the cart root when rendered as a drawer.
  const drawerProps = isDrawerOpen
    ? {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': 'Shopping cart',
        ref: dialogRef,
      }
    : {}

  if (items.length === 0) {
    return (
      <div className="cart" {...drawerProps}>
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          {isDrawerOpen && onCloseDrawer && (
            <button
              type="button"
              className="cart-close-btn"
              aria-label="Close cart"
              onClick={onCloseDrawer}
            >
              ✕
            </button>
          )}
        </div>
        {useWixBackend && (
          <div className="cart-backend-badge">
            <span className="badge-wix">🔗 Synced with Wix</span>
          </div>
        )}
        {loading && <div className="cart-loading">Loading cart...</div>}
        {error && <div className="cart-error">{error}</div>}
        <div className="cart-empty">
          <p>Your cart is empty</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cart" {...drawerProps}>
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        {isDrawerOpen && onCloseDrawer && (
          <button
            type="button"
            className="cart-close-btn"
            aria-label="Close cart"
            onClick={onCloseDrawer}
          >
            ✕
          </button>
        )}
      </div>
      {useWixBackend && (
        <div className="cart-backend-badge">
          <span className="badge-wix" title="Your cart is synced with Wix and persists across devices">
            🔗 Wix Cart
          </span>
        </div>
      )}
      {error && <div className="cart-error-small">{error}</div>}
      {checkoutError && <div className="cart-error-small">{checkoutError}</div>}
      {loading && <div className="cart-loading-small">Updating...</div>}
      <div className="cart-items">
        {items.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <h4>{item.name}</h4>
              <p className="cart-item-price">£{item.price.toFixed(2)}</p>
            </div>
            <div className="cart-item-controls">
              <div className="quantity-controls">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-total">
        {totals && (totals.discount > 0 || totals.tax > 0 || totals.shipping > 0) ? (
          // Show detailed breakdown when using Wix cart with additional charges
          <>
            <div className="cart-subtotal">
              <span>Subtotal:</span>
              <span>£{totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="cart-discount">
                <span>Discount:</span>
                <span className="discount-amount">-£{totals.discount.toFixed(2)}</span>
              </div>
            )}
            {totals.shipping > 0 && (
              <div className="cart-shipping">
                <span>Shipping:</span>
                <span>£{totals.shipping.toFixed(2)}</span>
              </div>
            )}
            {totals.tax > 0 && (
              <div className="cart-tax">
                <span>Tax:</span>
                <span>£{totals.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="cart-total-line">
              <h3>Total:</h3>
              <h3>£{totals.total.toFixed(2)}</h3>
            </div>
          </>
        ) : (
          // Simple total display
          <h3>Total: £{totalPrice.toFixed(2)}</h3>
        )}
        <button 
          onClick={handleCheckout} 
          className="checkout-btn"
          disabled={checkoutLoading || items.length === 0}
          title={useWixBackend ? '' : 'Cart is in local mode. Checkout requires Wix backend configuration.'}
        >
          {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
        </button>
        {!useWixBackend && items.length > 0 && (
          <p className="cart-local-mode-notice">
            Note: Your cart is stored locally. Wix checkout requires backend configuration.
          </p>
        )}
      </div>
    </div>
  )
}

Cart.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      quantity: PropTypes.number.isRequired,
    })
  ).isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  totalPrice: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  useWixBackend: PropTypes.bool,
  totals: PropTypes.shape({
    subtotal: PropTypes.number.isRequired,
    discount: PropTypes.number.isRequired,
    shipping: PropTypes.number.isRequired,
    tax: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }),
  isDrawerOpen: PropTypes.bool,
  onCloseDrawer: PropTypes.func,
}

export default Cart
