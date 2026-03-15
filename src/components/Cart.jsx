import { useState } from 'react'
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
}) {
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)

  const handleCheckout = async () => {
    if (items.length === 0) return

    setCheckoutLoading(true)
    setCheckoutError(null)

    try {
      // Always try to use Wix checkout flow
      const checkoutUrl = await initiateCheckout()
      
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

  if (items.length === 0) {
    return (
      <div className="cart">
        <h2>Shopping Cart</h2>
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
    <div className="cart">
      <h2>Shopping Cart</h2>
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
}

export default Cart
