import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getOrder, transformOrder } from '../services/wixCheckoutService'
import './OrderConfirmation.css'

/**
 * Order Confirmation Page
 * Displays after successful Wix checkout
 * Shows order details, items, shipping info, and order number
 */
export default function OrderConfirmation() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId)
    } else {
      setError('No order ID provided')
      setLoading(false)
    }
  }, [orderId])

  const loadOrder = async (id) => {
    try {
      setLoading(true)
      setError(null)
      
      const wixOrder = await getOrder(id)
      const transformedOrder = transformOrder(wixOrder)
      setOrder(transformedOrder)
    } catch (err) {
      console.error('Failed to load order:', err)
      setError('Unable to load order details. Please check your email for order confirmation.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="order-confirmation">
        <div className="order-loading">
          <div className="spinner"></div>
          <p>Loading your order details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="order-confirmation">
        <div className="order-error">
          <h1>⚠️ Order Information</h1>
          <p>{error}</p>
          <p>Order ID: {orderId}</p>
          <Link to="/" className="btn-primary">Return to Home</Link>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="order-confirmation">
        <div className="order-error">
          <h1>Order Not Found</h1>
          <p>We couldn't find the order you're looking for.</p>
          <Link to="/" className="btn-primary">Return to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="order-confirmation">
      <div className="order-header">
        <div className="success-icon">✓</div>
        <h1>Order Confirmed!</h1>
        <p className="order-number">Order #{order.number}</p>
        <p className="order-message">
          Thank you for your purchase. You will receive an order confirmation email shortly.
        </p>
      </div>

      <div className="order-details">
        <div className="order-section">
          <h2>Order Summary</h2>
          <div className="order-items">
            {order.items.map((item) => (
              <div key={item.id} className="order-item">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="order-item-image"
                  />
                )}
                <div className="order-item-details">
                  <h3>{item.name}</h3>
                  <p className="order-item-quantity">Quantity: {item.quantity}</p>
                  <p className="order-item-price">
                    ${item.price.toFixed(2)} × {item.quantity} = ${item.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="order-total-row">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="order-total-row discount">
                <span>Discount:</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            {order.shipping > 0 && (
              <div className="order-total-row">
                <span>Shipping:</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="order-total-row">
                <span>Tax:</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="order-total-row total">
              <span>Total:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {order.shippingInfo && (
          <div className="order-section">
            <h2>Shipping Address</h2>
            <div className="address-box">
              <p><strong>{order.shippingInfo.firstName} {order.shippingInfo.lastName}</strong></p>
              {order.shippingInfo.address && (
                <>
                  <p>{order.shippingInfo.address.addressLine1}</p>
                  {order.shippingInfo.address.addressLine2 && (
                    <p>{order.shippingInfo.address.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingInfo.address.city}, {order.shippingInfo.address.subdivision} {order.shippingInfo.address.postalCode}
                  </p>
                  <p>{order.shippingInfo.address.country}</p>
                </>
              )}
              {order.shippingInfo.phone && (
                <p>Phone: {order.shippingInfo.phone}</p>
              )}
            </div>
          </div>
        )}

        <div className="order-section">
          <h2>Order Status</h2>
          <div className="status-box">
            <div className="status-item">
              <span className="status-label">Payment Status:</span>
              <span className={`status-badge status-${order.paymentStatus?.toLowerCase().replace(/_/g, '-')}`}>
                {order.paymentStatus || 'Pending'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Fulfillment Status:</span>
              <span className={`status-badge status-${order.fulfillmentStatus?.toLowerCase().replace(/_/g, '-')}`}>
                {order.fulfillmentStatus || 'Processing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="order-actions">
        <Link to="/" className="btn-primary">Continue Shopping</Link>
        <button 
          className="btn-secondary"
          onClick={() => globalThis.print()}
        >
          Print Order
        </button>
      </div>

      <div className="order-footer">
        <p>Questions about your order? Contact us at support@example.com</p>
        <p className="order-date">
          Order placed on {new Date(order.createdDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
