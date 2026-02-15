import { loadStripe } from '@stripe/stripe-js'
import './Cart.css'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder')

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
  const handleCheckout = async () => {
    if (items.length === 0) return

    try {
      // TODO: Replace with actual Stripe checkout implementation
      const stripe = await stripePromise
      
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }
      
      // Create checkout session on your backend
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      })

      const session = await response.json()
      
      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      })

      if (result.error) {
        console.error(result.error.message)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout functionality requires backend setup')
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
        <button onClick={handleCheckout} className="checkout-btn">
          {useWixBackend ? 'Proceed to Checkout' : 'Checkout with Stripe'}
        </button>
      </div>
    </div>
  )
}

export default Cart
